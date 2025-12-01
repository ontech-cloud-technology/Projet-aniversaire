/**
 * Script à exécuter dans la console du navigateur sur super-admin.html
 * pour créer rapidement les comptes de démonstration
 * 
 * Instructions:
 * 1. Ouvrez super-admin.html dans votre navigateur
 * 2. Connectez-vous en tant qu'administrateur
 * 3. Ouvrez la console du navigateur (F12)
 * 4. Copiez-collez ce script et exécutez-le
 */

(async function createDemoAccounts() {
    console.log('🚀 Démarrage de la création des comptes de démonstration...\n');

    const accounts = [
        {
            email: 'demo1@onteech.com',
            password: '123456',
            fullName: 'Demo 1',
            role: 'eleve',
            accountType: 'standard',
            birthday: '2012-12-02' // 2 décembre 2012
        },
        {
            email: 'demo2@ontech.com',
            password: '123456',
            fullName: 'Demo 2',
            role: 'eleve',
            accountType: 'standard',
            birthday: '2012-12-03' // 3 décembre 2012
        }
    ];

    const results = [];

    for (const account of accounts) {
        try {
            console.log(`\n📝 Création de ${account.email}...`);

            // Ouvrir le modal de création
            document.getElementById('createUserBtn').click();
            await new Promise(resolve => setTimeout(resolve, 500));

            // Remplir le formulaire
            document.getElementById('createFullName').value = account.fullName;
            document.getElementById('createEmail').value = account.email;
            document.getElementById('createPassword').value = account.password;

            // Sélectionner le type d'utilisateur (normal)
            const normalUserRadio = document.querySelector('input[name="userType"][value="normal"]');
            if (normalUserRadio) {
                normalUserRadio.checked = true;
                normalUserRadio.dispatchEvent(new Event('change'));
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Sélectionner le type de compte (standard)
            const standardAccountRadio = document.querySelector('input[name="accountType"][value="standard"]');
            if (standardAccountRadio) {
                standardAccountRadio.checked = true;
                standardAccountRadio.dispatchEvent(new Event('change'));
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Sélectionner le rôle (eleve)
            const roleSelect = document.getElementById('createRole');
            if (roleSelect) {
                roleSelect.value = account.role;
            }

            // Si c'est un élève, remplir les champs supplémentaires
            if (account.role === 'eleve' && account.birthday) {
                // Sélectionner "Élève" comme type d'utilisateur
                const eleveRadio = document.querySelector('input[name="userType"][value="eleve"]');
                if (eleveRadio) {
                    eleveRadio.checked = true;
                    eleveRadio.dispatchEvent(new Event('change'));
                    await new Promise(resolve => setTimeout(resolve, 300));
                }

                // Remplir la date d'anniversaire
                const birthdayInput = document.getElementById('createBirthday');
                if (birthdayInput) {
                    birthdayInput.value = account.birthday;
                }
            }

            // Cocher "Envoyer email de bienvenue" (optionnel)
            const sendWelcomeEmail = document.getElementById('sendWelcomeEmail');
            if (sendWelcomeEmail) {
                sendWelcomeEmail.checked = false; // Ne pas envoyer d'email pour les comptes démo
            }

            // Soumettre le formulaire
            const form = document.getElementById('createUserForm');
            if (form) {
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(submitEvent);
                
                // Attendre que le compte soit créé
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                console.log(`   ✅ ${account.email} créé avec succès`);
                results.push({ success: true, email: account.email });
            } else {
                throw new Error('Formulaire non trouvé');
            }

        } catch (error) {
            console.error(`   ❌ Erreur pour ${account.email}:`, error);
            results.push({ success: false, email: account.email, error: error.message });
        }
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
            console.log(`   ✅ ${r.email}`);
        } else {
            console.log(`   ❌ ${r.email}: ${r.error}`);
        }
    });
})();

