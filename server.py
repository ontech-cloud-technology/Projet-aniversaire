#!/usr/bin/env python3
"""
Serveur HTTP simple pour servir les fichiers statiques du projet.
Usage: python server.py [--port PORT] [--host HOST]
"""

import http.server
import socketserver
import argparse
import os
import sys
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Gestionnaire de requêtes HTTP personnalisé."""
    
    def end_headers(self):
        # Ajouter des en-têtes CORS si nécessaire
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Personnaliser les messages de log."""
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    """Fonction principale du serveur."""
    parser = argparse.ArgumentParser(
        description='Serveur HTTP simple pour le projet',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
  python server.py                    # Lance sur localhost:8000
  python server.py --port 3000        # Lance sur localhost:3000
  python server.py --host 0.0.0.0     # Accessible depuis le réseau
  python server.py --port 8080 --host 0.0.0.0
        """
    )
    
    parser.add_argument(
        '--port', '-p',
        type=int,
        default=8000,
        help='Port sur lequel le serveur écoute (défaut: 8000)'
    )
    
    parser.add_argument(
        '--host', '-H',
        type=str,
        default='localhost',
        help='Adresse IP sur laquelle le serveur écoute (défaut: localhost)'
    )
    
    args = parser.parse_args()
    
    # Changer vers le répertoire du script
    script_dir = Path(__file__).parent.absolute()
    os.chdir(script_dir)
    
    # Créer le serveur
    try:
        with socketserver.TCPServer((args.host, args.port), CustomHTTPRequestHandler) as httpd:
            host_display = args.host if args.host != '0.0.0.0' else 'localhost'
            print(f"\n{'='*60}")
            print(f"Serveur HTTP démarré avec succès!")
            print(f"{'='*60}")
            print(f"URL: http://{host_display}:{args.port}")
            print(f"Répertoire: {script_dir}")
            print(f"{'='*60}")
            print(f"\nAppuyez sur Ctrl+C pour arrêter le serveur\n")
            
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"Erreur: Le port {args.port} est déjà utilisé.")
            print(f"Essayez avec un autre port: python server.py --port {args.port + 1}")
        else:
            print(f"Erreur: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\nServeur arrêté par l'utilisateur.")
        sys.exit(0)

if __name__ == '__main__':
    main()




