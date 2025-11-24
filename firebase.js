// Remplacez ces valeurs par votre configuration Firebase si elle change
const firebaseConfig = {
    apiKey: "AIzaSyDB6rcdICZkqicjO5R4sKBPOcL4IFkVRzI",
    authDomain: "projet-aniversaire.firebaseapp.com",
    projectId: "projet-aniversaire",
    storageBucket: "projet-aniversaire.firebasestorage.app",
    messagingSenderId: "910528476811",
    appId: "1:910528476811:web:421b250d3e53f8ee89068e"
};

// Initialisation de Firebase
// Utilisez les versions 'compat' pour la compatibilité avec les scripts CDN
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/**
 * Fonction de connexion de l'utilisateur.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<firebase.UserCredential>}
 */
async function signInUser(email, password) {
    // Tente de connecter l'utilisateur via Firebase Auth
    return auth.signInWithEmailAndPassword(email, password);
}

/**
 * Fonction de déconnexion de l'utilisateur.
 */
function signOutUser() {
    return auth.signOut();
}

/**
 * Récupère le rôle et le nom complet d'un utilisateur depuis Firestore en utilisant son UID.
 * @param {string} uid - L'UID de l'utilisateur connecté (depuis Auth).
 * @returns {Promise<Object|null>} Un objet { role: string, name: string } ou null.
 */
async function getUserRole(uid) {
    if (!uid) return null;
    
    // Référence au document utilisateur dans la collection 'users'
    // Nous supposons que le document UID dans 'users' correspond à l'UID dans Auth.
    const docRef = db.collection("users").doc(uid);
    
    try {
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();
            // Retourne l'objet de données nécessaire pour l'interface
            return { 
                role: data.role || 'eleve', // Rôle par défaut 'eleve' si non défini
                name: data.fullName || 'Utilisateur',
                needsPasswordChange: data.needsPasswordChange || false, // Flag pour changement de mot de passe
                email: data.email || ''
            };
        } else {
            console.warn(`[Firestore] Document utilisateur non trouvé pour UID: ${uid}. Rôle par défaut 'eleve' assigné.`);
            return { role: 'eleve', name: 'Nouvel Élève', needsPasswordChange: false };
        }
    } catch (error) {
        console.error("[Firestore] Erreur lors de la récupération du rôle:", error);
        return { role: 'eleve', name: 'Erreur', needsPasswordChange: false }; // Retour de sécurité
    }
}

/**
 * Obtient tous les utilisateurs de la collection 'users' (pour le calendrier).
 * @returns {Promise<Array<Object>>} Tableau d'objets utilisateur.
 */
async function getAllUsers() {
    const snapshot = await db.collection("users").get();
    return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Normaliser le nom si 'fullName' existe, sinon utiliser 'name' ou 'email'
        name: doc.data().fullName || doc.data().name || doc.data().email
    }));
}


// --- Fonctions de Gestion (pour Admin/Comité) ---

/**
 * Ajoute ou modifie les données Firestore d'un utilisateur.
 * Note: Cette fonction NE modifie PAS le mot de passe dans Firebase Auth.
 * @param {string} uid - L'UID de l'utilisateur à modifier.
 * @param {Object} data - Les champs à mettre à jour ({ fullName, role, birthday, etc. }).
 */
async function updateUserData(uid, data) {
    if (!uid) throw new Error("UID de l'utilisateur manquant pour la mise à jour.");
    const userDocRef = db.collection("users").doc(uid);
    
    // Les Firestore Rules vont bloquer cette action si l'utilisateur n'est pas autorisé.
    await userDocRef.set(data, { merge: true }); 
    console.log(`Données utilisateur ${uid} mises à jour.`);
}

/**
 * Supprime un document utilisateur (nécessite le rôle 'admin').
 * @param {string} uid - L'UID de l'utilisateur à supprimer.
 */
async function deleteUserDocument(uid) {
    if (!uid) throw new Error("UID de l'utilisateur manquant pour la suppression.");
    // Note: Pour une solution complète, l'admin devrait aussi supprimer l'utilisateur de Firebase Auth 
    // (ce qui nécessite le Firebase Admin SDK, donc généralement une Cloud Function).
    return db.collection("users").doc(uid).delete();
}

// --- Fonctions de Logging d'Activité ---

/**
 * Codes courts pour les actions (compression)
 */
