import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────

function generateTimeSlots(startTime: string, endTime: string, slotDurationMins: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;
  while (current < end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    current += slotDurationMins;
  }
  return slots;
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function tsToString(ts: admin.firestore.Timestamp | null | undefined): string | null {
  return ts ? ts.toDate().toISOString() : null;
}

async function assertAdmin(context: functions.https.CallableContext): Promise<string> {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'ADMIN') {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }
  return context.auth.uid;
}

function assertAuth(context: functions.https.CallableContext): string {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  return context.auth.uid;
}

// ──────────────────────────────────────────────
//  AUTH
// ──────────────────────────────────────────────

export const registerUser = functions.https.onCall(async (data, context) => {
  const { phoneNumber, password, firstName, lastName } = data;

  if (!phoneNumber || !password || !firstName || !lastName) {
    throw new functions.https.HttpsError('invalid-argument', 'All fields are required');
  }
  if (!/^\d{10}$/.test(phoneNumber)) {
    throw new functions.https.HttpsError('invalid-argument', 'Phone number must be exactly 10 digits');
  }
  if (password.length < 8) {
    throw new functions.https.HttpsError('invalid-argument', 'Password must be at least 8 characters');
  }

  const email = `${phoneNumber}@salon.app`;

  // Check if phone number already registered
  const existingUsers = await db.collection('users').where('phoneNumber', '==', phoneNumber).limit(1).get();
  if (!existingUsers.empty) {
    throw new functions.https.HttpsError('already-exists', 'A user with this phone number already exists');
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const now = admin.firestore.FieldValue.serverTimestamp();
    await db.collection('users').doc(userRecord.uid).set({
      phoneNumber,
      firstName,
      lastName,
      role: 'CLIENT',
      profileImageUrl: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { uid: userRecord.uid };
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'A user with this phone number already exists');
    }
    throw new functions.https.HttpsError('internal', error.message || 'Registration failed');
  }
});

// ──────────────────────────────────────────────
//  USER MANAGEMENT
// ──────────────────────────────────────────────

export const updateProfile = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const { firstName, lastName, password, profileImageUrl } = data;

  const updates: Record<string, any> = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (profileImageUrl !== undefined) updates.profileImageUrl = profileImageUrl;

  await db.collection('users').doc(uid).update(updates);

  if (password) {
    if (password.length < 8) throw new functions.https.HttpsError('invalid-argument', 'Password must be at least 8 characters');
    await auth.updateUser(uid, { password });
  }

  const doc = await db.collection('users').doc(uid).get();
  return { id: uid, ...doc.data(), createdAt: tsToString(doc.data()?.createdAt), updatedAt: tsToString(doc.data()?.updatedAt) };
});

