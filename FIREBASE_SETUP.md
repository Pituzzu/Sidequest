# Configurazione Firebase di Sidequest

Il progetto usa Firebase JavaScript SDK con Expo SDK 57. Questa configurazione abilita la base per:

- Firebase Authentication;
- Cloud Firestore;
- Cloud Storage.

Firebase Hosting è intenzionalmente escluso: hosting e deploy vengono gestiti separatamente dal proprietario del progetto.

## 1. Creare o scegliere il progetto Firebase

Aprire `https://console.firebase.google.com/`, creare o selezionare il progetto Sidequest e registrare una **Web App**. Con Firebase JavaScript SDK, la Web App fornisce l'oggetto di configurazione usato anche da Expo su Android e iOS.

Non attivare Firebase Hosting durante questa procedura.

## 2. Inserire la configurazione locale

Copiare `.env.example` in `.env` e sostituire i placeholder con i valori mostrati in:

`Firebase Console > Impostazioni progetto > Le tue app > Configurazione SDK`

```powershell
Copy-Item .env.example .env
```

Le variabili richieste sono:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

`EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` è facoltativa e servirà soltanto se verrà aggiunto Analytics.

Le variabili `EXPO_PUBLIC_*` vengono incluse nel bundle dell'app e non sono segreti. La sicurezza dei dati deve essere garantita dalle regole Firebase e, quando necessario, da App Check. Il file `.env` resta comunque escluso da Git per separare le configurazioni dei diversi ambienti.

## 3. Attivare i servizi nella console

Per Authentication:

1. Aprire `Authentication > Sign-in method`.
2. Abilitare `Email/Password` quando si deciderà di collegare il login reale.

Per Firestore:

1. Aprire `Firestore Database`.
2. Creare il database nella regione scelta per il progetto.
3. Definire regole che autorizzino soltanto utenti e ruoli previsti; non lasciare regole pubbliche in produzione.

Per Storage:

1. Aprire `Storage`.
2. Creare il bucket.
3. Limitare upload e lettura tramite regole collegate all'utente autenticato.

## 4. Riavviare Expo

Dopo ogni modifica a `.env`, riavviare Metro pulendo la cache:

```powershell
npx expo start --clear
```

## 5. Usare i servizi nel codice

```ts
import { getFirebaseServices } from './services/firebase';

const { app, auth, db, storage } = getFirebaseServices();
```

Su Android e iOS, Authentication usa AsyncStorage per mantenere la sessione. Sul web usa la persistenza standard del browser.

Se le variabili richieste non sono compilate, `getFirebaseServices()` genera un errore che elenca i valori mancanti.

## Stato dell'integrazione

La base Firebase è pronta, ma i flussi Sidequest esistenti continuano intenzionalmente a usare i dati demo in memoria. Non sono ancora stati migrati:

- login e profili;
- utenti e crediti;
- eventi e sondaggi;
- giochi e classifiche;
- impostazioni.

Questa separazione evita di cambiare il comportamento dell'app prima che siano definiti schema Firestore, ruoli, regole di sicurezza e strategia di migrazione.
