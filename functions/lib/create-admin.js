"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const auth = admin.auth();
async function createOrUpdateAdmin() {
    var _a;
    const phoneNumber = process.env.ADMIN_PHONE_NUMBER || '0753198248';
    const email = process.env.ADMIN_EMAIL || `${phoneNumber}@salon.app`;
    const password = process.env.ADMIN_PASSWORD || 'adminruwan';
    const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const lastName = process.env.ADMIN_LAST_NAME || 'Ruwan';
    let userRecord;
    try {
        userRecord = await auth.getUserByEmail(email);
        await auth.updateUser(userRecord.uid, {
            password,
            displayName: `${firstName} ${lastName}`,
            disabled: false,
        });
        console.log(`ℹ️ Existing Auth user updated: ${email}`);
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) !== 'auth/user-not-found') {
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
    await userRef.set({
        phoneNumber,
        firstName,
        lastName,
        role: 'ADMIN',
        profileImageUrl: null,
        isActive: true,
        createdAt: existingDoc.exists ? ((_a = existingDoc.data()) === null || _a === void 0 ? void 0 : _a.createdAt) || now : now,
        updatedAt: now,
    }, { merge: true });
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
//# sourceMappingURL=create-admin.js.map