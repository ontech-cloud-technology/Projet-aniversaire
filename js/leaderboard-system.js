/**
 * Système de classements (Leaderboard)
 * Affiche les classements des élèves par participation, réputation, etc.
 */

class LeaderboardSystem {
    constructor() {
        this.db = firebase.firestore();
    }

    /**
     * Récupère le classement par messages envoyés
     */
    async getMessagesLeaderboard(limit = 10) {
        try {
            const statsSnapshot = await this.db.collection('userStats')
                .orderBy('messagesSent', 'desc')
                .limit(limit)
                .get();

            const leaderboard = [];
            for (const doc of statsSnapshot.docs) {
                const stats = doc.data();
                const userDoc = await this.db.collection('users').doc(doc.id).get();
                const userData = userDoc.data();
                
                if (userData && userData.role === 'eleve' && (userData.status === 'active' || !userData.status)) {
                    leaderboard.push({
                        userId: doc.id,
                        name: userData.fullName || userData.email || 'Inconnu',
                        value: stats.messagesSent || 0,
                        type: 'messages'
                    });
                }
            }
            return leaderboard;
        } catch (error) {
            console.error('Erreur lors de la récupération du classement messages:', error);
            return [];
        }
    }

    /**
     * Récupère le classement par réputation
     */
    async getReputationLeaderboard(limit = 10) {
        try {
            // Récupérer tous les utilisateurs actifs
            const usersSnapshot = await this.db.collection('users')
                .where('role', '==', 'eleve')
                .get();

            const leaderboard = [];
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                if (userData.status === 'active' || !userData.status) {
                    const statsDoc = await this.db.collection('userStats').doc(userDoc.id).get();
                    const stats = statsDoc.exists ? statsDoc.data() : {};
                    const reputation = userData.reputation || stats.reputation || 100;
                    
                    leaderboard.push({
                        userId: userDoc.id,
                        name: userData.fullName || userData.email || 'Inconnu',
                        value: reputation,
                        type: 'reputation'
                    });
                }
            }

            // Trier par réputation décroissante
            leaderboard.sort((a, b) => b.value - a.value);
            return leaderboard.slice(0, limit);
        } catch (error) {
            console.error('Erreur lors de la récupération du classement réputation:', error);
            return [];
        }
    }

    /**
     * Récupère le classement par points/niveau
     */
    async getPointsLeaderboard(limit = 10) {
        try {
            const statsSnapshot = await this.db.collection('userStats')
                .orderBy('points', 'desc')
                .limit(limit)
                .get();

            const leaderboard = [];
            for (const doc of statsSnapshot.docs) {
                const stats = doc.data();
                const userDoc = await this.db.collection('users').doc(doc.id).get();
                const userData = userDoc.data();
                
                if (userData && userData.role === 'eleve' && (userData.status === 'active' || !userData.status)) {
                    leaderboard.push({
                        userId: doc.id,
                        name: userData.fullName || userData.email || 'Inconnu',
                        value: stats.points || 0,
                        level: stats.level || 1,
                        type: 'points'
                    });
                }
            }
            return leaderboard;
        } catch (error) {
            console.error('Erreur lors de la récupération du classement points:', error);
            return [];
        }
    }

    /**
     * Récupère le classement par jours actifs
     */
    async getActiveDaysLeaderboard(limit = 10) {
        try {
            const statsSnapshot = await this.db.collection('userStats')
                .orderBy('activeDays', 'desc')
                .limit(limit)
                .get();

            const leaderboard = [];
            for (const doc of statsSnapshot.docs) {
                const stats = doc.data();
                const userDoc = await this.db.collection('users').doc(doc.id).get();
                const userData = userDoc.data();
                
                if (userData && userData.role === 'eleve' && (userData.status === 'active' || !userData.status)) {
                    leaderboard.push({
                        userId: doc.id,
                        name: userData.fullName || userData.email || 'Inconnu',
                        value: stats.activeDays || 0,
                        type: 'activeDays'
                    });
                }
            }
            return leaderboard;
        } catch (error) {
            console.error('Erreur lors de la récupération du classement jours actifs:', error);
            return [];
        }
    }

    /**
     * Récupère le classement mensuel (messages envoyés ce mois)
     */
    async getMonthlyLeaderboard(limit = 10) {
        try {
            // Calculer le début du mois
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            // Récupérer tous les messages envoyés ce mois
            const messagesSnapshot = await this.db.collection('messages')
                .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(startOfMonth))
                .get();

            // Compter les messages par utilisateur
            const userCounts = {};
            messagesSnapshot.forEach(doc => {
                const message = doc.data();
                const senderId = message.senderId;
                if (senderId) {
                    userCounts[senderId] = (userCounts[senderId] || 0) + 1;
                }
            });

            // Créer le classement
            const leaderboard = [];
            for (const [userId, count] of Object.entries(userCounts)) {
                const userDoc = await this.db.collection('users').doc(userId).get();
                const userData = userDoc.data();
                
                if (userData && userData.role === 'eleve' && (userData.status === 'active' || !userData.status)) {
                    leaderboard.push({
                        userId: userId,
                        name: userData.fullName || userData.email || 'Inconnu',
                        value: count,
                        type: 'monthly'
                    });
                }
            }

            // Trier par nombre de messages décroissant
            leaderboard.sort((a, b) => b.value - a.value);
            return leaderboard.slice(0, limit);
        } catch (error) {
            console.error('Erreur lors de la récupération du classement mensuel:', error);
            return [];
        }
    }

    /**
     * Récupère la position d'un utilisateur dans un classement
     */
    async getUserRank(userId, type = 'messages') {
        try {
            let leaderboard = [];
            
            switch (type) {
                case 'messages':
                    leaderboard = await this.getMessagesLeaderboard(100);
                    break;
                case 'reputation':
                    leaderboard = await this.getReputationLeaderboard(100);
                    break;
                case 'points':
                    leaderboard = await this.getPointsLeaderboard(100);
                    break;
                case 'activeDays':
                    leaderboard = await this.getActiveDaysLeaderboard(100);
                    break;
                case 'monthly':
                    leaderboard = await this.getMonthlyLeaderboard(100);
                    break;
            }

            const rank = leaderboard.findIndex(item => item.userId === userId) + 1;
            return rank > 0 ? rank : null;
        } catch (error) {
            console.error('Erreur lors de la récupération du rang:', error);
            return null;
        }
    }
}

// Exposer globalement
window.LeaderboardSystem = LeaderboardSystem;



