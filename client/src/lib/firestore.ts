import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import type {
  Patient,
  Prescription,
  Treatment,
  Notification,
  User,
  InsertPatient,
  InsertPrescription,
  InsertTreatment,
  InsertNotification,
} from "@shared/schema";

const COLLECTIONS = {
  USERS: "users",
  PATIENTS: "patients",
  PRESCRIPTIONS: "prescriptions",
  TREATMENTS: "treatments",
  NOTIFICATIONS: "notifications",
} as const;

const toISOString = () => new Date().toISOString();

const checkDb = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured. DB Please check your environment variables.",
    );
  }
  return db;
};

export const usersCollection = {
  async create(userId: string, userData: Omit<User, "id">): Promise<User> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    await setDoc(docRef, userData);
    return { id: userId, ...userData };
  },

  async get(userId: string): Promise<User | null> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  },

  async update(userId: string, data: Partial<User>): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, data);
  },
};

export const patientsCollection = {
  async getAll(): Promise<Patient[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.PATIENTS),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Patient);
  },

  async get(patientId: string): Promise<Patient | null> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.PATIENTS, patientId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Patient;
    }
    return null;
  },

  async create(data: InsertPatient): Promise<Patient> {
    const database = checkDb();
    // Remove updatedBy and updatedAt from create data as they're only for updates
    const { updatedBy, updatedAt, ...createData } = data as any;
    const docRef = await addDoc(collection(database, COLLECTIONS.PATIENTS), {
      ...createData,
      createdAt: toISOString(),
    });
    return { id: docRef.id, ...createData, createdAt: toISOString() };
  },

  async update(patientId: string, data: Partial<Patient>): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.PATIENTS, patientId);
    await updateDoc(docRef, { ...data, updatedAt: toISOString() });
  },

  async delete(patientId: string): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.PATIENTS, patientId);
    await deleteDoc(docRef);
  },

  async search(searchTerm: string): Promise<Patient[]> {
    const allPatients = await this.getAll();
    const term = searchTerm.toLowerCase();
    return allPatients.filter(
      (p) =>
        p.firstName.toLowerCase().includes(term) ||
        p.lastName.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term),
    );
  },
};

export const prescriptionsCollection = {
  async getAll(): Promise<Prescription[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.PRESCRIPTIONS),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Prescription,
    );
  },

getByPatient: async (patientId: string): Promise<Prescription[]> => {
  const database = checkDb();
  console.log('🔍 Fetching prescriptions for patient:', patientId);
  const q = query(
    collection(database, COLLECTIONS.PRESCRIPTIONS),
    where('patientId', '==', patientId)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  } as Prescription));
  console.log('📊 Found prescriptions:', results.length);
  return results;
},

  async get(prescriptionId: string): Promise<Prescription | null> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.PRESCRIPTIONS, prescriptionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Prescription;
    }
    return null;
  },

  async create(data: InsertPrescription): Promise<Prescription> {
    const database = checkDb();
    const { updatedBy, updatedAt, ...createData } = data as any;
    const docRef = await addDoc(
      collection(database, COLLECTIONS.PRESCRIPTIONS),
      {
        ...createData,
        createdAt: toISOString(),
      },
    );
    return { id: docRef.id, ...createData, createdAt: toISOString() };
  },

  async update(
    prescriptionId: string,
    data: Partial<Prescription>,
  ): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.PRESCRIPTIONS, prescriptionId);
    await updateDoc(docRef, { ...data, updatedAt: toISOString() });
  },

  async delete(prescriptionId: string): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.PRESCRIPTIONS, prescriptionId);
    await deleteDoc(docRef);
  },

  async dispense(prescriptionId: string, dispensedBy: string): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.PRESCRIPTIONS, prescriptionId);
    await updateDoc(docRef, {
      dispensed: true,
      dispensedAt: toISOString(),
      dispensedBy,
      status: "completed",
      updatedAt: toISOString(),
    });
  },
};

export const treatmentsCollection = {
  async getAll(): Promise<Treatment[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.TREATMENTS),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Treatment);
  },

  getByPatient: async (patientId: string): Promise<Treatment[]> => {
  const database = checkDb();
  console.log('🔍 Fetching treatments for patient:', patientId);
  const q = query(
    collection(database, COLLECTIONS.TREATMENTS),
    where('patientId', '==', patientId)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  } as Treatment));
  console.log('🏥 Found treatments:', results.length);
  return results;
},

  async get(treatmentId: string): Promise<Treatment | null> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.TREATMENTS, treatmentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Treatment;
    }
    return null;
  },

  async create(data: InsertTreatment): Promise<Treatment> {
    const database = checkDb();
    const { updatedBy, updatedAt, ...createData } = data as any;
    const docRef = await addDoc(collection(database, COLLECTIONS.TREATMENTS), {
      ...createData,
      createdAt: toISOString(),
    });
    return { id: docRef.id, ...createData, createdAt: toISOString() };
  },

  async update(treatmentId: string, data: Partial<Treatment>): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.TREATMENTS, treatmentId);
    await updateDoc(docRef, { ...data, updatedAt: toISOString() });
  },

  async delete(treatmentId: string): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.TREATMENTS, treatmentId);
    await deleteDoc(docRef);
  },
};

export const notificationsCollection = {
  async getByUser(userId: string): Promise<Notification[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Notification,
    );
  },

  async create(data: InsertNotification): Promise<Notification> {
    const database = checkDb();
    const { updatedBy, updatedAt, ...createData } = data as any;
    const docRef = await addDoc(
      collection(database, COLLECTIONS.NOTIFICATIONS),
      {
        ...createData,
        createdAt: toISOString(),
      },
    );
    return { id: docRef.id, ...createData, createdAt: toISOString() };
  },

  async markAsRead(notificationId: string): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(docRef, { read: true, readAt: toISOString() });
  },

  async delete(notificationId: string): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.NOTIFICATIONS, notificationId);
    await deleteDoc(docRef);
  },
};
