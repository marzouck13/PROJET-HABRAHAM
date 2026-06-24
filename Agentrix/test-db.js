// test-db.js (à la racine du projet)
const { sequelize, syncDatabase, User, Number, Sold, Transacs, History, OtpVerification } = require('./models');

const testDatabase = async () => {
  try {
    // Test connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Synchronisation des tables
    await syncDatabase(false); // false = ne pas effacer les données existantes

    // Vérification que tous les modèles sont chargés
    console.log('\n📋 Modèles chargés :');
    console.log('  - User');
    console.log('  - OtpVerification');
    console.log('  - Number');
    console.log('  - Sold');
    console.log('  - Transacs');
    console.log('  - History');

    // Test création utilisateur
    const user = await User.create({
      Name: 'Test User',
      Email: 'test@example.com',
      Password: 'hashedpassword123',
      isEmailVerified: false,
      isPhoneVerified: false
    });
    console.log('\n✅ Utilisateur test créé:', user.Id);

    // Test création OTP
    const otp = await OtpVerification.create({
      UserKey: user.Id,
      EmailOtp: '123456',
      EmailOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      PhoneOtp: '654321',
      PhoneOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    console.log('✅ OTP test créé:', otp.Id);

    // Test création numéro
    const number = await Number.create({
      UserKey: user.Id,
      PhoneNumber: '0123456789',
      Reseau: 'MTN'
    });
    console.log('✅ Numéro test créé:', number.PhoneNumber);

    // Test création solde
    const sold = await Sold.create({
      NumberKey: number.Id,
      CurrentBalance: 100000.00
    });
    console.log('✅ Solde test créé:', sold.CurrentBalance);

    // Test création transaction
    const transaction = await Transacs.create({
      UserKey: user.Id,
      NumberKey: number.Id,
      Type: 'DEPOT',
      Amount: 50000.00,
      BalanceBefore: 50000.00,
      BalanceAfter: 100000.00,
      Reseau: 'MTN'
    });
    console.log('✅ Transaction test créée:', transaction.Id);

    // Test création historique
    const history = await History.create({
      UserKey: user.Id,
      TransacsKey: transaction.Id,
      NumberKey: number.Id,
      DateKey: new Date().toISOString().split('T')[0],
      DayString: new Date().toISOString().split('T')[0],
      Year: new Date().getFullYear(),
      Month: new Date().getMonth() + 1,
      TotalDepots: 50000.00,
      TotalRetraits: 0.00,
      TotalCommissions: 0.00
    });
    console.log('✅ Historique test créé:', history.Id);

    console.log('\n🎉 Tous les tests sont passés avec succès !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
};

testDatabase();