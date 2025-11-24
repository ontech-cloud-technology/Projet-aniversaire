/**
 * Système de gestion des présentations PowerPoint avec Supabase Storage
 */

class PresentationStorage {
    constructor() {
        this.supabaseUrl = 'https://avtvanaglunqsipblmvf.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dHZhbmFnbHVucXNpcGJsbXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjA5MzksImV4cCI6MjA3ODgzNjkzOX0.lb_kiHMJPvCq8oAk5hLE-NGENEq7FxGisttiixeD1KQ';
        // Clé service_role pour créer le bucket (à utiliser UNIQUEMENT pour la création, jamais en production publique)
        this.serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dHZhbmFnbHVucXNpcGJsbXZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzI2MDkzOSwiZXhwIjoyMDc4ODM2OTM5fQ.O6dVUaWg-XmoOr2B5vvZAiGE6DVgrWgcq8Qq9jLc8RU';
        this.bucketName = 'presentations';
    }

    /**
     * Upload un fichier PowerPoint vers Supabase
     */
    async uploadPresentation(file, presentationName) {
        try {
            // Vérifier que le fichier est un PPTX
            if (!file.name.endsWith('.pptx')) {
                throw new Error('Le fichier doit être un PowerPoint (.pptx)');
            }

            // Limiter la taille (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                throw new Error('Le fichier est trop grand (max 50MB)');
            }

            // Créer un nom de fichier unique basé sur le nom de la présentation
            const sanitizedName = presentationName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
            const timestamp = Date.now();
            const fileName = `${sanitizedName}-${timestamp}.pptx`;
            const filePath = `pptx/${fileName}`;

            // Convertir le fichier en ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();

            // Upload vers Supabase Storage
            const response = await fetch(`${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${filePath}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'x-upsert': 'true',
                    'Cache-Control': '3600',
                    'apikey': this.supabaseKey
                },
                body: arrayBuffer
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = errorText;
                
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || errorText;
                } catch (e) {
                    // Garder le texte brut
                }
                
                // Si erreur RLS (403)
                if (response.status === 403 || errorMessage.includes('row-level security') || errorMessage.includes('RLS')) {
                    const rlsError = new Error('Erreur RLS: Les policies du bucket bloquent l\'upload');
                    rlsError.isRLSError = true;
                    rlsError.details = 'Configurez les policies RLS du bucket "presentations" :\n' +
                        '1. Allez dans Supabase Dashboard > Storage > presentations > Policies\n' +
                        '2. Créez une policy INSERT avec la définition: true\n' +
                        '3. Créez une policy SELECT avec la définition: true';
                    throw rlsError;
                }
                
                throw new Error(`Erreur lors de l'upload: ${errorMessage}`);
            }

            // Stocker le nom original dans localStorage pour référence future
            // (solution temporaire - idéalement utiliser Firestore)
            const storageKey = `presentation-name-${sanitizedName}-${timestamp}`;
            try {
                localStorage.setItem(storageKey, presentationName);
            } catch (e) {
                console.warn('Impossible de stocker le nom dans localStorage:', e);
            }
            
            // Retourner les informations de la présentation
            return {
                fileName: fileName,
                filePath: filePath,
                presentationName: presentationName,
                sanitizedName: sanitizedName,
                uploadDate: new Date().toISOString(),
                url: `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${filePath}`
            };

        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            throw error;
        }
    }

    /**
     * Créer le bucket "presentations"
     * Utilise la clé service_role pour avoir les permissions nécessaires
     */
    async createBucket(useServiceRole = false) {
        try {
            // Utiliser service_role uniquement si demandé (pour créer le bucket)
            const apiKey = useServiceRole ? this.serviceRoleKey : this.supabaseKey;
            
            const response = await fetch(`${this.supabaseUrl}/storage/v1/bucket`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'apikey': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.bucketName,
                    public: true,
                    file_size_limit: 52428800, // 50MB
                    allowed_mime_types: [
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'image/png',
                        'image/jpeg'
                    ]
                })
            });

            if (response.ok) {
                // Attendre un peu pour que Supabase propage les changements
                await new Promise(resolve => setTimeout(resolve, 2000));
                return { success: true, message: 'Bucket créé avec succès! Attendez quelques secondes...' };
            } else {
                const errorText = await response.text();
                let errorMessage = errorText;
                
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || errorText;
                } catch (e) {
                    // Garder le texte brut
                }

                // Si le bucket existe déjà
                if (response.status === 409 || errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
                    return { success: true, message: 'Le bucket existe déjà' };
                }

                // Si erreur de permissions (403) ou RLS policy (400)
                if (response.status === 403 || response.status === 400 || 
                    errorMessage.includes('permission') || 
                    errorMessage.includes('unauthorized') || 
                    errorMessage.includes('row-level security') ||
                    errorMessage.includes('RLS')) {
                    return { 
                        success: false, 
                        message: 'Création automatique impossible',
                        details: useServiceRole 
                            ? 'Même avec la clé service_role, la création a échoué. Cela peut être dû à des restrictions Supabase. Créez le bucket manuellement dans Supabase Dashboard.'
                            : 'La création de bucket nécessite des permissions administrateur. Créez le bucket manuellement dans Supabase Dashboard (voir instructions ci-dessous).',
                        requiresManualCreation: true,
                        errorDetails: errorMessage
                    };
                }

                return { success: false, message: `Erreur ${response.status}: ${errorMessage}`, errorDetails: errorMessage };
            }
        } catch (error) {
            return { success: false, message: `Erreur: ${error.message}` };
        }
    }

    /**
     * Lister tous les buckets disponibles
     */
    async listAllBuckets() {
        try {
            const response = await fetch(`${this.supabaseUrl}/storage/v1/bucket`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'apikey': this.supabaseKey
                }
            });
            
            if (response.ok) {
                const buckets = await response.json();
                return buckets || [];
            }
            return [];
        } catch (error) {
            console.error('Erreur lors de la liste des buckets:', error);
            return [];
        }
    }

    /**
     * Vérifier si le bucket existe
     * Essaie plusieurs méthodes car l'API peut retourner 400 même si le bucket existe
     */
    async checkBucketExists() {
        try {
            // Méthode 1: Vérifier directement le bucket
            const response = await fetch(`${this.supabaseUrl}/storage/v1/bucket/${this.bucketName}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'apikey': this.supabaseKey
                }
            });
            
            if (response.ok) {
                return true;
            }
            
            // Méthode 2: Si erreur 400, essayer de lister les fichiers (si le bucket existe mais les permissions sont restrictives)
            if (response.status === 400 || response.status === 403) {
                try {
                    const listResponse = await fetch(`${this.supabaseUrl}/storage/v1/object/list/${this.bucketName}?limit=1`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${this.supabaseKey}`,
                            'apikey': this.supabaseKey
                        }
                    });
                    
                    // Si on peut lister (même vide), le bucket existe
                    if (listResponse.ok || listResponse.status === 200) {
                        return true;
                    }
                    
                    // Si erreur 404, le bucket n'existe vraiment pas
                    if (listResponse.status === 404) {
                        return false;
                    }
                    
                    // Pour les autres erreurs (403, 400), on ne peut pas être sûr
                    // On retourne false pour forcer la création
                    return false;
                } catch (e) {
                    // En cas d'erreur, on assume que le bucket n'existe pas
                    return false;
                }
            }
            
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Lister toutes les présentations disponibles
     */
    async listPresentations() {
        try {
            // Essayer directement de lister les fichiers (plus fiable que checkBucketExists)
            // Si le bucket n'existe pas, on aura une erreur 404
            // Si les permissions sont restrictives, on aura une erreur 403/400 mais on peut quand même essayer

            // Essayer plusieurs endpoints possibles
            let files = [];
            let lastError = null;
            let bucketNotFound = false;

            // Méthode 1: Endpoint standard avec prefix
            try {
                const response = await fetch(`${this.supabaseUrl}/storage/v1/object/list/${this.bucketName}?prefix=pptx/&limit=100`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'apikey': this.supabaseKey,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        files = data;
                    }
                } else {
                    const errorText = await response.text();
                    lastError = errorText;
                    
                    // Si erreur 404, le bucket n'existe vraiment pas
                    if (response.status === 404) {
                        bucketNotFound = true;
                    }
                }
            } catch (e) {
                lastError = e.message;
            }

            // Méthode 2: Essayer sans prefix si la première méthode échoue
            if (files.length === 0) {
                try {
                    const response = await fetch(`${this.supabaseUrl}/storage/v1/object/list/${this.bucketName}?limit=1000`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${this.supabaseKey}`,
                            'apikey': this.supabaseKey,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (Array.isArray(data)) {
                            // Filtrer pour ne garder que les fichiers dans pptx/
                            files = data.filter(f => f.name && f.name.startsWith('pptx/') && f.name.endsWith('.pptx'));
                        }
                    }
                } catch (e) {
                    console.warn('Méthode alternative échouée:', e);
                }
            }

            // Si bucket non trouvé, lever une erreur
            if (bucketNotFound) {
                console.warn('Le bucket "presentations" n\'existe pas. Créez-le dans Supabase Dashboard.');
                throw new Error('Bucket not found');
            }
            
            // Si toujours rien, vérifier les permissions
            if (files.length === 0 && lastError) {
                const errorMsg = typeof lastError === 'string' ? lastError : JSON.stringify(lastError);
                if (errorMsg.includes('Bucket not found') || errorMsg.includes('not found')) {
                    throw new Error('Bucket not found');
                }
                if (errorMsg.includes('permission') || errorMsg.includes('policy') || errorMsg.includes('unauthorized')) {
                    throw new Error('Permissions insuffisantes. Vérifiez les policies RLS du bucket.');
                }
                // Si pas d'erreur claire mais aucun fichier, c'est peut-être juste vide
                console.warn('Aucun fichier trouvé. Le bucket existe peut-être mais est vide, ou les permissions sont restrictives.');
            }
            
            // Si la réponse est un tableau vide ou null, retourner un tableau vide
            if (!files || !Array.isArray(files)) {
                return [];
            }
            
            // Filtrer et formater les présentations
            return files
                .filter(file => file.name && file.name.endsWith('.pptx'))
                .map(file => {
                    // Extraire le nom de la présentation depuis le nom de fichier
                    // Format: pptx/nom-presentation-timestamp.pptx
                    let presentationName = '';
                    
                    if (file.name.startsWith('pptx/')) {
                        const baseName = file.name.replace('pptx/', '').replace('.pptx', '');
                        // Enlever le timestamp à la fin (dernier segment après le dernier tiret)
                        const parts = baseName.split('-');
                        let timestamp = '';
                        if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
                            timestamp = parts.pop();
                        }
                        const sanitizedName = parts.join('-');
                        
                        // Essayer de récupérer le nom original depuis localStorage
                        const storageKey = `presentation-name-${sanitizedName}-${timestamp}`;
                        try {
                            const storedName = localStorage.getItem(storageKey);
                            if (storedName) {
                                presentationName = storedName;
                            }
                        } catch (e) {
                            // localStorage non disponible
                        }
                        
                        // Si pas trouvé, formater le nom sanitized
                        if (!presentationName) {
                            // Capitaliser la première lettre de chaque mot
                            presentationName = sanitizedName
                                .split('-')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                        }
                    } else {
                        presentationName = file.name.replace('.pptx', '');
                    }
                    
                    return {
                        fileName: file.name,
                        presentationName: presentationName,
                        uploadDate: file.created_at || file.updated_at || new Date().toISOString(),
                        url: `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${file.name}`
                    };
                })
                .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)); // Plus récent en premier
        } catch (error) {
            console.error('Erreur lors de la liste des présentations:', error);
            return [];
        }
    }

    /**
     * Récupérer les slides d'une présentation (images PNG)
     */
    async getPresentationSlides(presentationName) {
        try {
            const sanitizedName = presentationName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
            const prefix = `slides/${sanitizedName}/`;

            const response = await fetch(`${this.supabaseUrl}/storage/v1/object/list/${this.bucketName}?prefix=${encodeURIComponent(prefix)}&limit=100`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'apikey': this.supabaseKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Si erreur 404 ou 400, retourner un tableau vide (pas de slides)
                if (response.status === 404 || response.status === 400) {
                    return [];
                }
                console.error('Erreur lors de la récupération des slides:', response.status);
                return [];
            }

            const files = await response.json();
            
            // Si la réponse n'est pas un tableau, retourner un tableau vide
            if (!Array.isArray(files)) {
                return [];
            }
            
            // Filtrer les images PNG et les trier
            return files
                .filter(file => file.name.endsWith('.png'))
                .map(file => ({
                    name: file.name,
                    url: `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${file.name}`
                }))
                .sort((a, b) => {
                    // Extraire le numéro de slide depuis le nom de fichier
                    const numA = parseInt(a.name.match(/slide-(\d+)\.png$/)?.[1] || '0');
                    const numB = parseInt(b.name.match(/slide-(\d+)\.png$/)?.[1] || '0');
                    return numA - numB;
                });
        } catch (error) {
            console.error('Erreur lors de la récupération des slides:', error);
            return [];
        }
    }

    /**
     * Vérifier si une présentation a été convertie (a des slides)
     */
    async isPresentationConverted(presentationName) {
        const slides = await this.getPresentationSlides(presentationName);
        return slides.length > 0;
    }

    /**
     * Upload une image de slide vers Supabase
     */
    async uploadSlide(presentationName, slideNumber, imageBlob) {
        try {
            const sanitizedName = presentationName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
            const fileName = `slide-${slideNumber}.png`;
            const filePath = `slides/${sanitizedName}/${fileName}`;

            const response = await fetch(`${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${filePath}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'image/png',
                    'x-upsert': 'true',
                    'apikey': this.supabaseKey
                },
                body: imageBlob
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur lors de l'upload de la slide: ${errorText}`);
            }

            return `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${filePath}`;
        } catch (error) {
            console.error('Erreur lors de l\'upload de la slide:', error);
            throw error;
        }
    }
}

// Exposer globalement
window.PresentationStorage = PresentationStorage;

