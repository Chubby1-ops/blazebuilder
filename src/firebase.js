import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, CustomProvider } from "firebase/app-check";
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  Schema,
} from "firebase/ai";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const configured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

const app = configured
  ? getApps()[0] || initializeApp(firebaseConfig)
  : null;

if (app && location.hostname === "localhost") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

  initializeAppCheck(app, {
    provider: new CustomProvider({
      getToken: async () => {
        throw new Error(
          "Production App Check provider has not been configured yet.",
        );
      },
    }),
    isTokenAutoRefreshEnabled: true,
  });
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();

const ai = app
  ? getAI(app, { backend: new GoogleAIBackend() })
  : null;

export const blazeAIModel = ai
  ? getGenerativeModel(ai, { model: "gemini-3.5-flash-lite" })
  : null;

const websiteSchema = Schema.object({
  properties: {
    title: Schema.string(),
    subtitle: Schema.string(),
    html: Schema.string(),
    css: Schema.string(),
    javascript: Schema.string(),
  },
});

export const blazeAIWebsiteModel = ai
  ? getGenerativeModel(ai, {
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: websiteSchema,
      },
    })
  : null;
