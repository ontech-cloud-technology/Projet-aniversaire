/**
 * Système de gestion des permissions granulaire
 * Vérifie les permissions personnalisées de chaque utilisateur
 */

class PermissionsSystem {
    constructor() {
        this.userPermissions = null;
        this.currentUserId = null;
    }

    /**
     * Initialise le système de permissions pour l'utilisateur actuel
     */
    async init(userId) {
        this.currentUserId = userId;
        if (!userId) {
            this.userPermissions = null;
            return;
        }

        try {
            const userDoc = await firebase.firestore().collection('users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.userPermissions = userData.permissions || {};
            } else {
                this.userPermissions = {};
            }
        } catch (error) {
            console.error('Erreur lors du chargement des permissions:', error);
            this.userPermissions = {};
        }
    }

    /**
     * Vérifie si l'utilisateur a une permission spécifique
     * @param {string} permission - La clé de permission (ex: 'calendar_view', 'messages_send')
     * @param {boolean} defaultValue - Valeur par défaut si la permission n'est pas définie (basée sur le rôle)
     * @returns {boolean}
     */
    hasPermission(permission, defaultValue = null) {
        // Si pas de permissions chargées, retourner la valeur par défaut
        if (!this.userPermissions) {
            return defaultValue !== null ? defaultValue : false;
        }

        // Si la permission est explicitement définie, l'utiliser
        if (this.userPermissions.hasOwnProperty(permission)) {
            return this.userPermissions[permission] === true;
        }

        // Sinon, retourner la valeur par défaut
        return defaultValue !== null ? defaultValue : false;
    }

    /**
     * Vérifie plusieurs permissions (toutes doivent être vraies)
     * @param {string[]} permissions - Tableau de permissions
     * @returns {boolean}
     */
    hasAllPermissions(permissions) {
        return permissions.every(perm => this.hasPermission(perm, false));
    }

    /**
     * Vérifie plusieurs permissions (au moins une doit être vraie)
     * @param {string[]} permissions - Tableau de permissions
     * @returns {boolean}
     */
    hasAnyPermission(permissions) {
        return permissions.some(perm => this.hasPermission(perm, false));
    }

    /**
     * Recharge les permissions depuis Firestore
     */
    async refresh() {
        if (this.currentUserId) {
            await this.init(this.currentUserId);
        }
    }
}

// Instance globale
const permissionsSystem = new PermissionsSystem();

// Fonction globale pour vérifier les permissions
window.hasPermission = function(permission, defaultValue = null) {
    return permissionsSystem.hasPermission(permission, defaultValue);
};

window.hasAllPermissions = function(permissions) {
    return permissionsSystem.hasAllPermissions(permissions);
};

window.hasAnyPermission = function(permissions) {
    return permissionsSystem.hasAnyPermission(permissions);
};

// Exporter pour utilisation dans d'autres scripts
window.permissionsSystem = permissionsSystem;

