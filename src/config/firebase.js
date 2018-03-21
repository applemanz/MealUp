import * as firebase from 'firebase';

// Initialize Firebase
const config = {
  apiKey: "AIzaSyC0KLW-drjokUAv1gjTKLfObmGmQmB5tx8",
  authDomain: "auth-f86eb.firebaseapp.com",
  databaseURL: "https://auth-f86eb.firebaseio.com",
  projectId: "auth-f86eb",
  storageBucket: "auth-f86eb.appspot.com",
  messagingSenderId: "874574211968"
};
firebase.initializeApp(config);

export default firebase;

// This code creates an instance of the Firebase SDK and configures it with your config. Now you can import it anywhere in your codebase and it’s always this singleton.
//     When you see firebase from now on, assume that it’s imported from here.
//
