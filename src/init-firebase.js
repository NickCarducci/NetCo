import { initializeApp } from "firebase/app";
import "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPI3t8wz6RReyu-jUQGuKyoIYdTNDysws",
  authDomain: "scopebook-ewb6x.firebaseapp.com",
  databaseURL: "https://scopebook-ewb6x.firebaseio.com",
  projectId: "scopebook-ewb6x",
  storageBucket: "scopebook-ewb6x.appspot.com",
  messagingSenderId: "978202987446",
  appId: "1:978202987446:web:7909436e50fdd4fa9b4f17"
};
//if (!firebase.apps.length) {
const firebase = initializeApp(firebaseConfig);
firebase && firebase.auth && firebase.auth().useDeviceLanguage();
//firebase.firestore().enablePersistence(false);
//}
//firebase.firestore().enablePersistence({ synchronizeTabs: true });
//firebase.auth();
//firebase.storage();
/*.settings({
  cacheSizeBytes: 1048576
});*/
//firebase.firestore().settings({ persistence: false });

export default firebase;
