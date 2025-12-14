// client/src/lib/firestore.ts
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
  Appointment,
  InsertPatient,
  InsertPrescription,
  InsertTreatment,
  InsertNotification,
  InsertAppointment,
} from "@shared/schema";

const COLLECTIONS = {
  USERS: "users",
  PATIENTS: "patients",
  PRESCRIPTIONS: "prescriptions",
  TREATMENTS: "treatments",
  NOTIFICATIONS: "notifications",
  APPOINTMENTS: "appointments",
} as const;

const toISOString = () => new Date().toISOString();

const checkDb = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured. Please check your environment variables.",
    );
  }
  return db;
};

// ==================== USERS COLLECTION ====================
export const usersCollection = {
  async create(userId: string, userData: Omit<User, "id">): Promise<User> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    const userWithTimestamp = {
      ...userData,
      createdAt: toISOString(),
      isActive: true,
    };
    await setDoc(docRef, userWithTimestamp);
    return { id: userId, ...userWithTimestamp };
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

  async getAll(): Promise<User[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.USERS),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as User);
  },

  async update(userId: string, data: Partial<User>): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, { ...data, updatedAt: toISOString() });
  },

  async delete(userId: string): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.USERS, userId);
    await deleteDoc(docRef);
  },
};

// ==================== PATIENTS COLLECTION ====================
export const patientsCollection = {
  async getAll(): Promise<Patient[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.PATIENTS),
      orderBy("createdAt", "desc")
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

  async getByUserId(userId: string): Promise<Patient | null> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.PATIENTS),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Patient;
  },

  async create(data: InsertPatient): Promise<Patient> {
    const database = checkDb();
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
        p.email?.toLowerCase().includes(term)
    );
  },
};

// ==================== PRESCRIPTIONS COLLECTION ====================
export const prescriptionsCollection = {
  async getAll(): Promise<Prescription[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.PRESCRIPTIONS),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Prescription
    );
  },

  async getByPatient(patientId: string): Promise<Prescription[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.PRESCRIPTIONS),
      where("patientId", "==", patientId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Prescription
    );
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
      }
    );
    return { id: docRef.id, ...createData, createdAt: toISOString() };
  },

  async update(
    prescriptionId: string,
    data: Partial<Prescription>
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

// ==================== TREATMENTS COLLECTION ====================
export const treatmentsCollection = {
  async getAll(): Promise<Treatment[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.TREATMENTS),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Treatment);
  },

  async getByPatient(patientId: string): Promise<Treatment[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.TREATMENTS),
      where("patientId", "==", patientId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Treatment
    );
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

// ==================== NOTIFICATIONS COLLECTION ====================
export const notificationsCollection = {
  async getByUser(userId: string): Promise<Notification[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Notification
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
      }
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

// ==================== APPOINTMENTS COLLECTION ====================
export const appointmentsCollection = {
  async getAll(): Promise<Appointment[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.APPOINTMENTS),
      orderBy("appointmentDate", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Appointment
    );
  },

  async getByPatient(patientId: string): Promise<Appointment[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.APPOINTMENTS),
      where("patientId", "==", patientId),
      orderBy("appointmentDate", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Appointment
    );
  },

  async getByDoctor(doctorId: string): Promise<Appointment[]> {
    const database = checkDb();
    const q = query(
      collection(database, COLLECTIONS.APPOINTMENTS),
      where("doctorId", "==", doctorId),
      orderBy("appointmentDate", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Appointment
    );
  },

  async get(appointmentId: string): Promise<Appointment | null> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.APPOINTMENTS, appointmentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Appointment;
    }
    return null;
  },

  async create(data: InsertAppointment): Promise<Appointment> {
    const database = checkDb();
    const docRef = await addDoc(
      collection(database, COLLECTIONS.APPOINTMENTS),
      {
        ...data,
        createdAt: toISOString(),
      }
    );
    return { id: docRef.id, ...data, createdAt: toISOString() };
  },

  async update(
    appointmentId: string,
    data: Partial<Appointment>
  ): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.APPOINTMENTS, appointmentId);
    await updateDoc(docRef, { ...data, updatedAt: toISOString() });
  },

  async delete(appointmentId: string): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, COLLECTIONS.APPOINTMENTS, appointmentId);
    await deleteDoc(docRef);
  },
};