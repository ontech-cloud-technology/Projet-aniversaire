/**
 * Service d'envoi d'emails
 * 
 * Ce service gère l'envoi de tous les emails de l'application
 * via SendGrid.
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

// Configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || process.env.SENDGRID_FROM_EMAIL || '2253342@cslaval.qc.ca';
const SENDER_NAME = process.env.COMPANY_NAME || 'ONTech-Cloud Technology';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;
const BASE_URL = process.env.BASE_URL || 'https://203celebrationhub.com';

// Initialiser SendGrid
if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
} else {
    console.warn('⚠️  SENDGRID_API_KEY non configurée. Les emails ne seront pas envoyés.');
}

/**
 * Charge un template HTML et remplace les variables
 * @param {string} templateName - Nom du template (sans extension)
 * @param {Object} variables - Objet avec les variables à remplacer
 * @returns {string} HTML du template avec variables remplacées
 */
function loadTemplate(templateName, variables = {}) {
    const templatePath = path.join(__dirname, '../email-templates', `${templateName}.html`);
    
    try {
        let template = fs.readFileSync(templatePath, 'utf8');
        
        // Remplacer les variables {{VARIABLE_NAME}}
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, variables[key] || '');
        });
        
        return template;
    } catch (error) {
        console.error(`❌ Erreur lors du chargement du template ${templateName}:`, error);
        throw new Error(`Template ${templateName} introuvable`);
    }
}

/**
 * Envoie un email de bienvenue lors de la création d'un compte
 * @param {Object} params - Paramètres de l'email
 * @param {string} params.email - Email du destinataire
 * @param {string} params.fullName - Nom complet de l'utilisateur
 * @param {string} params.temporaryPassword - Mot de passe temporaire
 * @param {string} params.role - Rôle de l'utilisateur (eleve, committee, admin)
 * @param {string} params.loginUrl - URL de connexion
 * @returns {Promise<Object>} Résultat de l'envoi
 */
async function sendWelcomeEmail({ email, fullName, temporaryPassword, role = 'eleve', loginUrl }) {
    if (!SENDGRID_API_KEY) {
        return { success: false, error: 'SendGrid non configuré' };
    }

    if (!email || !temporaryPassword) {
        return { success: false, error: 'Email et mot de passe temporaire requis' };
    }

    try {
        const roleLabel = role === 'eleve' ? 'Élève' : 
                         role === 'committee' ? 'Comité' : 
                         role === 'admin' ? 'Administrateur' : 'Membre';

        const htmlContent = loadTemplate('welcome-email', {
            FULL_NAME: fullName || 'Utilisateur',
            EMAIL: email,
            TEMPORARY_PASSWORD: temporaryPassword,
            ROLE: roleLabel,
            LOGIN_URL: loginUrl || `${BASE_URL}/login.html`,
            COMPANY_NAME: SENDER_NAME,
            SUPPORT_EMAIL: SUPPORT_EMAIL || ''
        });

        const msg = {
            to: email,
            from: {
                email: SENDER_EMAIL,
                name: SENDER_NAME
            },
            subject: `🎉 Bienvenue sur ${SENDER_NAME}, ${fullName || 'Utilisateur'} !`,
            html: htmlContent,
            text: `
Bienvenue sur ${SENDER_NAME}, ${fullName || 'Utilisateur'} !

Ton compte a été créé avec succès.

Identifiants de connexion:
Email: ${email}
Mot de passe temporaire: ${temporaryPassword}
Rôle: ${roleLabel}

⚠️ Important: Tu devras changer ce mot de passe temporaire lors de ta première connexion.

Pour te connecter, va sur: ${loginUrl || `${BASE_URL}/login.html`}

Bonne journée !
L'équipe ${SENDER_NAME}
            `.trim()
        };

        await sgMail.send(msg);
        console.log(`✅ Email de bienvenue envoyé à ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Envoie une notification lorsqu'un message est reçu
 * @param {Object} params - Paramètres de l'email
 * @param {string} params.email - Email du destinataire
 * @param {string} params.recipientName - Nom du destinataire
 * @param {string} params.senderName - Nom de l'expéditeur
 * @param {string} params.message - Contenu du message
 * @param {boolean} params.isPublic - Si le message est public
 * @param {string} params.notificationsUrl - URL vers les notifications
 * @param {string} params.birthdayMessage - Message d'anniversaire optionnel
 * @returns {Promise<Object>} Résultat de l'envoi
 */
async function sendMessageNotification({ email, recipientName, senderName, message, isPublic = false, notificationsUrl, birthdayMessage = '' }) {
    if (!SENDGRID_API_KEY) {
        return { success: false, error: 'SendGrid non configuré' };
    }

    if (!email || !recipientName || !senderName || !message) {
        return { success: false, error: 'Paramètres manquants' };
    }

    try {
        const senderInitial = (senderName || 'A')[0].toUpperCase();
        const messageType = isPublic ? 'Public' : 'Secret';
        const badgeClass = isPublic ? 'badge-public' : 'badge-secret';
        
        // Générer la section du message d'anniversaire si présent
        let birthdayMessageSection = '';
        if (birthdayMessage && birthdayMessage.trim() && !birthdayMessage.includes('nouveau message')) {
            birthdayMessageSection = `
            <div class="info-box" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #856404; margin: 0; font-weight: 600;">${birthdayMessage}</p>
            </div>
            `;
        }
        
        let htmlContent = loadTemplate('message-notification', {
            RECIPIENT_NAME: recipientName,
            SENDER_NAME: senderName || 'Anonyme',
            SENDER_INITIAL: senderInitial,
            MESSAGE_TEXT: message,
            MESSAGE_TYPE: messageType,
            BADGE_CLASS: badgeClass,
            BIRTHDAY_MESSAGE_SECTION: birthdayMessageSection || '',
            NOTIFICATIONS_URL: notificationsUrl || `${BASE_URL}/eleve.html#notifications`,
            COMPANY_NAME: SENDER_NAME
        });
        
        // Remplacer la section d'anniversaire (triple braces pour HTML non échappé)
        htmlContent = htmlContent.replace(/{{{BIRTHDAY_MESSAGE_SECTION}}}/g, birthdayMessageSection || '');

        const msg = {
            to: email,
            from: {
                email: SENDER_EMAIL,
                name: SENDER_NAME
            },
            subject: `💌 Nouveau message de ${senderName} sur ${SENDER_NAME}`,
            html: htmlContent,
            text: `
Salut ${recipientName} !

${senderName} t'a envoyé un message sur ${SENDER_NAME}.

Message:
"${message}"

Type: ${messageType}

Pour voir tous tes messages, va sur: ${notificationsUrl || `${BASE_URL}/eleve.html#notifications`}

Bonne journée !
L'équipe ${SENDER_NAME}
            `.trim()
        };

        await sgMail.send(msg);
        console.log(`✅ Notification de message envoyée à ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de la notification:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendWelcomeEmail,
    sendMessageNotification
};

