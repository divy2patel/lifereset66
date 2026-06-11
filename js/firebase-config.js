import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js';
import {
  getAuth,
  onAuthStateChanged as authStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';

let firebaseConfig = null;

try {
  const localConfig = await import('./firebase-config.local.js');
  firebaseConfig = localConfig.firebaseConfig;
} catch (err) {
  console.warn('[Firebase Config] firebase-config.local.js not found. Please create js/firebase-config.local.js from js/firebase-config.example.js');
}

if (!firebaseConfig) {
  firebaseConfig = {
    apiKey: '<YOUR_API_KEY>',
    authDomain: '<YOUR_AUTH_DOMAIN>',
    projectId: '<YOUR_PROJECT_ID>',
    storageBucket: '<YOUR_STORAGE_BUCKET>',
    messagingSenderId: '<YOUR_MESSAGING_SENDER_ID>',
    appId: '<YOUR_APP_ID>',
    measurementId: '<YOUR_MEASUREMENT_ID>'
  };
}

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

const Firebase = {
  auth: {
    signInWithEmailAndPassword: (email, password) => signInWithEmailAndPassword(auth, email, password),
    createUserWithEmailAndPassword: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    updateProfile: (user, profile) => updateProfile(user, profile)
  },
  db,
  currentUser: null,

  onAuthStateChanged(callback) {
    authStateChanged(auth, user => {
      Firebase.currentUser = user;
      callback(user);
    });
  },

  getUserDocRef(uid) {
    return doc(db, 'users', uid);
  },

  async loadUserData(uid) {
    const userDoc = await getDoc(this.getUserDocRef(uid));
    return userDoc.exists() ? userDoc.data() : null;
  },

  async saveAppData(uid, appData) {
    if (!uid) return;
    const payload = {
      profile: appData.user || {},
      appData,
      updatedAt: new Date().toISOString()
    };
    return setDoc(this.getUserDocRef(uid), payload, { merge: true });
  },

  async saveUserProfile(uid, profile) {
    if (!uid) return;
    return setDoc(this.getUserDocRef(uid), { profile, updatedAt: new Date().toISOString() }, { merge: true });
  }
};

window.Firebase = Firebase;
