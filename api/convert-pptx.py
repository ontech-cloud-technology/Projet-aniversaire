#!/usr/bin/env python3
"""
API Flask pour convertir des fichiers PowerPoint en images PNG
Usage: python api/convert-pptx.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import tempfile
import subprocess
import zipfile
from pathlib import Path
import requests
from io import BytesIO

app = Flask(__name__)
CORS(app)  # Permettre les requêtes cross-origin

# Configuration Supabase
SUPABASE_URL = 'https://avtvanaglunqsipblmvf.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dHZhbmFnbHVucXNpcGJsbXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjA5MzksImV4cCI6MjA3ODgzNjkzOX0.lb_kiHMJPvCq8oAk5hLE-NGENEq7FxGisttiixeD1KQ'
BUCKET_NAME = 'presentations'

def check_command(command):
    """Vérifier si une commande est disponible"""
    try:
        subprocess.run(['which', command], check=True, capture_output=True)
        return True
    except:
        return False

def convert_pptx_to_images(pptx_path, output_dir, presentation_name):
    """
    Convertir un fichier PPTX en images PNG
    Retourne le nombre de slides créées
    """
    sanitized_name = ''.join(c if c.isalnum() or c in '-_' else '-' for c in presentation_name).lower()
    slides_dir = os.path.join(output_dir, sanitized_name)
    os.makedirs(slides_dir, exist_ok=True)
    
    # Étape 1: Convertir PPTX en PDF avec LibreOffice
    temp_dir = tempfile.mkdtemp()
    pdf_path = os.path.join(temp_dir, 'presentation.pdf')
    
    try:
        # Utiliser soffice (LibreOffice)
        libreoffice_cmd = 'soffice' if check_command('soffice') else 'libreoffice'
        
        result = subprocess.run(
            [libreoffice_cmd, '--headless', '--convert-to', 'pdf', 
             '--outdir', temp_dir, pptx_path],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"Erreur LibreOffice: {result.stderr}")
        
        if not os.path.exists(pdf_path):
            raise Exception("Le PDF n'a pas été créé")
        
        # Étape 2: Convertir PDF en images PNG
        # Méthode 1: pdftoppm (poppler-utils)
        if check_command('pdftoppm'):
            subprocess.run(
                ['pdftoppm', '-png', '-r', '300', pdf_path, 
                 os.path.join(slides_dir, 'slide')],
                check=True
            )
            
            # Renommer les fichiers
            files = sorted([f for f in os.listdir(slides_dir) if f.startswith('slide-') and f.endswith('.png')])
            for idx, file in enumerate(files, 1):
                old_path = os.path.join(slides_dir, file)
                new_path = os.path.join(slides_dir, f'slide-{idx}.png')
                if old_path != new_path:
                    os.rename(old_path, new_path)
        
        # Méthode 2: ImageMagick
        elif check_command('convert'):
            subprocess.run(
                ['convert', '-density', '300', pdf_path, 
                 os.path.join(slides_dir, 'slide-%d.png')],
                check=True
            )
        
        # Méthode 3: Python pdf2image
        else:
            try:
                from pdf2image import convert_from_path
                images = convert_from_path(pdf_path, dpi=300)
                for idx, image in enumerate(images, 1):
                    image.save(os.path.join(slides_dir, f'slide-{idx}.png'), 'PNG')
            except ImportError:
                raise Exception("Aucun outil de conversion disponible (pdftoppm, convert, ou pdf2image)")
        
        # Compter les slides créées
        slides = [f for f in os.listdir(slides_dir) if f.startswith('slide-') and f.endswith('.png')]
        return len(slides), slides_dir
        
    finally:
        # Nettoyer le dossier temporaire
        import shutil
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)

def upload_slide_to_supabase(presentation_name, slide_number, image_path):
    """Upload une slide vers Supabase Storage"""
    sanitized_name = ''.join(c if c.isalnum() or c in '-_' else '-' for c in presentation_name).lower()
    file_path = f'slides/{sanitized_name}/slide-{slide_number}.png'
    
    with open(image_path, 'rb') as f:
        image_data = f.read()
    
    url = f'{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{file_path}'
    headers = {
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'image/png',
        'x-upsert': 'true',
        'apikey': SUPABASE_KEY
    }
    
    response = requests.post(url, headers=headers, data=image_data)
    response.raise_for_status()
    
    return f'{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{file_path}'

@app.route('/convert', methods=['POST'])
def convert_pptx():
    """Endpoint pour convertir un PPTX en images"""
    try:
        data = request.json
        presentation_name = data.get('presentationName')
        pptx_url = data.get('pptxUrl')
        
        if not presentation_name or not pptx_url:
            return jsonify({'error': 'presentationName et pptxUrl sont requis'}), 400
        
        # Télécharger le fichier PPTX depuis Supabase
        response = requests.get(pptx_url)
        response.raise_for_status()
        
        # Sauvegarder temporairement
        temp_dir = tempfile.mkdtemp()
        pptx_path = os.path.join(temp_dir, 'presentation.pptx')
        
        with open(pptx_path, 'wb') as f:
            f.write(response.content)
        
        try:
            # Convertir en images
            slides_count, slides_dir = convert_pptx_to_images(pptx_path, temp_dir, presentation_name)
            
            # Upload chaque slide vers Supabase
            uploaded_slides = []
            for i in range(1, slides_count + 1):
                slide_path = os.path.join(slides_dir, f'slide-{i}.png')
                if os.path.exists(slide_path):
                    slide_url = upload_slide_to_supabase(presentation_name, i, slide_path)
                    uploaded_slides.append(slide_url)
            
            return jsonify({
                'success': True,
                'slidesCount': slides_count,
                'slides': uploaded_slides,
                'message': f'Présentation convertie avec succès! {slides_count} slides créées.'
            })
            
        finally:
            # Nettoyer
            import shutil
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)
                
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Endpoint de santé"""
    tools = {
        'libreoffice': check_command('soffice') or check_command('libreoffice'),
        'pdftoppm': check_command('pdftoppm'),
        'imagemagick': check_command('convert'),
        'python_pdf2image': False
    }
    
    try:
        import pdf2image
        tools['python_pdf2image'] = True
    except:
        pass
    
    return jsonify({
        'status': 'ok',
        'tools': tools
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)


