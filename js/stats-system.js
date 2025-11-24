/**
 * Système de statistiques personnelles
 * Suivi des messages envoyés/reçus, jours actifs, progression, etc.
 */

class StatsSystem {
    constructor(userId) {
        this.userId = userId;
        this.db = firebase.firestore();
    }

    /**
     * Récupère toutes les statistiques d'un utilisateur
     */
    async getUserStats() {
        try {
            const statsRef = this.db.collection('userStats').doc(this.userId);
            const statsDoc = await statsRef.get();
            
            if (statsDoc.exists) {
                return statsDoc.data();
            } else {
                // Créer des stats par défaut
                const defaultStats = this.getDefaultStats();
                await statsRef.set(defaultStats);
                return defaultStats;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des stats:', error);
            return this.getDefaultStats();
        }
    }

    /**
     * Stats par défaut pour un nouvel utilisateur
     */
    getDefaultStats() {
        return {
            messagesSent: 0,
            messagesReceived: 0,
            activeDays: 0,
            lastActiveDate: null,
            consecutiveDays: 0,
            longestStreak: 0,
            totalCelebrations: 0,
            celebrationsParticipated: 0,
            reputation: 100,
            badges: [],
            points: 0,
            level: 1,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
    }

    /**
     * Incrémente le compteur de messages envoyés
     */
    async incrementMessagesSent() {
        try {
            const statsRef = this.db.collection('userStats').doc(this.userId);
            await statsRef.update({
                messagesSent: firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Vérifier les badges et points
            await this.checkBadgesAndPoints('messagesSent');
        } catch (error) {
            console.error('Erreur lors de l\'incrémentation des messages envoyés:', error);
        }
    }

    /**
     * Incrémente le compteur de messages reçus
     */
    async incrementMessagesReceived() {
        try {
            const statsRef = this.db.collection('userStats').doc(this.userId);
            await statsRef.update({
                messagesReceived: firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Erreur lors de l\'incrémentation des messages reçus:', error);
        }
    }

    /**
     * Met à jour les jours actifs
     */
    async updateActiveDays() {
        try {
            const statsRef = this.db.collection('userStats').doc(this.userId);
            const statsDoc = await statsRef.get();
            const stats = statsDoc.data() || this.getDefaultStats();
            
            const today = new Date().toDateString();
            const lastActive = stats.lastActiveDate ? new Date(stats.lastActiveDate.toDate()).toDateString() : null;
            
            let updates = {
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Si c'est un nouveau jour
            if (lastActive !== today) {
                updates.activeDays = firebase.firestore.FieldValue.increment(1);
                updates.lastActiveDate = firebase.firestore.FieldValue.serverTimestamp();
                
                // Vérifier la série de jours consécutifs
                if (lastActive) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toDateString();
                    
                    if (lastActive === yesterdayStr) {
                        // Jour consécutif
                        updates.consecutiveDays = firebase.firestore.FieldValue.increment(1);
                    } else {
                        // Série rompue
                        updates.consecutiveDays = 1;
                    }
                } else {
                    updates.consecutiveDays = 1;
                }
                
                // Mettre à jour la plus longue série
                const newConsecutive = (stats.consecutiveDays || 0) + 1;
                if (newConsecutive > (stats.longestStreak || 0)) {
                    updates.longestStreak = newConsecutive;
                }
            }
            
            await statsRef.update(updates);
            await this.checkBadgesAndPoints('activeDays');
        } catch (error) {
            console.error('Erreur lors de la mise à jour des jours actifs:', error);
        }
    }

    /**
     * Incrémente le nombre de célébrations participées
     */
    async incrementCelebrationsParticipated() {
        try {
            const statsRef = this.db.collection('userStats').doc(this.userId);
            await statsRef.update({
                celebrationsParticipated: firebase.firestore.FieldValue.increment(1),
                totalCelebrations: firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await this.checkBadgesAndPoints('celebrations');
        } catch (error) {
            console.error('Erreur lors de l\'incrémentation des célébrations:', error);
        }
    }

    /**
     * Met à jour la réputation
     */
    async updateReputation(delta) {
        try {
            const statsRef = this.db.collection('userStats').doc(this.userId);
            await statsRef.update({
                reputation: firebase.firestore.FieldValue.increment(delta),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la réputation:', error);
        }
    }

    /**
     * Ajoute des points et met à jour le niveau
     */
    async addPoints(amount) {
        try {
            const statsRef = this.db.collection('userStats').doc(this.userId);
            const statsDoc = await statsRef.get();
            const stats = statsDoc.data() || this.getDefaultStats();
            
            const newPoints = (stats.points || 0) + amount;
            const newLevel = this.calculateLevel(newPoints);
            
            const updates = {
                points: newPoints,
                level: newLevel,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Si le niveau a augmenté
            if (newLevel > (stats.level || 1)) {
                updates.levelUpDate = firebase.firestore.FieldValue.serverTimestamp();
            }
            
            await statsRef.update(updates);
            await this.checkBadgesAndPoints('points');
        } catch (error) {
            console.error('Erreur lors de l\'ajout de points:', error);
        }
    }

    /**
     * Calcule le niveau basé sur les points
     * Formule: niveau = floor(sqrt(points / 10)) + 1
     */
    calculateLevel(points) {
        return Math.floor(Math.sqrt(points / 10)) + 1;
    }

    /**
     * Vérifie et débloque les badges, ajoute des points
     */
    async checkBadgesAndPoints(category) {
        try {
            const statsRef = this.db.collection('userStats').doc(this.userId);
            const statsDoc = await statsRef.get();
            const stats = statsDoc.data() || this.getDefaultStats();
            
            const badges = stats.badges || [];
            const newBadges = [];
            let pointsToAdd = 0;
            
            // Badges de messages
            if (category === 'messagesSent') {
                const messagesSent = stats.messagesSent || 0;
                
                if (messagesSent >= 1 && !badges.includes('first_message')) {
                    newBadges.push('first_message');
                    pointsToAdd += 10;
                }
                if (messagesSent >= 10 && !badges.includes('message_10')) {
                    newBadges.push('message_10');
                    pointsToAdd += 25;
                }
                if (messagesSent >= 50 && !badges.includes('message_50')) {
                    newBadges.push('message_50');
                    pointsToAdd += 50;
                }
                if (messagesSent >= 100 && !badges.includes('message_100')) {
                    newBadges.push('message_100');
                    pointsToAdd += 100;
                }
            }
            
            // Badges de jours actifs
            if (category === 'activeDays') {
                const activeDays = stats.activeDays || 0;
                const consecutiveDays = stats.consecutiveDays || 0;
                
                if (activeDays >= 7 && !badges.includes('active_week')) {
                    newBadges.push('active_week');
                    pointsToAdd += 20;
                }
                if (activeDays >= 30 && !badges.includes('active_month')) {
                    newBadges.push('active_month');
                    pointsToAdd += 50;
                }
                if (consecutiveDays >= 7 && !badges.includes('streak_7')) {
                    newBadges.push('streak_7');
                    pointsToAdd += 30;
                }
                if (consecutiveDays >= 30 && !badges.includes('streak_30')) {
                    newBadges.push('streak_30');
                    pointsToAdd += 100;
                }
            }
            
            // Badges de célébrations
            if (category === 'celebrations') {
                const celebrations = stats.celebrationsParticipated || 0;
                
                if (celebrations >= 5 && !badges.includes('celebration_5')) {
                    newBadges.push('celebration_5');
                    pointsToAdd += 25;
                }
                if (celebrations >= 10 && !badges.includes('celebration_10')) {
                    newBadges.push('celebration_10');
                    pointsToAdd += 50;
                }
            }
            
            // Badges de points/niveau
            if (category === 'points') {
                const level = stats.level || 1;
                
                if (level >= 5 && !badges.includes('level_5')) {
                    newBadges.push('level_5');
                    pointsToAdd += 50;
                }
                if (level >= 10 && !badges.includes('level_10')) {
                    newBadges.push('level_10');
                    pointsToAdd += 100;
                }
            }
            
            // Mettre à jour les badges et points
            if (newBadges.length > 0 || pointsToAdd > 0) {
                const updates = {
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                if (newBadges.length > 0) {
                    updates.badges = firebase.firestore.FieldValue.arrayUnion(...newBadges);
                }
                
                await statsRef.update(updates);
                
                if (pointsToAdd > 0) {
                    await this.addPoints(pointsToAdd);
                }
                
                // Retourner les nouveaux badges pour affichage
                return newBadges;
            }
            
            return [];
        } catch (error) {
            console.error('Erreur lors de la vérification des badges:', error);
            return [];
        }
    }

    /**
     * Récupère les informations des badges
     */
    getBadgeInfo(badgeId) {
        const badges = {
            'first_message': { name: 'Premier Message', icon: '✉️', description: 'Envoyé votre premier message' },
            'message_10': { name: 'Messager Actif', icon: '💬', description: 'Envoyé 10 messages' },
            'message_50': { name: 'Grand Communicateur', icon: '📨', description: 'Envoyé 50 messages' },
            'message_100': { name: 'Maître des Messages', icon: '📬', description: 'Envoyé 100 messages' },
            'active_week': { name: 'Semaine Active', icon: '📅', description: 'Actif pendant 7 jours' },
            'active_month': { name: 'Mois Actif', icon: '🗓️', description: 'Actif pendant 30 jours' },
            'streak_7': { name: 'Série de 7', icon: '🔥', description: '7 jours consécutifs' },
            'streak_30': { name: 'Série Légendaire', icon: '⚡', description: '30 jours consécutifs' },
            'celebration_5': { name: 'Fêtard', icon: '🎉', description: 'Participé à 5 célébrations' },
            'celebration_10': { name: 'Roi des Fêtes', icon: '👑', description: 'Participé à 10 célébrations' },
            'level_5': { name: 'Niveau 5', icon: '⭐', description: 'Atteint le niveau 5' },
            'level_10': { name: 'Niveau 10', icon: '🌟', description: 'Atteint le niveau 10' }
        };
        
        return badges[badgeId] || { name: badgeId, icon: '🏆', description: 'Badge obtenu' };
    }
}

// Exposer globalement
window.StatsSystem = StatsSystem;