export const adminManageUser = functions.https.onCall(async (data, context) => {
  const adminUid = await assertAdmin(context);
  const { action } = data;

  switch (action) {
    case 'create': {
      const { phoneNumber, password, firstName, lastName, role } = data;
      if (!phoneNumber || !password || !firstName || !lastName) {
        throw new functions.https.HttpsError('invalid-argument', 'All fields are required');
      }

      const email = `${phoneNumber}@salon.app`;
      const existing = await db.collection('users').where('phoneNumber', '==', phoneNumber).limit(1).get();
      if (!existing.empty) throw new functions.https.HttpsError('already-exists', 'Phone number already registered');

      const userRecord = await auth.createUser({ email, password, displayName: `${firstName} ${lastName}` });
      const now = admin.firestore.FieldValue.serverTimestamp();
      await db.collection('users').doc(userRecord.uid).set({
        phoneNumber, firstName, lastName,
        role: role || 'CLIENT',
        profileImageUrl: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      const doc = await db.collection('users').doc(userRecord.uid).get();
      return { id: userRecord.uid, ...doc.data(), createdAt: tsToString(doc.data()?.createdAt), updatedAt: tsToString(doc.data()?.updatedAt) };
    }

    case 'delete': {
      const { userId } = data;
      if (userId === adminUid) throw new functions.https.HttpsError('failed-precondition', 'Cannot delete your own account');

      const targetDoc = await db.collection('users').doc(userId).get();
      if (!targetDoc.exists) throw new functions.https.HttpsError('not-found', 'User not found');

      // Check if super admin (first admin by creation)
      const admins = await db.collection('users').where('role', '==', 'ADMIN').orderBy('createdAt', 'asc').limit(1).get();
      if (!admins.empty && admins.docs[0].id === userId) {
        throw new functions.https.HttpsError('failed-precondition', 'Cannot delete the super admin');
      }

      await auth.deleteUser(userId);
      await db.collection('users').doc(userId).delete();
      return { success: true };
    }

    case 'deactivate': {
      const { userId } = data;
      if (userId === adminUid) throw new functions.https.HttpsError('failed-precondition', 'Cannot deactivate your own account');

      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User not found');

      await db.collection('users').doc(userId).update({ isActive: false, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      await auth.updateUser(userId, { disabled: true });

      const updated = await db.collection('users').doc(userId).get();
      return { id: userId, ...updated.data(), createdAt: tsToString(updated.data()?.createdAt), updatedAt: tsToString(updated.data()?.updatedAt) };
    }

    case 'activate': {
      const { userId } = data;
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User not found');

      await db.collection('users').doc(userId).update({ isActive: true, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      await auth.updateUser(userId, { disabled: false });

      const updated = await db.collection('users').doc(userId).get();
      return { id: userId, ...updated.data(), createdAt: tsToString(updated.data()?.createdAt), updatedAt: tsToString(updated.data()?.updatedAt) };
    }

    default:
      throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${action}`);
  }
});

// ──────────────────────────────────────────────
//  APPOINTMENTS
// ──────────────────────────────────────────────

export const bookAppointment = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const { date, timeSlot } = data;

  if (!date || !timeSlot) throw new functions.https.HttpsError('invalid-argument', 'Date and time slot are required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new functions.https.HttpsError('invalid-argument', 'Date must be YYYY-MM-DD');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(timeSlot)) throw new functions.https.HttpsError('invalid-argument', 'Time slot must be HH:MM (24h)');

  const today = getTodayString();
  if (date < today) throw new functions.https.HttpsError('failed-precondition', 'Cannot book appointments in the past');

  // Check user is active
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists || !userDoc.data()?.isActive) {
    throw new functions.https.HttpsError('failed-precondition', 'Account is not active');
  }

  const scheduleRef = db.collection('schedules').doc(date);
  const sessionRef = db.collection('sessions').doc(date);
  const slotLockRef = db.collection('slotLocks').doc(`${date}_${timeSlot}`);
  const userDayLockRef = db.collection('userDayLocks').doc(`${uid}_${date}`);
  const counterRef = db.collection('queueCounters').doc(date);

  const result = await db.runTransaction(async (transaction) => {
    const scheduleDoc = await transaction.get(scheduleRef);
    const sessionDoc = await transaction.get(sessionRef);
    const slotLockDoc = await transaction.get(slotLockRef);
    const userDayLockDoc = await transaction.get(userDayLockRef);
    const counterDoc = await transaction.get(counterRef);

    // 1. Schedule must exist and be OPEN
    if (!scheduleDoc.exists) throw new functions.https.HttpsError('not-found', 'No schedule found for this date');
    const schedule = scheduleDoc.data()!;
    if (schedule.status !== 'OPEN') throw new functions.https.HttpsError('failed-precondition', 'This date is not available for booking');

    // 2. Session must not be closed
    if (sessionDoc.exists && sessionDoc.data()?.isClosed) {
      throw new functions.https.HttpsError('failed-precondition', 'Session is closed for this date');
    }

    // 3. Validate time slot
    const validSlots = generateTimeSlots(schedule.startTime, schedule.endTime, schedule.slotDurationMins);
    if (!validSlots.includes(timeSlot)) throw new functions.https.HttpsError('invalid-argument', 'Invalid time slot for this date');

    // 4. Slot must not be taken
    if (slotLockDoc.exists) throw new functions.https.HttpsError('already-exists', 'This time slot is already booked');

    // 5. User must not have another active booking on this date
    if (userDayLockDoc.exists) throw new functions.https.HttpsError('already-exists', 'You already have an active booking on this date');

    // 6. Queue position
    const lastPosition = counterDoc.exists ? counterDoc.data()!.lastPosition : 0;
    const queuePosition = lastPosition + 1;

    // 7. Create the appointment
    const appointmentRef = db.collection('appointments').doc();
    const appointmentData = {
      userId: uid,
      date,
      timeSlot,
      queuePosition,
      status: 'BOOKED',
      serviceId: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    transaction.set(appointmentRef, appointmentData);
    transaction.set(slotLockRef, { appointmentId: appointmentRef.id, userId: uid });
    transaction.set(userDayLockRef, { appointmentId: appointmentRef.id });
    transaction.set(counterRef, { lastPosition: queuePosition }, { merge: true });

    return {
      id: appointmentRef.id,
      ...appointmentData,
      user: { id: uid, firstName: userDoc.data()!.firstName, lastName: userDoc.data()!.lastName, phoneNumber: userDoc.data()!.phoneNumber },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  return result;
});

export const cancelAppointment = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const { appointmentId } = data;
  if (!appointmentId) throw new functions.https.HttpsError('invalid-argument', 'Appointment ID is required');

  const appointmentRef = db.collection('appointments').doc(appointmentId);
  const appointmentDoc = await appointmentRef.get();
  if (!appointmentDoc.exists) throw new functions.https.HttpsError('not-found', 'Appointment not found');

  const appointment = appointmentDoc.data()!;

  // Check if admin or owner
  const userDoc = await db.collection('users').doc(uid).get();
  const isAdmin = userDoc.data()?.role === 'ADMIN';
  if (!isAdmin && appointment.userId !== uid) {
    throw new functions.https.HttpsError('permission-denied', 'You can only cancel your own appointment');
  }

  if (appointment.status === 'COMPLETED') throw new functions.https.HttpsError('failed-precondition', 'Cannot cancel a completed appointment');
  if (appointment.status === 'CANCELLED') throw new functions.https.HttpsError('failed-precondition', 'Appointment is already cancelled');
  if (appointment.status === 'NO_SHOW') throw new functions.https.HttpsError('failed-precondition', 'Cannot cancel a no-show appointment');

  const today = getTodayString();
  if (appointment.date < today) throw new functions.https.HttpsError('failed-precondition', 'Cannot cancel a past appointment');

  const batch = db.batch();
  batch.update(appointmentRef, { status: 'CANCELLED', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  // Remove locks
  batch.delete(db.collection('slotLocks').doc(`${appointment.date}_${appointment.timeSlot}`));
  batch.delete(db.collection('userDayLocks').doc(`${appointment.userId}_${appointment.date}`));
  await batch.commit();

  return {
    id: appointmentId,
    userId: appointment.userId,
    date: appointment.date,
    timeSlot: appointment.timeSlot,
    queuePosition: appointment.queuePosition,
    serviceId: appointment.serviceId ?? null,
    status: 'CANCELLED',
    createdAt: tsToString(appointment.createdAt),
    updatedAt: new Date().toISOString(),
  };
});

export const adminUpdateAppointment = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  const { appointmentId, action: apptAction } = data;
  if (!appointmentId) throw new functions.https.HttpsError('invalid-argument', 'Appointment ID is required');

  const appointmentRef = db.collection('appointments').doc(appointmentId);
  const appointmentDoc = await appointmentRef.get();
  if (!appointmentDoc.exists) throw new functions.https.HttpsError('not-found', 'Appointment not found');

  const appointment = appointmentDoc.data()!;

  switch (apptAction) {
    case 'complete': {
      if (appointment.status === 'COMPLETED') throw new functions.https.HttpsError('failed-precondition', 'Already completed');
      if (appointment.status === 'CANCELLED') throw new functions.https.HttpsError('failed-precondition', 'Cannot complete a cancelled appointment');

      const batch = db.batch();
      batch.update(appointmentRef, { status: 'COMPLETED', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      batch.delete(db.collection('slotLocks').doc(`${appointment.date}_${appointment.timeSlot}`));
      batch.delete(db.collection('userDayLocks').doc(`${appointment.userId}_${appointment.date}`));
      await batch.commit();
      break;
    }

    case 'in-service': {
      if (appointment.status !== 'BOOKED') throw new functions.https.HttpsError('failed-precondition', 'Only booked appointments can be marked in service');
      await appointmentRef.update({ status: 'IN_SERVICE', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      break;
    }

    case 'no-show': {
      if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
        throw new functions.https.HttpsError('failed-precondition', 'Cannot mark completed/cancelled as no-show');
      }
      const batch = db.batch();
      batch.update(appointmentRef, { status: 'NO_SHOW', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      batch.delete(db.collection('slotLocks').doc(`${appointment.date}_${appointment.timeSlot}`));
      batch.delete(db.collection('userDayLocks').doc(`${appointment.userId}_${appointment.date}`));
      await batch.commit();
      break;
    }

    case 'update': {
      if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
        throw new functions.https.HttpsError('failed-precondition', 'Cannot update completed/cancelled appointments');
      }
      const updates: Record<string, any> = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
      if (data.status) updates.status = data.status;
      if (data.timeSlot) updates.timeSlot = data.timeSlot;
      if (data.date) updates.date = data.date;
      await appointmentRef.update(updates);
      break;
    }

    case 'delete': {
      const batch = db.batch();
      batch.delete(appointmentRef);
      batch.delete(db.collection('slotLocks').doc(`${appointment.date}_${appointment.timeSlot}`));
      batch.delete(db.collection('userDayLocks').doc(`${appointment.userId}_${appointment.date}`));
      await batch.commit();
      return { success: true };
    }

    default:
      throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${apptAction}`);
  }

  const updated = await appointmentRef.get();
  const d = updated.data()!;
  return {
    id: appointmentId,
    userId: d.userId,
    date: d.date,
    timeSlot: d.timeSlot,
    queuePosition: d.queuePosition,
    serviceId: d.serviceId ?? null,
    status: d.status,
    createdAt: tsToString(d.createdAt),
    updatedAt: tsToString(d.updatedAt),
  };
});

// ──────────────────────────────────────────────
//  QUEUE
// ──────────────────────────────────────────────

export const reorderQueue = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  const { date, orderedIds } = data;
  if (!date || !orderedIds || !Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Date and orderedIds are required');
  }

  const batch = db.batch();
  for (let i = 0; i < orderedIds.length; i++) {
    const ref = db.collection('appointments').doc(orderedIds[i]);
    batch.update(ref, { queuePosition: i + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  }
  await batch.commit();

  return { message: 'Queue reordered successfully', date };
});

// ──────────────────────────────────────────────
//  SESSION
// ──────────────────────────────────────────────

export const manageSession = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  const { action: sessionAction, date: dateParam } = data;

  switch (sessionAction) {
    case 'open': {
      if (!dateParam) throw new functions.https.HttpsError('invalid-argument', 'Date is required');
      const scheduleDoc = await db.collection('schedules').doc(dateParam).get();
      if (!scheduleDoc.exists || scheduleDoc.data()?.status !== 'OPEN') {
        throw new functions.https.HttpsError('failed-precondition', 'Cannot open session: date is not scheduled as open');
      }
      await db.collection('sessions').doc(dateParam).set({
        isClosed: false,
        openedAt: admin.firestore.FieldValue.serverTimestamp(),
        closedAt: null,
      }, { merge: true });

      const session = await db.collection('sessions').doc(dateParam).get();
      return {
        id: session.id,
        date: dateParam,
        isClosed: false,
        exists: true,
        openedAt: tsToString(session.data()?.openedAt),
        closedAt: null,
      };
    }

    case 'close': {
      const date = dateParam || getTodayString();

      // Check for active appointments
      const active = await db.collection('appointments')
        .where('date', '==', date)
        .where('status', 'in', ['BOOKED', 'IN_SERVICE'])
        .get();

      if (!active.empty) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Cannot close session: ${active.size} active appointment(s) remaining`
        );
      }

      await db.collection('sessions').doc(date).set({
        isClosed: true,
        closedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      const session = await db.collection('sessions').doc(date).get();
      return {
        id: session.id,
        date,
        isClosed: true,
        exists: true,
        openedAt: tsToString(session.data()?.openedAt),
        closedAt: tsToString(session.data()?.closedAt),
      };
    }

    default:
      throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${sessionAction}`);
  }
});

// ──────────────────────────────────────────────
//  SCHEDULE
// ──────────────────────────────────────────────

export const upsertSchedule = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  const { date, status, startTime, endTime, slotDurationMins, forceSlotChange } = data;

  if (!date || !status || !startTime || !endTime || !slotDurationMins) {
    throw new functions.https.HttpsError('invalid-argument', 'All schedule fields are required');
  }

  const scheduleRef = db.collection('schedules').doc(date);
  const existing = await scheduleRef.get();

  if (existing.exists) {
    // Check for active bookings
    const activeBookings = await db.collection('appointments')
      .where('date', '==', date)
      .where('status', 'in', ['BOOKED', 'IN_SERVICE'])
      .get();

    if (!activeBookings.empty) {
      if (existing.data()?.slotDurationMins !== slotDurationMins && !forceSlotChange) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Cannot change slot duration: ${activeBookings.size} active booking(s) exist. Set forceSlotChange=true to confirm.`
        );
      }
      if (status !== 'OPEN' && existing.data()?.status === 'OPEN') {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Cannot close this date: ${activeBookings.size} active booking(s) exist. Cancel them first.`
        );
      }
    }
  }

  const scheduleData = {
    status,
    startTime,
    endTime,
    slotDurationMins,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    ...(!existing.exists ? { createdAt: admin.firestore.FieldValue.serverTimestamp() } : {}),
  };

  await scheduleRef.set(scheduleData, { merge: true });

  return { id: date, date, status, startTime, endTime, slotDurationMins };
});

