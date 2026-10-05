# F2 Tournament Hub — Real Firebase Version

This is a mobile-friendly static website with Firebase Authentication + Firestore.

## 1. Create Firebase project
Open Firebase Console, create a project, then add a Web App.

Enable:
- Authentication → Sign-in method → Email/Password
- Firestore Database

## 2. Add your Firebase config
Rename `firebase-config.example.js` to `firebase-config.js`.
Copy the Web App configuration from Firebase into that file.

## 3. Add Firestore rules
In Firebase Console → Firestore Database → Rules, paste the contents of `firestore.rules` and publish.

## 4. Create your first admin
1. Open the website.
2. Create an account using the Login section.
3. In Firestore → Data, open `users`.
4. Open your user document (the document ID is your Firebase Auth UID).
5. Change `role` from `player` to `admin`.

Do not put Firebase service-account/private keys in this website.

## 5. Upload to GitHub Pages
Upload these files to the repository root:
- index.html
- style.css
- app.js
- firebase-config.js
- firestore.rules
- README.md

Then GitHub → Settings → Pages → Deploy from branch → main → / (root) → Save.

## 6. Firebase authorized domain
In Firebase Authentication settings, add your GitHub Pages domain if Firebase asks for it, for example:
USERNAME.github.io

## Admin controls
The admin dashboard can:
- add/edit/delete tournaments
- set date/time, entry fee, prize and status
- publish room ID/password
- publish results
- publish notices
- approve/reject/delete registrations
- view registration/payment-status fields

Actual payment gateway integration is not included. Payment status is an admin-managed field; use a proper payment provider/account and applicable rules if you later add payments.

## Important
Firestore rules are the real security layer. The admin buttons alone are not security.
Never upload a Firebase service-account JSON file to GitHub.
