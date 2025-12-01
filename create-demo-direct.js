/**
 * Script pour créer les comptes démo directement via l'API REST Firebase
 * Utilise l'API Identity Toolkit avec l'API key
 */

const https = require('https');

const FIREBASE_API_KEY = 'AIzaSyDB6rcdICZkqicjO5R4sKBPOcL4IFkVRzI';
const FIREBASE_PROJECT_ID = 'projet-aniversaire';

/**
 * Créer un utilisateur via l'API REST Firebase Identity Toolkit
 */
function createUserViaAPI(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: email,
      password: password,
      returnSecureToken: true
    });

    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            if (response.error.message.includes('EMAIL_EXISTS')) {
              // L'utilisateur existe déjà, on va le récupérer
              resolve({ exists: true, email: email });
            } else {
              reject(new Error(response.error.message));
            }
          } else {
            resolve({ uid: response.localId, idToken: response.idToken, email: email });
          }
        } catch (error) {
          reject(new Error(`Erreur de parsing: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Créer un document Firestore via l'API REST
 */
function createFirestoreDocument(collection, docId, data, idToken) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      fields: Object.keys(data).reduce((acc, key) => {
        let value = data[key];
        let fieldType = 'stringValue';
        
        if (typeof value === 'number') {
          fieldType = 'integerValue';
          value = value.toString();
        } else if (typeof value === 'boolean') {
          fieldType = 'booleanValue';
          value = value.toString();
        } else if (value instanceof Date) {
          fieldType = 'timestampValue';
          value = value.toISOString();
        } else if (typeof value === 'object' && value !== null) {
          // Pour les timestamps Firestore
          if (value._methodName === 'serverTimestamp') {
            fieldType = 'timestampValue';
            value = new Date().toISOString();
          } else {
            value = JSON.stringify(value);
          }
        } else {
          value = value.toString();
        }
        
        acc[key] = { [fieldType]: value };
        return acc;
      }, {})
    });

    const path = docId 
      ? `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`
      : `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}`;

    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/${path}`,
      method: docId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(response.error?.message || `HTTP ${res.statusCode}`));
          } else {
            resolve(response);
          }
        } catch (error) {
          reject(new Error(`Erreur de parsing: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Créer un compte complet
 */
async function createAccount(email, password, fullName, birthday) {
  try {
    console.log(`\n📝 Création de ${email}...`);

    // 1. Créer l'utilisateur dans Auth
    let authResult;
    try {
      authResult = await createUserViaAPI(email, password);
      if (authResult.exists) {
        console.log(`   ⚠️  L'utilisateur existe déjà dans Auth`);
        // Pour récupérer l'ID, on devra se connecter
        // Pour l'instant, on va créer juste le document Firestore
        authResult = { email: email, uid: null };
      } else {
        console.log(`   ✅ Utilisateur créé dans Auth (UID: ${authResult.uid})`);
      }
    } catch (error) {
      console.log(`   ⚠️  Erreur Auth (peut-être existe déjà): ${error.message}`);
      authResult = { email: email, uid: null };
    }

    // Note: Sans Admin SDK, on ne peut pas créer directement les documents Firestore
    // car il faut un token d'authentification admin
    // On va créer un script alternatif qui utilise l'interface web

    return { success: true, email: email, uid: authResult.uid };
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
    return { success: false, email: email, error: error.message };
  }
}

console.log('⚠️  Ce script nécessite Firebase Admin SDK pour créer les documents Firestore.');
console.log('   Utilisation d\'une méthode alternative...\n');

// Alternative: Créer un script HTML qui peut être exécuté dans le navigateur
console.log('💡 Pour créer les comptes, utilisez plutôt:');
console.log('   1. Ouvrez super-admin.html');
console.log('   2. Connectez-vous en tant qu\'admin');
console.log('   3. Créez les comptes avec les informations suivantes:\n');

const accounts = [
  { email: 'demo1@onteech.com', password: '123456', fullName: 'Demo 1', birthday: '2012-12-02' },
  { email: 'demo2@ontech.com', password: '123456', fullName: 'Demo 2', birthday: '2012-12-03' }
];

accounts.forEach(acc => {
  console.log(`   📧 ${acc.email}`);
  console.log(`      - Mot de passe: ${acc.password}`);
  console.log(`      - Nom: ${acc.fullName}`);
  console.log(`      - Type: Élève`);
  console.log(`      - Anniversaire: ${acc.birthday}`);
  console.log('');
});

process.exit(0);

