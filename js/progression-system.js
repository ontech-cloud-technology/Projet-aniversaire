/**
 * Système de progression pour les messages d'anniversaire
 * Suit les 9 personnes consécutives qui ont reçu des messages de tous les élèves
 */

/**
 * Récupère tous les élèves (utilisateurs avec role='eleve' et status='active')
 * Exclut les spectateurs et les utilisateurs bloqués
 */
async function getAllStudents() {
    try {
        const studentsSnapshot = await firebase.firestore().collection('users')
            .where('role', '==', 'eleve')
            .get();
        
        // Filtrer pour exclure les spectateurs et les utilisateurs bloqués
        return studentsSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(student => {
                const status = student.status || 'active';
                return status === 'active';
            });
    } catch (error) {
        console.error('Erreur lors de la récupération des élèves:', error);
        return [];
    }
}

/**
 * Récupère toutes les célébrations triées par date d'anniversaire
 */
async function getAllCelebrations() {
    try {
        const celebrationsSnapshot = await firebase.firestore().collection('celebrations')
            .orderBy('birthday', 'asc')
            .get();
        
        return celebrationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération des célébrations:', error);
        return [];
    }
}

/**
 * Récupère tous les messages pour une célébration donnée
 */
async function getMessagesForCelebration(celebrationId) {
    try {
        const messagesSnapshot = await firebase.firestore().collection('messages')
            .where('celebrationId', '==', celebrationId)
            .get();
        
        return messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        return [];
    }
}

/**
 * Vérifie si tous les élèves ont envoyé un message à une célébration
 * @param {string} celebrationId - ID de la célébration
 * @returns {Promise<Object>} { complete: boolean, totalStudents: number, sentMessages: number, missingStudents: Array }
 */
async function checkCelebrationCompletion(celebrationId) {
    const students = await getAllStudents();
    const messages = await getMessagesForCelebration(celebrationId);
    
    // Filtrer uniquement les messages envoyés par des élèves
    const studentMessages = messages.filter(msg => {
        // Vérifier si le senderId correspond à un élève
        return students.some(student => student.id === msg.senderId);
    });
    
    const studentIdsWhoSent = new Set(studentMessages.map(msg => msg.senderId));
    const missingStudents = students.filter(student => !studentIdsWhoSent.has(student.id));
    
    return {
        complete: missingStudents.length === 0 && students.length > 0,
        totalStudents: students.length,
        sentMessages: studentMessages.length,
        missingStudents: missingStudents,
        messages: studentMessages
    };
}

/**
 * Calcule la progression des 9 personnes consécutives
 * @returns {Promise<Object>} { consecutiveCount: number, currentStreak: Array, allCelebrations: Array }
 */
async function calculateProgression() {
    const celebrations = await getAllCelebrations();
    const students = await getAllStudents();
    
    if (students.length === 0) {
        return {
            consecutiveCount: 0,
            currentStreak: [],
            allCelebrations: []
        };
    }
    
    // Trier les célébrations par date d'anniversaire (prochaines d'abord)
    const today = new Date();
    const sortedCelebrations = celebrations
        .filter(celeb => {
            if (!celeb.birthday) return false;
            const birthday = new Date(celeb.birthday);
            // Inclure les anniversaires passés et futurs
            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(a.birthday);
            const dateB = new Date(b.birthday);
            // Comparer en ignorant l'année
            const monthDayA = `${dateA.getMonth()}-${dateA.getDate()}`;
            const monthDayB = `${dateB.getMonth()}-${dateB.getDate()}`;
            return monthDayA.localeCompare(monthDayB);
        });
    
    const results = [];
    
    // Vérifier chaque célébration
    for (const celebration of sortedCelebrations) {
        const completion = await checkCelebrationCompletion(celebration.id);
        results.push({
            celebration: celebration,
            completion: completion
        });
    }
    
    // Trouver la séquence consécutive la plus longue
    let maxConsecutive = 0;
    let currentStreak = [];
    let bestStreak = [];
    
    for (const result of results) {
        if (result.completion.complete) {
            currentStreak.push(result);
            if (currentStreak.length > maxConsecutive) {
                maxConsecutive = currentStreak.length;
                bestStreak = [...currentStreak];
            }
        } else {
            currentStreak = [];
        }
    }
    
    return {
        consecutiveCount: maxConsecutive,
        currentStreak: bestStreak,
        allCelebrations: results,
        totalStudents: students.length
    };
}

/**
 * Vérifie si on a atteint 9 personnes consécutives et envoie une notification
 */
async function checkAndNotify9Consecutive() {
    const progression = await calculateProgression();
    
    if (progression.consecutiveCount >= 9) {
        // Vérifier si une notification a déjà été envoyée
        const notificationsSnapshot = await firebase.firestore().collection('notifications')
            .where('type', '==', '9_consecutive_reached')
            .where('read', '==', false)
            .limit(1)
            .get();
        
        if (notificationsSnapshot.empty) {
            // Créer une notification pour les admins
            await firebase.firestore().collection('notifications').add({
                type: '9_consecutive_reached',
                title: '🎉 Objectif atteint !',
                message: `Félicitations ! 9 personnes consécutives ont reçu des messages de tous les élèves !`,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false,
                data: {
                    consecutiveCount: progression.consecutiveCount,
                    celebrations: progression.currentStreak.map(s => s.celebration.id)
                }
            });
        }
    }
    
    return progression;
}

