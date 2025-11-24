/**
 * Système de favoris pour les anniversaires
 * Permet aux élèves de marquer des anniversaires comme favoris
 */

class FavoritesSystem {
    constructor(userId) {
        this.userId = userId;
        this.db = firebase.firestore();
    }

    /**
     * Récupère la liste des favoris d'un utilisateur
     */
    async getFavorites() {
        try {
            const favoritesRef = this.db.collection('favorites').doc(this.userId);
            const favoritesDoc = await favoritesRef.get();
            
            if (favoritesDoc.exists) {
                return favoritesDoc.data().celebrationIds || [];
            } else {
                return [];
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des favoris:', error);
            return [];
        }
    }

    /**
     * Ajoute un anniversaire aux favoris
     */
    async addFavorite(celebrationId) {
        try {
            const favoritesRef = this.db.collection('favorites').doc(this.userId);
            const favoritesDoc = await favoritesRef.get();
            
            const currentFavorites = favoritesDoc.exists ? (favoritesDoc.data().celebrationIds || []) : [];
            
            if (!currentFavorites.includes(celebrationId)) {
                currentFavorites.push(celebrationId);
                await favoritesRef.set({
                    celebrationIds: currentFavorites,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erreur lors de l\'ajout aux favoris:', error);
            return false;
        }
    }

    /**
     * Retire un anniversaire des favoris
     */
    async removeFavorite(celebrationId) {
        try {
            const favoritesRef = this.db.collection('favorites').doc(this.userId);
            const favoritesDoc = await favoritesRef.get();
            
            if (favoritesDoc.exists) {
                const currentFavorites = favoritesDoc.data().celebrationIds || [];
                const updatedFavorites = currentFavorites.filter(id => id !== celebrationId);
                
                await favoritesRef.set({
                    celebrationIds: updatedFavorites,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erreur lors de la suppression des favoris:', error);
            return false;
        }
    }

    /**
     * Vérifie si un anniversaire est dans les favoris
     */
    async isFavorite(celebrationId) {
        try {
            const favorites = await this.getFavorites();
            return favorites.includes(celebrationId);
        } catch (error) {
            console.error('Erreur lors de la vérification des favoris:', error);
            return false;
        }
    }

    /**
     * Bascule l'état favori d'un anniversaire
     */
    async toggleFavorite(celebrationId) {
        const isFav = await this.isFavorite(celebrationId);
        if (isFav) {
            return await this.removeFavorite(celebrationId);
        } else {
            return await this.addFavorite(celebrationId);
        }
    }
}

// Exposer globalement
window.FavoritesSystem = FavoritesSystem;



