/**
 * Script pour créer des comptes utilisateurs de démonstration
 * Utilise Firebase Admin SDK pour créer les utilisateurs dans Firebase Auth et Firestore
 */

// Note: Ce script nécessite Firebase Admin SDK
// Pour l'exécuter, vous devez avoir un fichier de clé de service Firebase
// ou utiliser les variables d'environnement appropriées

const admin = require('firebase-admin');

// Initialiser Firebase Admin
// Option 1: Utiliser une clé de service (recommandé)
// Téléchargez votre clé de service depuis Firebase Console:
// https://console.firebase.google.com/project/projet-aniversaire/settings/serviceaccounts/adminsdk
// Puis décommentez et modifiez le chemin ci-dessous:
/*
const serviceAccount = require('./firebase-service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
*/

// Option 2: Utiliser les variables d'environnement GOOGLE_APPLICATION_CREDENTIALS
if (!admin.apps.length) {
  try {
    // Essayer d'initialiser avec les variables d'environnement
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'projet-aniversaire'
    });
    console.log('✅ Firebase Admin initialisé avec les credentials par défaut');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Firebase Admin:', error.message);
    console.error('\n💡 Pour utiliser ce script, vous devez :');
    console.error('   1. Télécharger votre clé de service Firebase depuis:');
    console.error('      https://console.firebase.google.com/project/projet-aniversaire/settings/serviceaccounts/adminsdk');
    console.error('   2. Sauvegarder la clé comme "firebase-service-account-key.json" dans ce dossier');
    console.error('   3. Décommenter les lignes pour utiliser la clé de service');
    console.error('\n   OU');
    console.error('   Utiliser l\'interface super-admin.html pour créer les comptes manuellement');
    console.error('\n   Comptes à créer:');
    console.error('   - demo1@onteech.com / 123456 / eleve / standard');
    console.error('   - demo2@ontech.com / 123456 / eleve / standard');
    process.exit(1);
  }
}

const db = admin.firestore();
const auth = admin.auth();

/**
 * Créer un utilisateur de démonstration
 */
async function createDemoUser(email, password, fullName, fileNumber = null, birthday = null) {
  try {
    console.log(`\n📝 Création du compte: ${email}`);
    
    // 1. Créer l'utilisateur dans Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: email,
        password: password,
        emailVerified: false,
        disabled: false
      });
      console.log(`   ✅ Utilisateur créé dans Firebase Auth (UID: ${userRecord.uid})`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`   ⚠️  L'email ${email} existe déjà dans Firebase Auth`);
        // Récupérer l'utilisateur existant
        userRecord = await auth.getUserByEmail(email);
        console.log(`   📋 Utilisation de l'utilisateur existant (UID: ${userRecord.uid})`);
      } else {
        throw error;
      }
    }

    // 2. Créer le document dans Firestore
    const userData = {
      email: email,
      fullName: fullName,
      role: 'eleve',
      status: 'active',
      disabled: false,
      profileCompleted: false,
      needsPasswordChange: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      reputation: 100,
      accountType: 'standard'
    };

    // Ajouter fileNumber si fourni
    if (fileNumber) {
      userData.fileNumber = fileNumber;
    }

    // Ajouter birthday si fourni
    if (birthday) {
      userData.birthday = birthday;
    }

    const userRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      console.log(`   ⚠️  Le document Firestore existe déjà pour ${email}`);
      // Mettre à jour les données
      await userRef.update({
        ...userData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`   ✅ Document Firestore mis à jour`);
    } else {
      await userRef.set(userData);
      console.log(`   ✅ Document Firestore créé`);
    }

    // 3. Créer l'entrée dans la collection 'celebrations' si birthday est fourni
    if (birthday) {
      try {
        const celebrationsRef = db.collection('celebrations');
        // Vérifier si une célébration existe déjà pour cet email
        const existingCelebration = await celebrationsRef
          .where('email', '==', email)
          .limit(1)
          .get();
        
        if (existingCelebration.empty) {
          // Extraire le fileNumber de l'email si possible, sinon utiliser l'email
          const fileNumberFromEmail = email.split('@')[0];
          
          await celebrationsRef.add({
            fullName: fullName,
            email: email,
            birthday: birthday,
            fileNumber: fileNumberFromEmail,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`   ✅ Célébration créée dans Firestore (anniversaire: ${birthday})`);
        } else {
          // Mettre à jour la célébration existante
          const celebrationDoc = existingCelebration.docs[0];
          await celebrationDoc.ref.update({
            birthday: birthday,
            fullName: fullName,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`   ✅ Célébration mise à jour (anniversaire: ${birthday})`);
        }
      } catch (error) {
        console.warn(`   ⚠️  Erreur lors de la création de la célébration: ${error.message}`);
      }
    }

    console.log(`   ✅ Compte ${email} créé avec succès !`);
    return { success: true, uid: userRecord.uid, email: email };
    
  } catch (error) {
    console.error(`   ❌ Erreur lors de la création de ${email}:`, error.message);
    return { success: false, email: email, error: error.message };
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Démarrage de la création des comptes de démonstration...\n');

  const users = [
    {
      email: 'demo1@onteech.com',
      password: '123456',
      fullName: 'Demo 1',
      fileNumber: null,
      birthday: '2012-12-02' // 2 décembre 2012
    },
    {
      email: 'demo2@ontech.com',
      password: '123456',
      fullName: 'Demo 2',
      fileNumber: null,
      birthday: '2012-12-03' // 3 décembre 2012
    }
  ];

  const results = [];
  for (const user of users) {
    const result = await createDemoUser(
      user.email,
      user.password,
      user.fullName,
      user.fileNumber,
      user.birthday
    );
    results.push(result);
  }

  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`✅ Comptes créés avec succès: ${successCount}`);
  console.log(`❌ Échecs: ${failCount}`);
  
  results.forEach(result => {
    if (result.success) {
      console.log(`   ✅ ${result.email} (UID: ${result.uid})`);
    } else {
      console.log(`   ❌ ${result.email}: ${result.error}`);
    }
  });

  console.log('\n💡 Vous pouvez maintenant vous connecter avec ces comptes :');
  users.forEach(user => {
    console.log(`   📧 ${user.email} / Mot de passe: ${user.password}`);
  });

  process.exit(failCount > 0 ? 1 : 0);
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { createDemoUser };

