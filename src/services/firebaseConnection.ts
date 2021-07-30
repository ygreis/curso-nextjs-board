import firebase from 'firebase/app';
import 'firebase/firestore';

var firebaseConfig = {
  apiKey: "AIzaSyByxEUs2FbxZcAFRf7t3U06TjFxvc5RjJQ",
  authDomain: "board-app-813fc.firebaseapp.com",
  projectId: "board-app-813fc",
  storageBucket: "board-app-813fc.appspot.com",
  messagingSenderId: "533519199772",
  appId: "1:533519199772:web:b16e89cb56b240b608b9d9",
  measurementId: "G-MTSR0DF016"
};
// Initialize Firebase
if(!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;