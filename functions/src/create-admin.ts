import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

async function createOrUpdateAdmin() {
  const phoneNumber = process.env.ADMIN_PHONE_NUMBER || '0753198248';
  const email = process.env.ADMIN_EMAIL || `${phoneNumber}@salon.app`;
  const password = process.env.ADMIN_PASSWORD || 'adminruwan';
  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'Ruwan';

  let userRecord: admin.auth.UserRecord;

  try {
    userRecord = await auth.getUserByEmail(email);
    await auth.updateUser(userRecord.uid, {
      password,
      displayName: `${firstName} ${lastName}`,
      disabled: false,
    });
    console.log(`ℹ️ Existing Auth user updated: ${email}`);
  } catch (error: any) {
    if (error?.code !== 'auth/user-not-found') {
      throw error;
    }

    userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });
    console.log(`✅ New Auth user created: ${email}`);
  }

  const userRef = db.collection('users').doc(userRecord.uid);
  const existingDoc = await userRef.get();
  const now = admin.firestore.Timestamp.now();

  await userRef.set(
    {
      phoneNumber,
      firstName,
      lastName,
      role: 'ADMIN',
      profileImageUrl: null,
      isActive: true,
      createdAt: existingDoc.exists ? existingDoc.data()?.createdAt || now : now,
      updatedAt: now,
    },
    { merge: true },
  );

  console.log('🎉 Admin profile upserted in Firestore');
  console.log(`Phone: ${phoneNumber}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`UID: ${userRecord.uid}`);
}

createOrUpdateAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed to create/update admin:', error);
    process.exit(1);
  });
