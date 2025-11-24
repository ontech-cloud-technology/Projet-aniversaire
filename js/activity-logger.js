/**
 * Système de logging automatique des activités utilisateur (OPTIMISÉ)
 * Capture automatiquement toutes les interactions avec compression des données
 */

class ActivityLogger {
    constructor() {
        this.currentUserId = null;
        this.sessionStartTime = Date.now();
        this.lastActivityTime = Date.now();
        this.pageLoadTime = Date.now();
        this.clickCount = 0;
        this.keyPressCount = 0;
        this.scrollCount = 0;
        this.initialized = false;
        this.sessionInfo = null; // Infos système stockées une seule fois par session
        this.pendingLogs = []; // Batch de logs en attente
        this.batchTimeout = null;
        this.clickAggregation = {}; // Agrégation des clics similaires
        this.lastClickTime = {};
    }

    /**
     * Codes courts pour les actions (compression)
     */
    static ACTION_CODES = {
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
     * Initialise le système de logging
     */
    async init() {
        if (this.initialized) return;

        // Attendre que Firebase soit chargé
        if (typeof firebase === 'undefined' || !firebase.auth) {
            setTimeout(() => this.init(), 100);
            return;
        }

        // Attendre l'authentification de l'utilisateur
        const user = await new Promise(resolve => {
            const unsubscribe = firebase.auth().onAuthStateChanged(u => {
                unsubscribe();
                resolve(u);
            });
        });

        if (!user) {
            return;
        }

        this.currentUserId = user.uid;
        this.initialized = true;

        // Charger/créer les infos de session (une seule fois)
        await this.loadSessionInfo();

        // Logger le chargement de la page
        await this.logPageLoad();

        // Configurer les écouteurs d'événements
        this.setupEventListeners();

        // Logger la déconnexion quand l'utilisateur quitte
        window.addEventListener('beforeunload', () => {
            this.flushPendingLogs();
            this.logPageUnload();
        });

        // Flush périodique des logs en batch
        setInterval(() => {
            this.flushPendingLogs();
        }, 10000); // Toutes les 10 secondes
    }

    /**
     * Charge ou crée les informations de session (stockées une seule fois)
     */
    async loadSessionInfo() {
        const sessionId = `sess_${this.currentUserId}_${Date.now()}`;
        
        // Collecter les infos système une seule fois
        const sysInfo = {
            ua: navigator.userAgent.substring(0, 100), // Limiter la taille
            lang: navigator.language,
            res: `${screen.width}x${screen.height}`,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookies: navigator.cookieEnabled,
            js: true,
            dev: /Mobi|Android/i.test(navigator.userAgent) ? 'm' : 'd', // m=mobile, d=desktop
            os: navigator.platform.substring(0, 20),
            plugins: navigator.plugins ? navigator.plugins.length : 0,
            touch: 'ontouchstart' in window
        };

        // Récupérer l'IP une seule fois
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            if (ipResponse.ok) {
                const ipData = await ipResponse.json();
                sysInfo.ip = ipData.ip;
            }
        } catch (error) {
            sysInfo.ip = '?';
        }

        // Récupérer batterie une seule fois
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                sysInfo.bat = Math.round(battery.level * 100);
                sysInfo.batChg = battery.charging;
            } catch (error) {
                sysInfo.bat = null;
            }
        }

        // Récupérer connexion réseau une seule fois
        if ('connection' in navigator) {
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (conn) {
                sysInfo.conn = conn.effectiveType || '?';
                sysInfo.down = conn.downlink || null;
                sysInfo.rtt = conn.rtt || null;
            }
        }

        // Stocker dans Firestore (une seule fois par session)
        try {
            await firebase.firestore().collection('session_info').doc(sessionId).set({
                uid: this.currentUserId,
                start: firebase.firestore.FieldValue.serverTimestamp(),
                ...sysInfo
            }, { merge: true });
            
            this.sessionInfo = { id: sessionId, ...sysInfo };
        } catch (error) {
            console.warn('Erreur lors du stockage des infos de session:', error);
            this.sessionInfo = { id: sessionId, ...sysInfo };
        }
    }

    /**
     * Configure tous les écouteurs d'événements pour capturer les activités
     */
    setupEventListeners() {
        // Capturer les clics (avec agrégation)
        let clickThrottle = {};
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') return;
            
            const key = `${target.tagName}_${target.id || target.className || 'no-id'}`;
            const now = Date.now();
            
            // Agrégation : grouper les clics similaires dans les 5 secondes
            if (clickThrottle[key] && (now - clickThrottle[key]) < 5000) {
                this.clickAggregation[key] = (this.clickAggregation[key] || 0) + 1;
                return;
            }
            
            clickThrottle[key] = now;
            this.handleClick(e, this.clickAggregation[key] || 0);
            this.clickAggregation[key] = 0;
        }, true);

        // Capturer les soumissions de formulaires
        document.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        }, true);

        // Capturer les changements de champs de formulaire (seulement importants)
        document.addEventListener('change', (e) => {
            const element = e.target;
            if (element.type === 'text' || element.type === 'email' || element.type === 'textarea') {
                return;
            }
            this.handleFormChange(e);
        }, true);

        // Capturer seulement les touches importantes
        document.addEventListener('keydown', (e) => {
            if (['Enter', 'Escape', 'Tab', 'F5'].includes(e.key)) {
                this.handleKeyPress(e);
            }
        });

        // Capturer le défilement (limité à toutes les 5 secondes)
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 5000);
        });

        // Capturer les changements de focus (seulement si changement significatif)
        let lastFocusState = document.hasFocus();
        setInterval(() => {
            const currentFocus = document.hasFocus();
            if (currentFocus !== lastFocusState) {
                lastFocusState = currentFocus;
                this.logActivity(currentFocus ? 'window_focus' : 'window_blur', {});
            }
        }, 30000); // Vérifier toutes les 30 secondes

        // Capturer les erreurs JavaScript
        window.addEventListener('error', (e) => {
            this.logActivity('javascript_error', {
                msg: e.message?.substring(0, 100),
                file: e.filename?.substring(0, 50),
                line: e.lineno
            });
        });

        // Capturer les erreurs de promesses non gérées
        window.addEventListener('unhandledrejection', (e) => {
            this.logActivity('unhandled_promise_rejection', {
                reason: e.reason?.toString()?.substring(0, 100) || '?'
            });
        });
    }

    /**
     * Gère les clics sur les éléments (optimisé)
     */
    async handleClick(e, aggregatedCount = 0) {
        this.clickCount++;
        const target = e.target;
        
        // Données minimales
        const elementInfo = {
            tag: target.tagName,
            id: target.id || null,
            cls: target.className?.substring(0, 30) || null, // Limiter la taille
            txt: target.textContent?.trim().substring(0, 30) || null
        };

        // Ajouter seulement si pertinent
        if (target.href) elementInfo.href = target.href.substring(0, 50);
        if (target.type) elementInfo.type = target.type;
        if (aggregatedCount > 0) elementInfo.agg = aggregatedCount; // Nombre de clics agrégés

        await this.logActivity('button_click', elementInfo);
    }

    /**
     * Gère les soumissions de formulaires (optimisé)
     */
    async handleFormSubmit(e) {
        const form = e.target;
        const formData = {};
        
        // Collecter seulement les noms de champs (pas les valeurs pour économiser l'espace)
        const fields = [];
        Array.from(form.elements).forEach(element => {
            if (element.name && element.type !== 'password') {
                fields.push(element.name);
            }
        });

        await this.logActivity('form_submit', {
            fid: form.id || null,
            act: form.action || null,
            fields: fields.length > 0 ? fields.join(',') : null
        });
    }

    /**
     * Gère les changements dans les formulaires (optimisé)
     */
    async handleFormChange(e) {
        const element = e.target;
        
        await this.logActivity('form_change', {
            name: element.name || null,
            type: element.type || null
            // Ne pas logger la valeur pour économiser l'espace
        });
    }

    /**
     * Gère les touches du clavier (optimisé)
     */
    async handleKeyPress(e) {
        this.keyPressCount++;
        
        await this.logActivity('key_press', {
            key: e.key,
            mod: (e.ctrlKey ? 'c' : '') + (e.shiftKey ? 's' : '') + (e.altKey ? 'a' : '') || null
        });
    }

    /**
     * Gère le défilement (optimisé)
     */
    async handleScroll() {
        this.scrollCount++;
        await this.logActivity('scroll', {
            y: Math.round(window.scrollY / 100) * 100, // Arrondir à 100px près
            h: Math.round(document.documentElement.scrollHeight / 100) * 100
        });
    }

    /**
     * Log le chargement de la page (optimisé)
     */
    async logPageLoad() {
        await this.logActivity('page_load', {
            p: window.location.pathname.substring(0, 50),
            ref: document.referrer ? document.referrer.substring(0, 50) : null
        });
    }

    /**
     * Log le déchargement de la page (optimisé)
     */
    async logPageUnload() {
        const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        
        await this.logActivity('page_unload', {
            dur: sessionDuration,
            clk: this.clickCount,
            key: this.keyPressCount,
            scr: this.scrollCount
        });
    }

    /**
     * Met à jour la durée de session (moins fréquent)
     */
    async updateSessionDuration() {
        const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        
        await this.logActivity('session_update', {
            dur: sessionDuration
        });
    }

    /**
     * Fonction principale pour logger une activité (avec compression et batch)
     */
    async logActivity(action, details = {}) {
        if (!this.currentUserId || !this.initialized) {
            return;
        }

        // Convertir l'action en code court
        const actionCode = ActivityLogger.ACTION_CODES[action] || action.substring(0, 5);

        // Créer le log compressé
        const compressedLog = {
            uid: this.currentUserId, // UID court
            a: actionCode, // Action code
            t: firebase.firestore.FieldValue.serverTimestamp(),
            p: window.location.pathname.substring(0, 30), // Page (limité)
            sid: this.sessionInfo?.id || null, // Référence à session_info
            ...this.compressDetails(details)
        };

        // Ajouter au batch
        this.pendingLogs.push(compressedLog);

        // Flush si le batch est trop grand (50 logs)
        if (this.pendingLogs.length >= 50) {
            await this.flushPendingLogs();
        } else {
            // Programmer un flush dans 2 secondes
            clearTimeout(this.batchTimeout);
            this.batchTimeout = setTimeout(() => {
                this.flushPendingLogs();
            }, 2000);
        }
    }

    /**
     * Compresse les détails en utilisant des noms de champs courts
     */
    compressDetails(details) {
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
            'aggregatedCount': 'agg'
        };

        for (const [key, value] of Object.entries(details)) {
            const shortKey = fieldMap[key] || key.substring(0, 3);
            
            // Compresser les valeurs selon le type
            if (typeof value === 'string' && value.length > 50) {
                compressed[shortKey] = value.substring(0, 50);
            } else if (value === null || value === undefined || value === '') {
                // Ne pas inclure les valeurs vides
                continue;
            } else {
                compressed[shortKey] = value;
            }
        }

        return compressed;
    }

    /**
     * Envoie les logs en batch pour économiser les écritures
     */
    async flushPendingLogs() {
        if (this.pendingLogs.length === 0) return;

        const logsToFlush = [...this.pendingLogs];
        this.pendingLogs = [];
        clearTimeout(this.batchTimeout);

        try {
            // Utiliser batch write pour économiser les écritures
            const batch = firebase.firestore().batch();
            const logsRef = firebase.firestore().collection('activity_logs');
            
            logsToFlush.forEach(log => {
                const docRef = logsRef.doc();
                batch.set(docRef, log);
            });

            await batch.commit();
            console.log(`[ActivityLogger] ${logsToFlush.length} logs envoyés en batch`);
        } catch (error) {
            console.error('Erreur lors du flush des logs:', error);
            // Remettre les logs en attente en cas d'erreur
            this.pendingLogs.unshift(...logsToFlush);
        }
    }
}

// Initialiser le logger automatiquement quand le script est chargé
const activityLogger = new ActivityLogger();

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        activityLogger.init();
    });
} else {
    activityLogger.init();
}

// Exporter pour utilisation globale
window.activityLogger = activityLogger;
