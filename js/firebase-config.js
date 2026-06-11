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

const firebaseConfig = {
  apiKey: "AIzaSyAdDFlSf8szCLm-cFdPhOd56L90mqzBsi8",
  authDomain: "lifereset66.firebaseapp.com",
  projectId: "lifereset66",
  storageBucket: "lifereset66.firebasestorage.app",
  messagingSenderId: "903314251533",
  appId: "1:903314251533:web:824e5ebb907adf6f249a44",
  measurementId: "G-RWJTG8706C"
};

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
