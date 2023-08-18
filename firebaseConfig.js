import { initializeApp } from 'firebase/app';
import 'firebase/auth';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAX1EdRMfCBlcBU4xvVXZY8o1TLKdirn7E',
  authDomain: 'reelay-acd1b.firebaseapp.com',
  databaseURL: 'https://reelay-acd1b.firebaseio.com',
  projectId: 'reelay-acd1b',
  storageBucket: 'reelay-acd1b.appspot.com',
  messagingSenderId: '763379224842',
  appId: '1:763379224842:ios:f67ae9f73c01d902ee2af3',
};

const app = initializeApp(firebaseConfig);
export default app;
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
