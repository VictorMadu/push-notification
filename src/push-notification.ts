import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { Observable, Subscriber, last, startWith } from "rxjs";

const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "AUTH_DOMAIN",
  projectId: "PROJECT_ID",
  storageBucket: "STORAGE_BUCKET",
  messagingSenderId: "MESSAGING_SENDER_ID",
  appId: "APP_ID",
  measurementId: "MEASUREMENT_ID",
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export enum Permission {
  AWAITING_ACTION,
  GRANTED,
  DENIED,
}
export interface Notification {
  title: string;
  body: string;
}

let permissionSubscriber: Subscriber<Permission>;
let notificationSubscriber: Subscriber<Notification>;

export const observable = {
  permission: new Observable<Permission>((subscriber) => {
    permissionSubscriber = subscriber;
  })
    .pipe(startWith(Permission.AWAITING_ACTION))
    .pipe(last()),

  notification: new Observable<Notification>((subscriber) => {
    notificationSubscriber = subscriber;
  }).pipe(last()),
};

async function setUpToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = localStorage.getItem("__token") ?? (await fetchToken());
      localStorage.setItem("__token", token);

      console.log("Token", token);
      permissionSubscriber.next(Permission.GRANTED);
    } else if (permission === "denied") {
      console.log("Notification permission denied");
      permissionSubscriber.next(Permission.DENIED);
    } else {
      console.log("Notification permission dismissed");
      permissionSubscriber.next(Permission.AWAITING_ACTION);
    }
  } catch (error) {
    console.log("Error requesting notification permission", error);
    permissionSubscriber.next(Permission.DENIED);
  }
}

function onMessageListener() {
  onMessage(messaging, (payload) => {
    console.log("Received", payload);

    if (payload.notification?.title && payload.notification.body)
      notificationSubscriber.next({
        title: payload.notification.title,
        body: payload.notification.body,
      });
  });
}

async function fetchToken() {
  return getToken(messaging, {
    vapidKey:
      "BGDT6oSc7I3GJSq6wvJfSii25J0rHqt6CYC-Q8BMf97t1j7s4qAxWax0KAq28CuZmoW4oe4l0nE_I1PzvmwIJ5Y",
  });
}

export function run() {
  setUpToken();
  onMessageListener();
}
