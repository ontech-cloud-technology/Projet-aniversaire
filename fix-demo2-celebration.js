/**
 * Script pour réparer/créer la célébration de demo2
 * À exécuter dans la console du navigateur sur eleve.html ou super-admin.html
 */

(async function fixDemo2Celebration() {
    console.log('🔧 Réparation de la célébration de 2253344@cslaval.qc.ca...\n');

    try {
        const email = '2253344@cslaval.qc.ca';
        const fullName = 'Demo 2';
        const birthday = '2012-12-03';
        const fileNumber = '2253344';

        // Vérifier si l'utilisateur existe
        const usersSnapshot = await firebase.firestore().collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            console.log('❌ Utilisateur 2253344@cslaval.qc.ca non trouvé dans users');
            console.log('   Créez d\'abord l\'utilisateur via super-admin.html');
            return;
        }

        const userId = usersSnapshot.docs[0].id;
        console.log('✅ Utilisateur trouvé (UID:', userId, ')');

        // Mettre à jour le document utilisateur avec la date d'anniversaire
        await firebase.firestore().collection('users').doc(userId).update({
            birthday: birthday,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Date d\'anniversaire ajoutée au document utilisateur');

        // Vérifier si la célébration existe déjà
        const celebrationsRef = firebase.firestore().collection('celebrations');
        const existingCelebration = await celebrationsRef
            .where('email', '==', email)
            .limit(1)
            .get();

        const celebrationData = {
            fullName: fullName,
            email: email,
            birthday: birthday,
            fileNumber: fileNumber,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (existingCelebration.empty) {
            await celebrationsRef.add({
                ...celebrationData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Célébration créée dans la collection celebrations');
        } else {
            await existingCelebration.docs[0].ref.update(celebrationData);
            console.log('✅ Célébration mise à jour dans la collection celebrations');
        }

        console.log('\n✅ Réparation terminée !');
        console.log('   - Email:', email);
        console.log('   - Nom:', fullName);
        console.log('   - Date d\'anniversaire:', birthday);
        console.log('   - Numéro de fiche:', fileNumber);
        console.log('\n💡 Rafraîchissez la page pour voir la célébration dans le calendrier.');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
})();

