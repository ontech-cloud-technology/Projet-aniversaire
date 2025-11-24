/**
 * Système de liste de souhaits d'anniversaire
 * Permet aux élèves de créer et gérer leur liste de souhaits
 */

class WishlistSystem {
    constructor(userId) {
        this.userId = userId;
        this.db = firebase.firestore();
    }

    /**
     * Récupérer la liste de souhaits de l'utilisateur
     */
    async getWishlist() {
        try {
            const wishlistDoc = await this.db.collection('wishlists').doc(this.userId).get();
            if (wishlistDoc.exists) {
                return wishlistDoc.data();
            } else {
                // Créer une liste vide
                const defaultWishlist = {
                    items: [],
                    isPublic: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                await this.db.collection('wishlists').doc(this.userId).set(defaultWishlist);
                return defaultWishlist;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de la liste de souhaits:', error);
            return { items: [], isPublic: false };
        }
    }

    /**
     * Ajouter un souhait
     */
    async addWish(wishText) {
        try {
            const wishlist = await this.getWishlist();
            const newWish = {
                id: Date.now().toString(),
                text: wishText.trim(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            wishlist.items.push(newWish);
            
            await this.db.collection('wishlists').doc(this.userId).update({
                items: wishlist.items,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'ajout du souhait:', error);
            return false;
        }
    }

    /**
     * Supprimer un souhait
     */
    async removeWish(wishId) {
        try {
            const wishlist = await this.getWishlist();
            wishlist.items = wishlist.items.filter(item => item.id !== wishId);
            
            await this.db.collection('wishlists').doc(this.userId).update({
                items: wishlist.items,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression du souhait:', error);
            return false;
        }
    }

    /**
     * Modifier la visibilité de la liste
     */
    async setVisibility(isPublic) {
        try {
            await this.db.collection('wishlists').doc(this.userId).update({
                isPublic: isPublic,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Erreur lors de la modification de la visibilité:', error);
            return false;
        }
    }

    /**
     * Récupérer la liste de souhaits d'un autre utilisateur (si publique)
     */
    async getPublicWishlist(userId) {
        try {
            const wishlistDoc = await this.db.collection('wishlists').doc(userId).get();
            if (wishlistDoc.exists) {
                const data = wishlistDoc.data();
                if (data.isPublic) {
                    return data;
                }
            }
            return null;
        } catch (error) {
            console.error('Erreur lors de la récupération de la liste publique:', error);
            return null;
        }
    }
}

// Exposer globalement
window.WishlistSystem = WishlistSystem;