// ──────────────────────────────────────────────
//  SERVICES (Salon services CRUD)
// ──────────────────────────────────────────────

export const adminManageService = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  const { action: svcAction } = data;

  switch (svcAction) {
    case 'create': {
      const { name, description, duration, price, category, isActive, sortOrder } = data;
      if (!name || !duration || price === undefined) {
        throw new functions.https.HttpsError('invalid-argument', 'Name, duration, and price are required');
      }

      const now = admin.firestore.FieldValue.serverTimestamp();
      const ref = db.collection('services').doc();
      await ref.set({
        name,
        description: description || null,
        duration,
        price,
        category: category || 'HAIRCUT',
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
        createdAt: now,
        updatedAt: now,
      });

      const doc = await ref.get();
      return { id: ref.id, ...doc.data(), createdAt: tsToString(doc.data()?.createdAt), updatedAt: tsToString(doc.data()?.updatedAt) };
    }

    case 'update': {
      const { serviceId, ...updates } = data;
      delete updates.action;
      if (!serviceId) throw new functions.https.HttpsError('invalid-argument', 'Service ID is required');

      const ref = db.collection('services').doc(serviceId);
      const existing = await ref.get();
      if (!existing.exists) throw new functions.https.HttpsError('not-found', 'Service not found');

      const clean: Record<string, any> = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
      for (const key of ['name', 'description', 'duration', 'price', 'category', 'isActive', 'sortOrder']) {
        if (updates[key] !== undefined) clean[key] = updates[key];
      }

      await ref.update(clean);
      const doc = await ref.get();
      return { id: serviceId, ...doc.data(), createdAt: tsToString(doc.data()?.createdAt), updatedAt: tsToString(doc.data()?.updatedAt) };
    }

    case 'delete': {
      const { serviceId } = data;
      if (!serviceId) throw new functions.https.HttpsError('invalid-argument', 'Service ID is required');
      const ref = db.collection('services').doc(serviceId);
      if (!(await ref.get()).exists) throw new functions.https.HttpsError('not-found', 'Service not found');
      await ref.delete();
      return { success: true };
    }

    default:
      throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${svcAction}`);
  }
});

// ──────────────────────────────────────────────
//  REVIEWS
// ──────────────────────────────────────────────

export const createReview = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const { appointmentId, rating, comment } = data;

  if (!appointmentId || !rating) throw new functions.https.HttpsError('invalid-argument', 'Appointment ID and rating are required');
  if (rating < 1 || rating > 5) throw new functions.https.HttpsError('invalid-argument', 'Rating must be 1–5');

  const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
  if (!appointmentDoc.exists) throw new functions.https.HttpsError('not-found', 'Appointment not found');

  const appointment = appointmentDoc.data()!;
  if (appointment.userId !== uid) throw new functions.https.HttpsError('permission-denied', 'You can only review your own appointments');
  if (appointment.status !== 'COMPLETED') throw new functions.https.HttpsError('failed-precondition', 'Can only review completed appointments');

  // Check if a review already exists for this appointment
  const existingReview = await db.collection('reviews').where('appointmentId', '==', appointmentId).limit(1).get();
  if (!existingReview.empty) throw new functions.https.HttpsError('already-exists', 'A review already exists for this appointment');

  const now = admin.firestore.FieldValue.serverTimestamp();
  const ref = db.collection('reviews').doc();
  await ref.set({
    userId: uid,
    appointmentId,
    rating,
    comment: comment || null,
    isVisible: true,
    createdAt: now,
    updatedAt: now,
  });

  const userDoc = await db.collection('users').doc(uid).get();
  const doc = await ref.get();
  return {
    id: ref.id,
    ...doc.data(),
    createdAt: tsToString(doc.data()?.createdAt),
    updatedAt: tsToString(doc.data()?.updatedAt),
    user: {
      id: uid,
      firstName: userDoc.data()?.firstName,
      lastName: userDoc.data()?.lastName,
      profileImageUrl: userDoc.data()?.profileImageUrl,
    },
    appointment: {
      id: appointmentId,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
    },
  };
});

export const adminManageReview = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  const { action: reviewAction, reviewId } = data;
  if (!reviewId) throw new functions.https.HttpsError('invalid-argument', 'Review ID is required');

  const ref = db.collection('reviews').doc(reviewId);
  const doc = await ref.get();
  if (!doc.exists) throw new functions.https.HttpsError('not-found', 'Review not found');

  switch (reviewAction) {
    case 'delete':
      await ref.delete();
      return { success: true };

    case 'toggleVisibility': {
      const current = doc.data()!.isVisible;
      await ref.update({ isVisible: !current, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      const updated = await ref.get();

      const userDoc = await db.collection('users').doc(updated.data()!.userId).get();
      return {
        id: reviewId,
        ...updated.data(),
        createdAt: tsToString(updated.data()?.createdAt),
        updatedAt: tsToString(updated.data()?.updatedAt),
        user: userDoc.exists ? {
          id: updated.data()!.userId,
          firstName: userDoc.data()?.firstName,
          lastName: userDoc.data()?.lastName,
          profileImageUrl: userDoc.data()?.profileImageUrl,
        } : null,
      };
    }

    default:
      throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${reviewAction}`);
  }
});

