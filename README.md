# FFTournament Hub

## Android + GitHub/Firebase setup

1. Upload all files in this folder to your GitHub repository.
2. Open Firebase Console and create/select your project.
3. Add a Web App and copy its Firebase config.
4. Put the values into `firebase-config.js`.
5. In Firebase, enable Firestore Database.
6. Create collections named `tournaments` and `registrations` automatically by using the website.
7. For hosting, use Firebase Hosting or another static hosting service.

## Pages
- `index.html` — player registration
- `admin.html` — tournament/admin view
- `firebase-config.js` — Firebase configuration

IMPORTANT: The sample admin page is not secure authentication. Before using it publicly, add Firebase Authentication and proper admin-only Firestore security rules.


## Firebase connection
1. Open `firebase-config.js` and paste the Firebase Web App config from Firebase Console.
2. Upload all files to the same GitHub Pages folder.
3. Firestore collection: `tournaments`; registration collection: `registrations`.
4. The player page reads tournament fields including `name`, `mode`, `date`, `time`, `slots`, `prize1`, `prize2`, `prize3`, and `prize4to6`.
5. This version does not collect entry-fee payments.
6. Before public use, add Firebase Authentication and restrictive Firestore security rules for admin access.
