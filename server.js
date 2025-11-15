/**
 * Serveur API pour l'envoi d'emails
 * 
 * Ce serveur expose des endpoints REST pour envoyer des emails
 * via le service email-service.js
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const emailService = require("./services/email-service");

const app = express();
const PORT = process.env.PORT || 3001;

const parseAllowedOrigins = () => {
  const { ALLOWED_ORIGINS } = process.env;
  if (!ALLOWED_ORIGINS) return [];
  return ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: false,
  }),
);

app.use(express.json());

// Endpoint de santé
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "email-api" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "email-api" });
});

// Endpoint pour envoyer un email de bienvenue
app.post("/api/send-welcome-email", async (req, res) => {
  try {
    const { email, fullName, tempPassword, temporaryPassword, role, loginUrl } = req.body;

    // Support des deux noms de paramètres (tempPassword et temporaryPassword)
    const password = tempPassword || temporaryPassword;

    if (!email || !password) {
    return res.status(400).json({
      success: false,
        error: "Paramètres manquants: email et mot de passe temporaire requis"
    });
  }

    const result = await emailService.sendWelcomeEmail({ 
      email, 
      fullName: fullName || email, 
      temporaryPassword: password,
      role: role || 'eleve',
      loginUrl: loginUrl || `${req.protocol}://${req.get('host')}/login.html`
    });

    if (result.success) {
      res.json({ success: true, message: "Email envoyé avec succès" });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("❌ Erreur API send-welcome-email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint pour envoyer une notification de message
app.post("/api/send-message-notification", async (req, res) => {
  try {
    const { email, recipientName, senderName, message, isPublic, notificationsUrl, birthdayMessage } = req.body;

  if (!email || !recipientName || !senderName || !message) {
    return res.status(400).json({
      success: false,
        error: "Paramètres manquants: email, recipientName, senderName, message requis"
    });
  }

    const result = await emailService.sendMessageNotification({
      email,
      recipientName,
      senderName,
      message,
      isPublic: isPublic || false,
      notificationsUrl: notificationsUrl || `${req.protocol}://${req.get('host')}/eleve.html#notifications`,
      birthdayMessage: birthdayMessage || ''
    });

    if (result.success) {
      res.json({ success: true, message: "Notification envoyée avec succès" });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("❌ Erreur API send-message-notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Démarrer le serveur
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📧 Serveur API Email démarré avec succès !`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Port: ${PORT}`);
    console.log(`Endpoints disponibles:`);
    console.log(`  POST http://localhost:${PORT}/api/send-welcome-email`);
    console.log(`  POST http://localhost:${PORT}/api/send-message-notification`);
    console.log(`  GET  http://localhost:${PORT}/api/health`);
    if (allowedOrigins.length) {
      console.log(`\nOrigines autorisées: ${allowedOrigins.join(", ")}`);
    } else {
      console.log(`\nCORS: * (toutes origines autorisées)`);
    }
    console.log(`${'='.repeat(60)}\n`);
  });
}

module.exports = { app };