// ──────────────────────────────────────────────
//  GALLERY
// ──────────────────────────────────────────────

export const adminManageGallery = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  const { action: galleryAction } = data;

  switch (galleryAction) {
    case 'create': {
      const { title, description, imageUrl, category, sortOrder, isActive } = data;
      if (!title || !imageUrl) throw new functions.https.HttpsError('invalid-argument', 'Title and imageUrl are required');

      const now = admin.firestore.FieldValue.serverTimestamp();
      const ref = db.collection('gallery').doc();
      await ref.set({
        title,
        description: description || null,
        imageUrl,
        category: category || 'Haircut',
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: now,
        updatedAt: now,
      });

      const doc = await ref.get();
      return { id: ref.id, ...doc.data(), createdAt: tsToString(doc.data()?.createdAt), updatedAt: tsToString(doc.data()?.updatedAt) };
    }

    case 'update': {
      const { galleryId, ...updates } = data;
      delete updates.action;
      if (!galleryId) throw new functions.https.HttpsError('invalid-argument', 'Gallery item ID is required');

      const ref = db.collection('gallery').doc(galleryId);
      if (!(await ref.get()).exists) throw new functions.https.HttpsError('not-found', 'Gallery item not found');

      const clean: Record<string, any> = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
      for (const key of ['title', 'description', 'imageUrl', 'category', 'sortOrder', 'isActive']) {
        if (updates[key] !== undefined) clean[key] = updates[key];
      }

      await ref.update(clean);
      const doc = await ref.get();
      return { id: galleryId, ...doc.data(), createdAt: tsToString(doc.data()?.createdAt), updatedAt: tsToString(doc.data()?.updatedAt) };
    }

    case 'delete': {
      const { galleryId } = data;
      if (!galleryId) throw new functions.https.HttpsError('invalid-argument', 'Gallery item ID is required');
      const ref = db.collection('gallery').doc(galleryId);
      if (!(await ref.get()).exists) throw new functions.https.HttpsError('not-found', 'Gallery item not found');
      await ref.delete();
      return { success: true };
    }

    default:
      throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${galleryAction}`);
  }
});

// ──────────────────────────────────────────────
//  BUSINESS INFO
// ──────────────────────────────────────────────

export const adminManageBusinessInfo = functions.https.onCall(async (data, context) => {
  await assertAdmin(context);
  const { action: biAction } = data;

  switch (biAction) {
    case 'upsert': {
      const { key, value, category } = data;
      if (!key || !value) throw new functions.https.HttpsError('invalid-argument', 'Key and value are required');

      await db.collection('businessInfo').doc(key).set({
        value,
        category: category || 'about',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      const doc = await db.collection('businessInfo').doc(key).get();
      return { id: doc.id, key, ...doc.data(), createdAt: tsToString(doc.data()?.createdAt), updatedAt: tsToString(doc.data()?.updatedAt) };
    }

    case 'bulkUpsert': {
      const { items } = data;
      if (!items || !Array.isArray(items)) throw new functions.https.HttpsError('invalid-argument', 'Items array is required');

      const batch = db.batch();
      for (const item of items) {
        const ref = db.collection('businessInfo').doc(item.key);
        batch.set(ref, {
          value: item.value,
          category: item.category || 'about',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }
      await batch.commit();

      const results = [];
      for (const item of items) {
        const doc = await db.collection('businessInfo').doc(item.key).get();
        results.push({ id: doc.id, key: item.key, ...doc.data(), createdAt: tsToString(doc.data()?.createdAt), updatedAt: tsToString(doc.data()?.updatedAt) });
      }
      return results;
    }

    case 'remove': {
      const { key } = data;
      if (!key) throw new functions.https.HttpsError('invalid-argument', 'Key is required');
      await db.collection('businessInfo').doc(key).delete();
      return { success: true };
    }

    default:
      throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${biAction}`);
  }
});
