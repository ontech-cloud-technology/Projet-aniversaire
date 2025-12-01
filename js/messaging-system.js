/**
 * Système de messagerie pour les utilisateurs
 * Permet aux utilisateurs d'envoyer et recevoir des messages privés
 */

class MessagingSystem {
    constructor(userId) {
        this.userId = userId;
        this.db = firebase.firestore();
        this.messageListeners = [];
        this.unsubscribeListeners = [];
    }

    /**
     * Envoyer un message à un utilisateur
     * @param {string} recipientId - ID de l'utilisateur destinataire
     * @param {string} messageText - Contenu du message
     * @returns {Promise<string>} ID du message créé
     */
    async sendMessage(recipientId, messageText) {
        try {
            if (!this.userId || !recipientId || !messageText) {
                throw new Error('Paramètres manquants pour l\'envoi du message');
            }

            // Récupérer les informations de l'expéditeur
            const senderDoc = await this.db.collection('users').doc(this.userId).get();
            const senderData = senderDoc.data();
            const senderName = senderData?.fullName || senderData?.email || 'Anonyme';

            // Récupérer les informations du destinataire
            const recipientDoc = await this.db.collection('users').doc(recipientId).get();
            const recipientData = recipientDoc.data();
            const recipientEmail = recipientData?.email || '';

            // Créer le message
            const message = {
                senderId: this.userId,
                senderName: senderName,
                recipientId: recipientId,
                recipientEmail: recipientEmail,
                message: messageText.trim(),
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                type: 'private' // Tous les messages sont privés maintenant
            };

            const docRef = await this.db.collection('messages').add(message);
            
            // Envoyer une notification email si possible
            try {
                const EMAIL_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? 'http://localhost:3001/api'
                    : (window.location.origin.includes('github.io') 
                        ? 'https://projet-aniversaire-email-api.onrender.com/api'
                        : `${window.location.origin}/api`);

                if (recipientEmail && EMAIL_API_URL && !EMAIL_API_URL.includes('votre-serveur-email.com')) {
                    await fetch(`${EMAIL_API_URL}/send-message-notification`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: recipientEmail,
                            recipientName: recipientData?.fullName || recipientEmail,
                            senderName: senderName,
                            message: messageText,
                            isPublic: false,
                            notificationsUrl: window.location.origin + '/eleve.html#notifications',
                            birthdayMessage: ''
                        })
                    }).catch(err => {
                        console.warn('Erreur lors de l\'envoi de la notification email:', err);
                        // Ne pas bloquer l'envoi du message si l'email échoue
                    });
                }
            } catch (emailError) {
                console.warn('Erreur lors de l\'envoi de la notification email:', emailError);
                // Ne pas bloquer l'envoi du message si l'email échoue
            }

            return docRef.id;
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            throw error;
        }
    }

    /**
     * Récupérer toutes les conversations de l'utilisateur
     * @returns {Promise<Array>} Liste des conversations avec le dernier message
     */
    async getConversations() {
        try {
            // Récupérer tous les messages où l'utilisateur est expéditeur ou destinataire
            const sentMessages = await this.db.collection('messages')
                .where('senderId', '==', this.userId)
                .orderBy('createdAt', 'desc')
                .get();

            const receivedMessages = await this.db.collection('messages')
                .where('recipientId', '==', this.userId)
                .orderBy('createdAt', 'desc')
                .get();

            // Créer un map des conversations
            const conversationsMap = new Map();

            // Traiter les messages envoyés
            sentMessages.forEach(doc => {
                const data = doc.data();
                const otherUserId = data.recipientId;
                const otherUserName = data.recipientEmail || 'Utilisateur';
                
                if (!conversationsMap.has(otherUserId)) {
                    conversationsMap.set(otherUserId, {
                        userId: otherUserId,
                        userName: otherUserName,
                        lastMessage: data.message,
                        lastMessageDate: data.createdAt,
                        unreadCount: 0,
                        isReceived: false,
                        read: true
                    });
                } else {
                    const conv = conversationsMap.get(otherUserId);
                    const currentDate = conv.lastMessageDate?.toDate ? conv.lastMessageDate.toDate() : new Date(0);
                    const newDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(0);
                    if (newDate > currentDate) {
                        conv.lastMessage = data.message;
                        conv.lastMessageDate = data.createdAt;
                        conv.isReceived = false;
                        conv.read = true;
                    }
                }
            });

            // Traiter les messages reçus
            receivedMessages.forEach(doc => {
                const data = doc.data();
                const otherUserId = data.senderId;
                const otherUserName = data.senderName || 'Utilisateur';
                
                if (!conversationsMap.has(otherUserId)) {
                    conversationsMap.set(otherUserId, {
                        userId: otherUserId,
                        userName: otherUserName,
                        lastMessage: data.message,
                        lastMessageDate: data.createdAt,
                        unreadCount: data.read ? 0 : 1,
                        isReceived: true,
                        read: data.read
                    });
                } else {
                    const conv = conversationsMap.get(otherUserId);
                    const currentDate = conv.lastMessageDate?.toDate ? conv.lastMessageDate.toDate() : new Date(0);
                    const newDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(0);
                    if (newDate > currentDate) {
                        conv.lastMessage = data.message;
                        conv.lastMessageDate = data.createdAt;
                        conv.isReceived = true;
                        conv.read = data.read;
                        conv.unreadCount = data.read ? 0 : 1;
                    } else if (!data.read) {
                        // Compter les messages non lus
                        conv.unreadCount = (conv.unreadCount || 0) + (data.read ? 0 : 1);
                    }
                }
            });

            // Récupérer les noms complets des utilisateurs
            const userIds = Array.from(conversationsMap.keys());
            const userDocs = await Promise.all(
                userIds.map(id => this.db.collection('users').doc(id).get())
            );

            userDocs.forEach((doc, index) => {
                if (doc.exists) {
                    const userData = doc.data();
                    const userId = userIds[index];
                    if (conversationsMap.has(userId)) {
                        conversationsMap.get(userId).userName = userData.fullName || userData.email || conversationsMap.get(userId).userName;
                    }
                }
            });

            // Convertir en tableau et trier par date
            const conversations = Array.from(conversationsMap.values());
            conversations.sort((a, b) => {
                const dateA = a.lastMessageDate?.toDate ? a.lastMessageDate.toDate() : new Date(0);
                const dateB = b.lastMessageDate?.toDate ? b.lastMessageDate.toDate() : new Date(0);
                return dateB - dateA;
            });

            return conversations;
        } catch (error) {
            console.error('Erreur lors de la récupération des conversations:', error);
            return [];
        }
    }

    /**
     * Récupérer tous les messages d'une conversation avec un utilisateur
     * @param {string} otherUserId - ID de l'autre utilisateur
     * @returns {Promise<Array>} Liste des messages
     */
    async getConversation(otherUserId) {
        try {
            // Récupérer les messages envoyés
            const sentMessages = await this.db.collection('messages')
                .where('senderId', '==', this.userId)
                .where('recipientId', '==', otherUserId)
                .orderBy('createdAt', 'asc')
                .get();

            // Récupérer les messages reçus
            const receivedMessages = await this.db.collection('messages')
                .where('senderId', '==', otherUserId)
                .where('recipientId', '==', this.userId)
                .orderBy('createdAt', 'asc')
                .get();

            // Combiner et trier
            const allMessages = [];
            
            sentMessages.forEach(doc => {
                allMessages.push({
                    id: doc.id,
                    ...doc.data(),
                    senderId: this.userId
                });
            });

            receivedMessages.forEach(doc => {
                allMessages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Trier par date
            allMessages.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                return dateA - dateB;
            });

            return allMessages;
        } catch (error) {
            console.error('Erreur lors de la récupération de la conversation:', error);
            return [];
        }
    }

    /**
     * Marquer un message comme lu
     * @param {string} messageId - ID du message
     * @returns {Promise<boolean>}
     */
    async markAsRead(messageId) {
        try {
            const messageRef = this.db.collection('messages').doc(messageId);
            const messageDoc = await messageRef.get();
            
            if (!messageDoc.exists) {
                return false;
            }

            const messageData = messageDoc.data();
            
            // Vérifier que le message est bien destiné à cet utilisateur
            if (messageData.recipientId !== this.userId) {
                return false;
            }

            // Marquer comme lu seulement s'il ne l'est pas déjà
            if (!messageData.read) {
                await messageRef.update({
                    read: true
                });
            }

            return true;
        } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
            return false;
        }
    }

    /**
     * Récupérer le nombre de messages non lus
     * @returns {Promise<number>}
     */
    async getUnreadCount() {
        try {
            const unreadMessages = await this.db.collection('messages')
                .where('recipientId', '==', this.userId)
                .where('read', '==', false)
                .get();

            return unreadMessages.size;
        } catch (error) {
            console.error('Erreur lors du comptage des messages non lus:', error);
            return 0;
        }
    }

    /**
     * Récupérer tous les utilisateurs (pour la liste de sélection)
     * @returns {Promise<Array>} Liste des utilisateurs
     */
    async getAllUsers() {
        try {
            const usersSnapshot = await this.db.collection('users')
                .where('status', '==', 'active')
                .get();

            return usersSnapshot.docs
                .filter(doc => doc.id !== this.userId) // Exclure l'utilisateur actuel
                .map(doc => ({
                    id: doc.id,
                    name: doc.data().fullName || doc.data().email || 'Utilisateur',
                    email: doc.data().email || ''
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            return [];
        }
    }

    /**
     * Écouter les nouveaux messages en temps réel
     * @param {Function} callback - Fonction appelée lorsqu'un nouveau message est reçu
     */
    onNewMessage(callback) {
        if (typeof callback !== 'function') {
            console.error('Le callback doit être une fonction');
            return;
        }

        this.messageListeners.push(callback);

        // Écouter les nouveaux messages destinés à cet utilisateur
        const unsubscribe = this.db.collection('messages')
            .where('recipientId', '==', this.userId)
            .where('read', '==', false)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const messageData = {
                            id: change.doc.id,
                            ...change.doc.data(),
                            senderId: change.doc.data().senderId
                        };
                        this.messageListeners.forEach(cb => {
                            try {
                                cb(messageData);
                            } catch (error) {
                                console.error('Erreur dans le callback onNewMessage:', error);
                            }
                        });
                    }
                });
            }, (error) => {
                console.error('Erreur lors de l\'écoute des messages:', error);
            });

        this.unsubscribeListeners.push(unsubscribe);
    }

    /**
     * Nettoyer les listeners (à appeler lors de la déconnexion)
     */
    cleanup() {
        this.unsubscribeListeners.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.unsubscribeListeners = [];
        this.messageListeners = [];
    }
}

// Exposer globalement
window.MessagingSystem = MessagingSystem;

