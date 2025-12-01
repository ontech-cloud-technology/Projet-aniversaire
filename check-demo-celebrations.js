/**
 * Script de diagnostic pour vérifier les célébrations des comptes démo
 * À exécuter dans la console du navigateur sur eleve.html ou super-admin.html
 */

(async function checkDemoCelebrations() {
    console.log('🔍 Vérification des célébrations des comptes démo...\n');

    try {
        // Vérifier demo1
        console.log('📋 Vérification de 2253343@cslaval.qc.ca...');
        const demo1Celebrations = await firebase.firestore().collection('celebrations')
            .where('email', '==', '2253343@cslaval.qc.ca')
            .get();
        
        if (demo1Celebrations.empty) {
            console.log('   ❌ Aucune célébration trouvée pour 2253343@cslaval.qc.ca');
        } else {
            demo1Celebrations.forEach(doc => {
                const data = doc.data();
                console.log('   ✅ Célébration trouvée:');
                console.log('      - ID:', doc.id);
                console.log('      - fullName:', data.fullName);
                console.log('      - email:', data.email);
                console.log('      - birthday:', data.birthday, '(type:', typeof data.birthday, ')');
                console.log('      - fileNumber:', data.fileNumber);
            });
        }

        // Vérifier demo2
        console.log('\n📋 Vérification de 2253344@cslaval.qc.ca...');
        const demo2Celebrations = await firebase.firestore().collection('celebrations')
            .where('email', '==', '2253344@cslaval.qc.ca')
            .get();
        
        if (demo2Celebrations.empty) {
            console.log('   ❌ Aucune célébration trouvée pour 2253344@cslaval.qc.ca');
        } else {
            demo2Celebrations.forEach(doc => {
                const data = doc.data();
                console.log('   ✅ Célébration trouvée:');
                console.log('      - ID:', doc.id);
                console.log('      - fullName:', data.fullName);
                console.log('      - email:', data.email);
                console.log('      - birthday:', data.birthday, '(type:', typeof data.birthday, ')');
                console.log('      - fileNumber:', data.fileNumber);
            });
        }

        // Vérifier toutes les célébrations
        console.log('\n📋 Toutes les célébrations:');
        const allCelebrations = await firebase.firestore().collection('celebrations')
            .orderBy('birthday', 'asc')
            .get();
        
        console.log(`   Total: ${allCelebrations.size} célébration(s)`);
        allCelebrations.forEach(doc => {
            const data = doc.data();
            console.log(`   - ${data.fullName || 'Sans nom'} (${data.email || 'Sans email'}) - ${data.birthday || 'Sans date'}`);
        });

        // Vérifier les utilisateurs
        console.log('\n📋 Vérification des utilisateurs...');
        const demo1Users = await firebase.firestore().collection('users')
            .where('email', '==', '2253343@cslaval.qc.ca')
            .get();
        
        const demo2Users = await firebase.firestore().collection('users')
            .where('email', '==', '2253344@cslaval.qc.ca')
            .get();

        if (!demo1Users.empty) {
            const demo1Data = demo1Users.docs[0].data();
            console.log('   ✅ 2253343@cslaval.qc.ca trouvé:');
            console.log('      - birthday dans users:', demo1Data.birthday);
        } else {
            console.log('   ❌ 2253343@cslaval.qc.ca non trouvé dans users');
        }

        if (!demo2Users.empty) {
            const demo2Data = demo2Users.docs[0].data();
            console.log('   ✅ 2253344@cslaval.qc.ca trouvé:');
            console.log('      - birthday dans users:', demo2Data.birthday);
        } else {
            console.log('   ❌ 2253344@cslaval.qc.ca non trouvé dans users');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
})();

