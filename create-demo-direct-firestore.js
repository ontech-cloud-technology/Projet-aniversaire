/**
 * Script pour créer directement les comptes démo dans Firestore
 * Note: Les utilisateurs Auth devront être créés manuellement ou via Firebase Console
 * Ce script crée les documents Firestore et celebrations
 */

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDB6rcdICZkqicjO5R4sKBPOcL4IFkVRzI",
    authDomain: "projet-aniversaire.firebaseapp.com",
    projectId: "projet-aniversaire",
    storageBucket: "projet-aniversaire.firebasestorage.app",
    messagingSenderId: "910528476811",
    appId: "1:910528476811:web:421b250d3e53f8ee89068e"
};

// Initialiser Firebase (côté client)
if (typeof firebase === 'undefined') {
    console.error('Firebase n\'est pas chargé. Ce script doit être exécuté dans un navigateur avec Firebase chargé.');
    process.exit(1);
}

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const accounts = [
    {
        email: 'demo1@onteech.com',
        password: '123456',
        fullName: 'Demo 1',
        role: 'eleve',
        accountType: 'standard',
        birthday: '2012-12-02'
    },
    {
        email: 'demo2@ontech.com',
        password: '123456',
        fullName: 'Demo 2',
        role: 'eleve',
        accountType: 'standard',
        birthday: '2012-12-03'
    }
];

async function createAccountsDirectly() {
    console.log('🚀 Création directe des comptes démo dans Firestore...\n');
    console.log('⚠️  Note: Les utilisateurs Auth devront être créés manuellement via Firebase Console ou super-admin.html\n');

    const results = [];

    for (const account of accounts) {
        try {
            console.log(`\n📝 Traitement de ${account.email}...`);

            // Vérifier si l'utilisateur existe déjà dans Firestore
            const usersSnapshot = await db.collection('users')
                .where('email', '==', account.email)
                .limit(1)
                .get();

            let userId = null;
            if (!usersSnapshot.empty) {
                userId = usersSnapshot.docs[0].id;
                console.log(`   ⚠️  Utilisateur existe déjà dans Firestore (UID: ${userId})`);
            } else {
                // Créer un document temporaire (sans UID Auth pour l'instant)
                // On va créer avec un ID temporaire
                const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                userId = tempId;
                
                const userData = {
                    email: account.email,
                    fullName: account.fullName,
                    role: account.role,
                    status: 'active',
                    disabled: false,
                    profileCompleted: false,
                    needsPasswordChange: false,
                    reputation: 100,
                    accountType: account.accountType,
                    birthday: account.birthday,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    _temp: true // Flag pour indiquer que c'est temporaire
                };

                await db.collection('users').doc(userId).set(userData);
                console.log(`   ✅ Document Firestore créé (ID temporaire: ${userId})`);
                console.log(`   ⚠️  IMPORTANT: Créez l'utilisateur Auth manuellement et mettez à jour ce document avec le vrai UID`);
            }

            // Créer ou mettre à jour la célébration
            const fileNumber = account.email.split('@')[0];
            const celebrationsRef = db.collection('celebrations');
            const existingCelebration = await celebrationsRef
                .where('email', '==', account.email)
                .limit(1)
                .get();

            const celebrationData = {
                fullName: account.fullName,
                email: account.email,
                birthday: account.birthday,
                fileNumber: fileNumber,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (existingCelebration.empty) {
                await celebrationsRef.add({
                    ...celebrationData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log(`   ✅ Célébration créée (anniversaire: ${account.birthday})`);
            } else {
                await existingCelebration.docs[0].ref.update(celebrationData);
                console.log(`   ✅ Célébration mise à jour (anniversaire: ${account.birthday})`);
            }

            results.push({ success: true, email: account.email, userId: userId });

        } catch (error) {
            console.error(`   ❌ Erreur: ${error.message}`);
            results.push({ success: false, email: account.email, error: error.message });
        }
    }

    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Documents créés: ${successCount}/${accounts.length}`);
    console.log('\n⚠️  ACTION REQUISE:');
    console.log('   Créez les utilisateurs Auth manuellement via:');
    console.log('   1. Firebase Console: https://console.firebase.google.com/project/projet-aniversaire/authentication/users');
    console.log('   2. Ou utilisez super-admin.html pour créer les comptes');
    console.log('\n   Comptes à créer:');
    accounts.forEach(acc => {
        console.log(`   📧 ${acc.email} / ${acc.password}`);
    });

    return results;
}

// Exécuter si dans un navigateur
if (typeof window !== 'undefined') {
    // Attendre que Firebase soit chargé
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        createAccountsDirectly();
    } else {
        console.error('Firebase n\'est pas initialisé. Chargez firebase.js d\'abord.');
    }
}

module.exports = { createAccountsDirectly };

