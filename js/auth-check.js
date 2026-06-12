/* ============================================================
   LifeReset66 — Authentication Check
   Redirects to login if user is not authenticated
   ============================================================ */

import { onAuthStateChanged as authStateChanged, getAuth } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';

const auth = getAuth();

authStateChanged(auth, user => {
  if (!user) {
    console.log('[Auth Check] User not authenticated, redirecting to login...');
    window.location.replace('login.html');
  } else {
    console.log('[Auth Check] User authenticated:', user.email);
  }
});
