/**
 * Script pour créer les comptes démo directement
 * Utilise l'API REST de Firebase Identity Toolkit
 */

const https = require('https');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Configuration Firebase
const FIREBASE_PROJECT_ID = 'projet-aniversaire';
const FIREBASE_API_KEY = 'AIzaSyDB6rcdICZkqicjO5R4sKBPOcL4IFkVRzI';

// Initialiser Firebase Admin
let admin, db, auth;

try {
  // Essayer d'initialiser avec les credentials par défaut
  admin = initializeApp({
    projectId: FIREBASE_PROJECT_ID
  });
  auth = getAuth(admin);
  db = getFirestore(admin);
  console.log('✅ Firebase Admin initialisé');
} catch (error) {
  console.error('❌ Erreur d\'initialisation Firebase Admin:', error.message);
  console.error('\n💡 Ce script nécessite Firebase Admin SDK avec des credentials.');
  console.error('   Alternative: Utilisez l\'interface super-admin.html pour créer les comptes manuellement.');
  process.exit(1);
}

/**
 * Créer un utilisateur et son document Firestore
 */
async function createUserAccount(email, password, fullName, birthday) {
  try {
    console.log(`\n📝 Création de ${email}...`);

    // 1. Créer l'utilisateur dans Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: email,
        password: password,
        emailVerified: false,
        disabled: false
      });
      console.log(`   ✅ Utilisateur créé dans Auth (UID: ${userRecord.uid})`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`   ⚠️  Email existe déjà, récupération de l'utilisateur...`);
        userRecord = await auth.getUserByEmail(email);
        console.log(`   ✅ Utilisateur trouvé (UID: ${userRecord.uid})`);
      } else {
        throw error;
      }
    }

    // 2. Créer/mettre à jour le document dans Firestore
    const userRef = db.collection('users').doc(userRecord.uid);
    const userData = {
      email: email,
      fullName: fullName,
      role: 'eleve',
      status: 'active',
      disabled: false,
      profileCompleted: false,
      needsPasswordChange: false,
      reputation: 100,
      accountType: 'standard',
      birthday: birthday,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userDoc = await userRef.get();
    if (userDoc.exists) {
      await userRef.update({
        ...userData,
        updatedAt: new Date()
      });
      console.log(`   ✅ Document Firestore mis à jour`);
    } else {
      await userRef.set(userData);
      console.log(`   ✅ Document Firestore créé`);
    }

    // 3. Créer l'entrée dans celebrations
    const celebrationsRef = db.collection('celebrations');
    const existingCelebration = await celebrationsRef
      .where('email', '==', email)
      .limit(1)
      .get();

    const fileNumber = email.split('@')[0];
    const celebrationData = {
      fullName: fullName,
      email: email,
      birthday: birthday,
      fileNumber: fileNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (existingCelebration.empty) {
      await celebrationsRef.add(celebrationData);
      console.log(`   ✅ Célébration créée (anniversaire: ${birthday})`);
    } else {
      await existingCelebration.docs[0].ref.update({
        ...celebrationData,
        updatedAt: new Date()
      });
      console.log(`   ✅ Célébration mise à jour (anniversaire: ${birthday})`);
    }

    return { success: true, uid: userRecord.uid, email: email };
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
    return { success: false, email: email, error: error.message };
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Création des comptes de démonstration...\n');

  const accounts = [
    {
      email: 'demo1@onteech.com',
      password: '123456',
      fullName: 'Demo 1',
      birthday: '2012-12-02'
    },
    {
      email: 'demo2@ontech.com',
      password: '123456',
      fullName: 'Demo 2',
      birthday: '2012-12-03'
    }
  ];

  const results = [];
  for (const account of accounts) {
    const result = await createUserAccount(
      account.email,
      account.password,
      account.fullName,
      account.birthday
    );
    results.push(result);
    // Petite pause entre les créations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  console.log(`✅ Comptes créés: ${successCount}`);
  console.log(`❌ Échecs: ${failCount}`);
  results.forEach(r => {
    if (r.success) {
      console.log(`   ✅ ${r.email} (UID: ${r.uid})`);
    } else {
      console.log(`   ❌ ${r.email}: ${r.error}`);
    }
  });

  if (successCount > 0) {
    console.log('\n💡 Comptes créés avec succès !');
    console.log('   Vous pouvez maintenant vous connecter avec:');
    accounts.forEach(acc => {
      console.log(`   📧 ${acc.email} / ${acc.password}`);
    });
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Exécuter
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { createUserAccount };

