/**
 * ========================================
 * SCRIPT DE CRÉATION AUTOMATIQUE DES COMPTES DÉMO
 * ========================================
 * 
 * INSTRUCTIONS:
 * 1. Ouvrez super-admin.html dans votre navigateur
 * 2. Connectez-vous en tant qu'administrateur
 * 3. Ouvrez la console du navigateur (F12)
 * 4. Copiez TOUT le contenu de ce fichier
 * 5. Collez-le dans la console et appuyez sur Entrée
 * 
 * Le script va créer automatiquement:
 * - 2253343@cslaval.qc.ca (2 décembre 2012)
 * - 2253344@cslaval.qc.ca (3 décembre 2012)
 */

(async function autoCreateDemoAccounts() {
    console.log('🚀 Démarrage de la création automatique des comptes démo...\n');

    const accounts = [
        {
            email: '2253343@cslaval.qc.ca',
            password: '123456',
            fullName: 'Demo 1',
            role: 'eleve',
            accountType: 'standard',
            birthday: '2012-12-02'
        },
        {
            email: '2253344@cslaval.qc.ca',
            password: '123456',
            fullName: 'Demo 2',
            role: 'eleve',
            accountType: 'standard',
            birthday: '2012-12-03'
        }
    ];

    const results = [];

    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        try {
            console.log(`\n📝 [${i + 1}/${accounts.length}] Création de ${account.email}...`);

            await new Promise(resolve => setTimeout(resolve, 500));

            // Ouvrir le modal - utiliser la fonction openCreateUserModal si disponible
            if (typeof openCreateUserModal === 'function') {
                openCreateUserModal();
            } else {
                // Sinon, chercher le bouton
                let createBtn = document.querySelector('button[onclick*="openCreateUserModal"]');
                if (!createBtn) {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    createBtn = buttons.find(btn => btn.textContent.includes('Créer un Compte'));
                }
                if (createBtn) {
                    createBtn.click();
                } else {
                    throw new Error('Impossible d\'ouvrir le modal de création');
                }
            }
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Attendre que le modal soit complètement ouvert
            await new Promise(resolve => setTimeout(resolve, 500));

            // Remplir le formulaire
            const fullNameInput = document.getElementById('createFullName');
            const emailInput = document.getElementById('createEmail');
            const passwordInput = document.getElementById('createPassword');

            if (!fullNameInput || !emailInput || !passwordInput) {
                throw new Error('Champs du formulaire non trouvés');
            }

            fullNameInput.value = account.fullName;
            emailInput.value = account.email;
            passwordInput.value = account.password;

            // Déclencher les événements
            fullNameInput.dispatchEvent(new Event('input', { bubbles: true }));
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

            await new Promise(resolve => setTimeout(resolve, 300));

            // Sélectionner "Utilisateur Normal" - IMPORTANT: doit être fait en premier
            const normalRadio = document.querySelector('input[name="userType"][value="normal"]');
            if (normalRadio) {
                if (!normalRadio.checked) {
                    normalRadio.checked = true;
                    normalRadio.dispatchEvent(new Event('change', { bubbles: true }));
                }
                await new Promise(resolve => setTimeout(resolve, 500)); // Attendre que les sections se mettent à jour
                console.log('   ✅ Type d\'utilisateur: Normal sélectionné');
            } else {
                throw new Error('Radio "Utilisateur Normal" non trouvé');
            }

            // Sélectionner "Compte Standard" - doit être visible après sélection "Normal"
            const standardRadio = document.querySelector('input[name="accountType"][value="standard"]');
            if (standardRadio) {
                if (!standardRadio.checked) {
                    standardRadio.checked = true;
                    standardRadio.dispatchEvent(new Event('change', { bubbles: true }));
                }
                await new Promise(resolve => setTimeout(resolve, 500)); // Attendre que les sections se mettent à jour
                console.log('   ✅ Type de compte: Standard sélectionné');
            } else {
                throw new Error('Radio "Compte Standard" non trouvé');
            }

            // Sélectionner le rôle "eleve" - doit être visible après sélection "Standard"
            const roleSelect = document.getElementById('createRole');
            if (roleSelect) {
                roleSelect.value = account.role;
                roleSelect.dispatchEvent(new Event('change', { bubbles: true }));
                await new Promise(resolve => setTimeout(resolve, 300));
                console.log(`   ✅ Rôle: ${account.role} sélectionné`);
            } else {
                throw new Error('Select "Rôle" non trouvé');
            }

            // Décocher "Envoyer email de bienvenue"
            const sendWelcomeEmail = document.getElementById('sendWelcomeEmail');
            if (sendWelcomeEmail && sendWelcomeEmail.checked) {
                sendWelcomeEmail.checked = false;
            }

            // Vérifier que tout est bien sélectionné avant de soumettre
            const userTypeChecked = document.querySelector('input[name="userType"]:checked');
            const accountTypeChecked = document.querySelector('input[name="accountType"]:checked');
            
            if (!userTypeChecked || userTypeChecked.value !== 'normal') {
                throw new Error('Type d\'utilisateur "Normal" n\'est pas sélectionné');
            }
            if (!accountTypeChecked || accountTypeChecked.value !== 'standard') {
                throw new Error('Type de compte "Standard" n\'est pas sélectionné');
            }
            if (!roleSelect || roleSelect.value !== account.role) {
                throw new Error(`Rôle "${account.role}" n\'est pas sélectionné`);
            }

            console.log('   ✅ Vérifications OK, soumission du formulaire...');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Soumettre
            const form = document.getElementById('createUserForm');
            if (!form) {
                throw new Error('Formulaire non trouvé');
            }
            
            // Créer et déclencher l'événement submit
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            const submitted = form.dispatchEvent(submitEvent);
            
            if (!submitted) {
                throw new Error('Soumission du formulaire annulée');
            }

            // Attendre le résultat
            let success = false;
            for (let j = 0; j < 30; j++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                const successMsg = document.getElementById('createUserSuccess');
                const errorMsg = document.getElementById('createUserError');
                
                if (successMsg && !successMsg.classList.contains('hidden')) {
                    success = true;
                    console.log(`   ✅ ${account.email} créé !`);
                    break;
                }
                
                if (errorMsg && !errorMsg.classList.contains('hidden')) {
                    const errorText = errorMsg.textContent;
                    if (errorText.includes('existe déjà') || errorText.includes('already exists')) {
                        console.log(`   ⚠️  ${account.email} existe déjà`);
                        success = true;
                        break;
                    } else {
                        throw new Error(errorText);
                    }
                }
            }

            if (!success) {
                throw new Error('Timeout');
            }

            // Ajouter la date d'anniversaire - ATTENDRE que le compte soit créé
            await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes pour que le compte soit créé
            
            try {
                console.log('   📅 Recherche de l\'utilisateur créé...');
                const usersSnapshot = await firebase.firestore().collection('users')
                    .where('email', '==', account.email)
                    .limit(1)
                    .get();
                
                if (usersSnapshot.empty) {
                    console.warn(`   ⚠️  Utilisateur ${account.email} non trouvé, tentative de création de la célébration quand même...`);
                } else {
                    const userId = usersSnapshot.docs[0].id;
                    console.log(`   ✅ Utilisateur trouvé (UID: ${userId})`);
                    
                    // Mettre à jour le document utilisateur avec la date d'anniversaire
                    await firebase.firestore().collection('users').doc(userId).update({
                        birthday: account.birthday,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('   ✅ Date d\'anniversaire ajoutée au document utilisateur');
                }
                
                // Créer ou mettre à jour la célébration
                // Pour les emails @cslaval.qc.ca, le fileNumber est le numéro avant @
                const fileNumber = account.email.split('@')[0];
                const celebrationsRef = firebase.firestore().collection('celebrations');
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
                    const newCelebrationRef = await celebrationsRef.add({
                        ...celebrationData,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log(`   ✅ Célébration créée (ID: ${newCelebrationRef.id})`);
                } else {
                    await existingCelebration.docs[0].ref.update(celebrationData);
                    console.log(`   ✅ Célébration mise à jour (ID: ${existingCelebration.docs[0].id})`);
                }
                console.log(`   ✅ Anniversaire configuré: ${account.birthday}`);
            } catch (e) {
                console.error(`   ❌ Erreur lors de l'ajout de l'anniversaire: ${e.message}`);
                console.error('   Stack:', e.stack);
            }

            // Fermer le modal
            const closeBtn = document.querySelector('#createUserModal button[onclick*="closeModal"], #createUserModal .close-modal');
            if (closeBtn) closeBtn.click();
            await new Promise(resolve => setTimeout(resolve, 500));

            results.push({ success: true, email: account.email });
            if (i < accounts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

        } catch (error) {
            console.error(`   ❌ Erreur: ${error.message}`);
            results.push({ success: false, email: account.email, error: error.message });
            const closeBtn = document.querySelector('#createUserModal button[onclick*="closeModal"], #createUserModal .close-modal');
            if (closeBtn) closeBtn.click();
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Comptes créés: ${successCount}/${accounts.length}`);
    results.forEach(r => {
        console.log(r.success ? `   ✅ ${r.email}` : `   ❌ ${r.email}: ${r.error}`);
    });
    if (successCount === accounts.length) {
        console.log('\n🎉 Tous les comptes ont été créés avec succès !');
    }
})();