const ACTION_CODES = {
    'page_load': 'pl',
    'page_unload': 'pu',
    'button_click': 'clk',
    'form_submit': 'fs',
    'form_change': 'fc',
    'key_press': 'kp',
    'scroll': 'scr',
    'window_focus': 'wf',
    'window_blur': 'wb',
    'window_resize': 'wr',
    'javascript_error': 'err',
    'unhandled_promise_rejection': 'upr',
    'session_update': 'su',
    'login': 'lg',
    'logout': 'lo',
    'create': 'cr',
    'update': 'up',
    'delete': 'del'
};

/**
 * Compresse les détails en utilisant des noms de champs courts
 */
function compressLogDetails(details) {
    const compressed = {};
    const fieldMap = {
        'description': 'd',
        'elementClicked': 'el',
        'tagName': 'tag',
        'id': 'id',
        'className': 'cls',
        'textContent': 'txt',
        'href': 'href',
        'buttonType': 'type',
        'formId': 'fid',
        'formAction': 'act',
        'formData': 'fd',
        'elementName': 'name',
        'elementType': 'type',
        'newValue': 'val',
        'key': 'key',
        'keyCode': 'kc',
        'ctrlKey': 'ctrl',
        'shiftKey': 'shift',
        'altKey': 'alt',
        'scrollY': 'y',
        'scrollX': 'x',
        'documentHeight': 'h',
        'viewportHeight': 'vh',
        'page': 'p',
        'referrer': 'ref',
        'sessionDuration': 'dur',
        'clickCount': 'clk',
        'keyPressCount': 'key',
        'scrollCount': 'scr',
        'newSize': 'sz',
        'errorMessage': 'msg',
        'errorFile': 'file',
        'errorLine': 'line',
        'errorReason': 'reason',
        'timeOnPage': 'top',
        'email': 'em',
        'role': 'r',
        'modifiers': 'mod',
        'modifiedData': 'md',
        'location': 'loc'
    };

    for (const [key, value] of Object.entries(details)) {
        const shortKey = fieldMap[key] || key.substring(0, 3);
        
        // Compresser les valeurs selon le type
        if (typeof value === 'string' && value.length > 50) {
            compressed[shortKey] = value.substring(0, 50);
        } else if (value === null || value === undefined || value === '') {
            // Ne pas inclure les valeurs vides
            continue;
        } else if (typeof value === 'object' && value !== null) {
            // Compresser les objets JSON
            try {
                const jsonStr = JSON.stringify(value);
                compressed[shortKey] = jsonStr.length > 200 ? jsonStr.substring(0, 200) : jsonStr;
            } catch (e) {
                compressed[shortKey] = '[Object]';
            }
        } else {
            compressed[shortKey] = value;
        }
    }

    return compressed;
}

/**
 * Enregistre une activité utilisateur dans Firestore (OPTIMISÉ avec compression).
 * @param {string} userId - UID de l'utilisateur.
 * @param {string} action - Type d'action (ex: 'login', 'button_click', 'update').
 * @param {Object} details - Détails supplémentaires (optionnel).
 */
async function logActivity(userId, action, details = {}) {
    if (!userId) return; // Ne pas logger si pas d'utilisateur

    try {
        // Convertir l'action en code court
        const actionCode = ACTION_CODES[action] || action.substring(0, 5);

        // Créer le log compressé (sans dupliquer les infos système à chaque fois)
        const logData = {
            uid: userId, // UID court
            a: actionCode, // Action code
            t: firebase.firestore.FieldValue.serverTimestamp(),
            p: window.location.pathname ? window.location.pathname.substring(0, 30) : '?', // Page (limité)
            ...compressLogDetails(details)
        };

        // Ajouter seulement les infos système essentielles si pas déjà dans details
        if (!details.skipSystemInfo) {
            // Infos système minimales (une seule fois par session normalement)
            logData.ua = navigator.userAgent ? navigator.userAgent.substring(0, 80) : '?';
            logData.lang = navigator.language || '?';
            logData.res = `${screen.width}x${screen.height}`;
            logData.dev = /Mobi|Android/i.test(navigator.userAgent) ? 'm' : 'd'; // m=mobile, d=desktop
        }

        // Ajouter à Firestore
        await db.collection('activity_logs').add(logData);
        console.log(`[Log] ${actionCode} pour ${userId.substring(0, 8)}...`);
    } catch (error) {
        console.error('Erreur lors du logging de l\'activité:', error);
    }
}