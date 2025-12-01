/**
 * Script à exécuter dans la console du navigateur sur super-admin.html
 * pour créer automatiquement les comptes de démonstration
 * 
 * INSTRUCTIONS:
 * 1. Ouvrez super-admin.html dans votre navigateur
 * 2. Connectez-vous en tant qu'administrateur
 * 3. Ouvrez la console du navigateur (F12)
 * 4. Copiez-collez ce script complet et appuyez sur Entrée
 */

(async function autoCreateDemoAccounts() {
    console.log('🚀 Démarrage de la création automatique des comptes démo...\n');

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

    const results = [];

    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        try {
            console.log(`\n📝 [${i + 1}/${accounts.length}] Création de ${account.email}...`);

            // Attendre que la page soit prête
            await new Promise(resolve => setTimeout(resolve, 500));

            // Ouvrir le modal de création
            const createBtn = document.getElementById('createUserBtn');
            if (!createBtn) {
                throw new Error('Bouton "Créer un Compte" non trouvé');
            }
            createBtn.click();
            await new Promise(resolve => setTimeout(resolve, 800));

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

            // Déclencher les événements input pour que les handlers se déclenchent
            fullNameInput.dispatchEvent(new Event('input', { bubbles: true }));
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

            await new Promise(resolve => setTimeout(resolve, 300));

            // IMPORTANT: Pour utiliser des emails personnalisés (demo1@onteech.com), 
            // on doit créer comme "Utilisateur Normal" et non "Élève"
            // Car les élèves ont leur email généré automatiquement depuis le fileNumber
            
            // S'assurer que "Utilisateur Normal" est sélectionné
            const normalRadio = document.querySelector('input[name="userType"][value="normal"]');
            if (normalRadio && !normalRadio.checked) {
                normalRadio.checked = true;
                normalRadio.dispatchEvent(new Event('change', { bubbles: true }));
                await new Promise(resolve => setTimeout(resolve, 300));
                console.log('   ✅ Type d\'utilisateur: Utilisateur Normal sélectionné');
            }

            // Sélectionner le type de compte "standard"
            const standardRadio = document.querySelector('input[name="accountType"][value="standard"]');
            if (standardRadio && !standardRadio.checked) {
                standardRadio.checked = true;
                standardRadio.dispatchEvent(new Event('change', { bubbles: true }));
                await new Promise(resolve => setTimeout(resolve, 300));
                console.log('   ✅ Type de compte: Standard sélectionné');
            }

            // Sélectionner le rôle "eleve"
            const roleSelect = document.getElementById('createRole');
            if (roleSelect) {
                roleSelect.value = account.role;
                roleSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('   ✅ Rôle: Élève sélectionné');
            }

            // Décocher "Envoyer email de bienvenue"
            const sendWelcomeEmail = document.getElementById('sendWelcomeEmail');
            if (sendWelcomeEmail && sendWelcomeEmail.checked) {
                sendWelcomeEmail.checked = false;
            }

            await new Promise(resolve => setTimeout(resolve, 500));

            // Soumettre le formulaire
            const form = document.getElementById('createUserForm');
            if (!form) {
                throw new Error('Formulaire non trouvé');
            }

            console.log('   ⏳ Soumission du formulaire...');
            
            // Créer et déclencher l'événement submit
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            const submitted = form.dispatchEvent(submitEvent);
            
            if (!submitted) {
                throw new Error('Soumission du formulaire annulée');
            }

            // Attendre que le compte soit créé (vérifier le message de succès)
            let success = false;
            for (let j = 0; j < 30; j++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                const successMsg = document.getElementById('createUserSuccess');
                const errorMsg = document.getElementById('createUserError');
                
                if (successMsg && !successMsg.classList.contains('hidden')) {
                    success = true;
                    console.log(`   ✅ ${account.email} créé avec succès !`);
                    break;
                }
                
                if (errorMsg && !errorMsg.classList.contains('hidden')) {
                    const errorText = errorMsg.textContent;
                    if (errorText.includes('existe déjà') || errorText.includes('already exists')) {
                        console.log(`   ⚠️  ${account.email} existe déjà`);
                        success = true; // Considérer comme succès si existe déjà
                        break;
                    } else {
                        throw new Error(errorText);
                    }
                }
            }

            if (!success) {
                throw new Error('Timeout: Le compte n\'a pas été créé dans les temps');
            }

            // Ajouter la date d'anniversaire dans Firestore et celebrations après création
            try {
                console.log('   📅 Ajout de la date d\'anniversaire...');
                
                // Trouver l'utilisateur créé par email
                const usersSnapshot = await firebase.firestore().collection('users')
                    .where('email', '==', account.email)
                    .limit(1)
                    .get();
                
                if (!usersSnapshot.empty) {
                    const userDoc = usersSnapshot.docs[0];
                    const userId = userDoc.id;
                    
                    // Mettre à jour le document utilisateur avec la date d'anniversaire
                    await firebase.firestore().collection('users').doc(userId).update({
                        birthday: account.birthday,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('   ✅ Date d\'anniversaire ajoutée au document utilisateur');
                    
                    // Créer ou mettre à jour l'entrée dans celebrations
                    const celebrationsRef = firebase.firestore().collection('celebrations');
                    const existingCelebration = await celebrationsRef
                        .where('email', '==', account.email)
                        .limit(1)
                        .get();
                    
                    const fileNumber = account.email.split('@')[0];
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
                        console.log('   ✅ Célébration créée');
                    } else {
                        await existingCelebration.docs[0].ref.update(celebrationData);
                        console.log('   ✅ Célébration mise à jour');
                    }
                }
            } catch (birthdayError) {
                console.warn(`   ⚠️  Erreur lors de l'ajout de la date d'anniversaire: ${birthdayError.message}`);
                // Ne pas faire échouer la création si l'ajout de l'anniversaire échoue
            }

            // Fermer le modal
            const closeBtn = document.querySelector('#createUserModal .close-modal, #createUserModal button[onclick*="closeModal"]');
            if (closeBtn) {
                closeBtn.click();
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            results.push({ success: true, email: account.email });
            
            // Pause entre les créations
            if (i < accounts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

        } catch (error) {
            console.error(`   ❌ Erreur pour ${account.email}:`, error.message);
            results.push({ success: false, email: account.email, error: error.message });
            
            // Essayer de fermer le modal en cas d'erreur
            try {
                const closeBtn = document.querySelector('#createUserModal .close-modal, #createUserModal button[onclick*="closeModal"]');
                if (closeBtn) {
                    closeBtn.click();
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } catch (e) {
                // Ignorer les erreurs de fermeture
            }
        }
    }

    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    console.log(`✅ Comptes créés: ${successCount}/${accounts.length}`);
    console.log(`❌ Échecs: ${failCount}`);
    results.forEach(r => {
        if (r.success) {
            console.log(`   ✅ ${r.email}`);
        } else {
            console.log(`   ❌ ${r.email}: ${r.error}`);
        }
    });

    if (successCount === accounts.length) {
        console.log('\n🎉 Tous les comptes ont été créés avec succès !');
    }
})();

