# Sidequest — contesto operativo del progetto

Ultimo aggiornamento: 24 agosto 2026
Repository: `https://github.com/Pituzzu/Sidequest.git`  
Branch principale: `master`  
Commit di riferimento prima di questo documento: `47c5e51b455616587ca211d5781433ae54fc5102`

Questo file è l'handoff per una nuova sessione di Codex. Descrive lo stato effettivo del prototipo, le decisioni prese, i flussi già realizzati e i limiti ancora presenti. Non è una trascrizione della chat: è il contesto tecnico e funzionale necessario per continuare il lavoro senza ricostruirlo da zero.

## Istruzioni obbligatorie per una nuova sessione

1. Leggere integralmente `AGENTS.md` e questo file prima di modificare il progetto.
2. Prima di scrivere codice Expo/React Native, consultare la documentazione esatta di Expo SDK 57: `https://docs.expo.dev/versions/v57.0.0/`.
3. Trattare tutti i file e le modifiche già presenti come lavoro dell'utente: non sovrascriverli o ripristinarli senza autorizzazione.
4. Verificare lo stato con `git status --short` e aggiornare il repository con `git pull --ff-only origin master` quando appropriato.
5. Il progetto Sidequest deve rimanere completamente isolato da Adeo Agent Hub: non aggiungere integrazioni, comunicazioni, dipendenze o configurazioni relative ad Adeo.
6. Conservare i file in UTF-8. Alcuni caratteri accentati possono apparire alterati nell'output PowerShell, ma non vanno ricodificati alla cieca.
7. Dopo modifiche al codice eseguire almeno `npx tsc --noEmit`; quando possibile verificare anche la versione web con `npm run web` o `npx expo start`.
8. Dopo una modifica verificata, aggiornare anche questo documento se è cambiato un comportamento importante, quindi creare commit e push su `origin/master` se richiesto dal flusso di lavoro.

Prompt consigliato da fornire a Codex sul nuovo computer:

> Leggi `AGENTS.md` e `PROJECT_CONTEXT.md` per intero, controlla lo stato Git e continua dalla situazione descritta senza ricreare il progetto. Non interagire in alcun modo con Adeo Agent Hub.

## Scopo del prodotto

Sidequest è un'app Expo/React Native per gestire una community di giochi da tavolo e di carte. Comprende:

- autenticazione demo con ruolo amministratore o utente;
- dashboard differenziate per ruolo;
- gestione di eventi ricorrenti e occasionali;
- sondaggi sugli orari degli eventi;
- catalogo giochi e classifiche stagionali;
- registrazione e gestione utenti e crediti;
- impostazioni, tema scuro e traduzione italiano/inglese;
- navigazione web con path espliciti e navigazione nativa tramite React Navigation.

È al momento un prototipo frontend. Non esistono API, database o sincronizzazione cloud.

## Stack e configurazione

- Expo `~57.0.10`
- React Native `0.86.2`
- React `19.2.3`
- React Navigation 7 (`native`, `native-stack`, `bottom-tabs`)
- `react-native-svg` e `react-native-svg-transformer`
- `expo-blur`
- `expo-linear-gradient`
- `expo-image-picker`
- `expo-font`
- `expo-splash-screen`
- `expo-status-bar`
- font Rubik Dirt

Comandi principali:

```powershell
npm install
npm start
npm run android
npm run ios
npm run web
npx tsc --noEmit
```

`metro.config.js` configura gli SVG come componenti React. `declarations.d.ts` dichiara il tipo `*.svg`.

## Struttura principale

- `App.tsx`: provider globali, splash animato, landing page e stack navigation.
- `AuthContext.jsx`: autenticazione demo, profilo e permessi.
- `ThemeContext.jsx`: tema chiaro/scuro, lingua e traduzioni condivise.
- `EventStoreContext.jsx`: archivio eventi condiviso in memoria.
- `MainTabs.jsx`: bottom navigation e stato dei giochi attivi.
- `AppHeader.jsx`: header comune con freccia indietro e logo.
- `Home.jsx`: dashboard amministratore e dashboard utente.
- `Events.jsx`: elenco, creazione, sondaggi e gestione eventi.
- `Games.jsx`: catalogo giochi, attivazione, aggiunta e leghe.
- `Users.jsx`: registrazione, filtri, profili e crediti utenti.
- `Settings.jsx`: impostazioni e relative sottosezioni.
- `Login.tsx`: accesso.
- `recupero_nick.jsx`: recupero credenziali tramite WhatsApp.
- `routes.ts`: associazione dei nomi schermata ai path.
- `assets/`: loghi, icone, copertine, curve SVG e schermate di riferimento.

## Navigazione e path

La root utilizza uno stack che contiene la landing page, login, recupero credenziali e l'area protetta con tab.

| Schermata | Path web | Note |
| --- | --- | --- |
| Landing con “Iniziamo” | `/` | Nessun path aggiuntivo |
| Login | `/login` | Accesso admin o utente |
| Recupero credenziali | `/recupero-credenziali` | Contatto WhatsApp |
| Eventi | `/events` | Tab protetta |
| Giochi | `/games` | Tab protetta |
| Home | `/home` | Tab centrale/protetta |
| Utenti | `/users` | Tab protetta |
| Impostazioni | `/settings` | Tab protetta |

`ProtectedMain` rimanda al Login chi non è autenticato.

La bottom bar mostra, nell'ordine:

1. Eventi
2. Giochi
3. Home
4. Utenti
5. Impostazioni

Lo sfondo è il blu scuro del tema, originariamente `#283F70`. L'elemento attivo ha sfondo `#F5C330` e usa la variante SVG `_y`. Le icone e le etichette sono centrate verticalmente; le etichette non sono in grassetto.

## Splash e landing page

- È presente uno splash nativo gestito con `expo-splash-screen`.
- Il logo iniziale entra con animazioni di scala, rotazione, alone e dissolvenza.
- Anche il logo della landing page ha un'animazione di ingresso.
- La landing mostra logo, decorazioni/onde superiore e inferiore e pulsante “Iniziamo”.
- “Iniziamo” apre `/login`.

## Autenticazione e ruoli

Credenziali amministratore demo:

- username: `admin`
- password: `1234`

Regole attuali:

- `admin` con password `1234` entra come amministratore;
- `admin` con una password diversa viene rifiutato;
- qualsiasi altro username non vuoto, con password non vuota, entra come utente normale.

Profili creati dal contesto:

- amministratore: nome visualizzato `Sidequest Admin`, ruolo `admin`, permessi amministrativi abilitati;
- utente: nome visualizzato uguale allo username inserito, ruolo `user`, 10 crediti Sidequest e 10 crediti GameMania iniziali.

`AuthContext` espone anche `can(permission)`, ma i controlli dei permessi non sono ancora applicati in modo uniforme a tutte le schermate.

Limite importante: l'autenticazione è in memoria. Non ci sono account persistenti e gli utenti creati nella sezione Utenti non vengono aggiunti a un database di autenticazione.

## Login e recupero credenziali

`Login.tsx` contiene:

- logo centrato;
- titolo “Login” con Rubik Dirt;
- campi username e password in colonna;
- pulsante “Accedi”;
- link sottolineato “Non ricordi le tue credenziali?”;
- decorazione vettoriale in basso;
- supporto al tema scuro.

In React Native non si usa normalmente `outline: none` come sul web; gli input sono stati stilizzati senza il bordo di focus indesiderato.

`recupero_nick.jsx` contiene:

- logo e titolo “Recupero Credenziali” con Rubik Dirt;
- messaggio non editabile di richiesta supporto;
- pulsante verde “Contattaci” con logo WhatsApp;
- pulsante rosso “Annulla” con icona di ritorno.

“Contattaci” apre WhatsApp al numero `+39 3467460419` tramite `https://wa.me/393467460419`, con messaggio precompilato.

## Header comune

Le schermate interne usano `AppHeader.jsx`:

- freccia indietro in alto a sinistra tramite `assets/back.svg`;
- icona resa più grande rispetto alla prima versione;
- logo/titolo coerenti;
- comportamento riutilizzabile anche nelle future pagine.

Le nuove schermate dovrebbero riutilizzare questo componente invece di ricreare un header diverso.

## Tema e lingua

`ThemeContext.jsx` contiene palette complete `LIGHT_COLORS` e `DARK_COLORS` e traduzioni condivise.

Tema scuro:

- attivabile dallo switch con icona luna;
- applicato alle schermate principali, alle card, ai testi, agli input, alle modali e alla bottom bar;
- deve continuare a essere applicato a ogni nuova schermata.

Lingua:

- italiano e inglese;
- switch animato con EN a sinistra e IT a destra;
- il cursore scorre da destra verso sinistra quando si passa da IT a EN;
- vengono tradotte le etichette dell'interfaccia;
- non devono essere tradotti nomi degli utenti, username o nomi dei giochi.

Tema e lingua non sono ancora persistenti dopo il riavvio dell'app.

## Home amministratore

La vista amministratore riproduce a componenti i riferimenti `home_screen1.png` e `home_screen2.png`; le immagini di riferimento non sono mostrate come screenshot a schermo intero.

Contenuti:

- saluto e profilo;
- quattro blocchi statistici blu `#294E9F`;
- icone bianche, grandi e centrate in modo responsive;
- data e ora più centrate;
- sezione “Sondaggi mensili”;
- area eventi scrollabile che si estende quasi fino alla bottom bar;
- icone dei giochi prese da `assets/icone_giochi/`;
- card più grandi con countdown e numero partecipanti.

## Home utente

La vista utente è basata su `home_screen_user1.png` e contiene:

- saluto con username, icona utente e logo;
- card credito Sidequest e GameMania, inizialmente 10 ciascuna;
- icona calendario coerente con la sezione Eventi, colorata di blu;
- card degli eventi grandi, scrollabili e distribuite nell'altezza disponibile;
- totale eventi fisso e centrato in basso;
- tipologia evento visibile: `RICORRENTE` o `OCCASIONALE`;
- stato voto/presenza.

Gli eventi creati dall'amministratore vengono convertiti in card per la Home utente tramite `EventStoreContext`. Sono presenti anche eventi dimostrativi hardcoded per agosto 2026; in alcuni casi possono quindi comparire insieme ai nuovi eventi.

## Eventi — stato generale

`Events.jsx` è la schermata più articolata. Usa `EventStoreContext` come archivio condiviso in memoria e parte con un evento ricorrente dimostrativo.

Il calendario principale:

- mostra la settimana relativa al mese corrente selezionato;
- consente la navigazione tra mesi;
- evidenzia i giorni con eventi;
- non contiene il pulsante “Torna ad oggi”.

Il logo del gioco nella card è centrato verticalmente e proviene da `assets/icone_giochi/`.

## Eventi — creazione amministratore

La creazione è divisa in tre fasi con indicatore animato. Quando si passa di fase, la linea centrale pulsa.

### Fase 1 — gioco

- Mostra solo giochi attivi.
- Le immagini sono grandi e proporzionate.
- La selezione usa lo sfondo azzurro `#ADF8FF` e un bordo blu.

### Fase 2 — tipo e programmazione

Il menu a tendina contiene:

- `Ricorrente`
- `Occasionale`

La tendina usa un livello/z-index adeguato per non sovrapporsi in modo errato agli elementi sottostanti.

Per un evento ricorrente:

- selezione del singolo mese;
- selezione multipla dei giorni della settimana;
- pulsante `+` per aprire rapidamente il calendario del mese e marcare chiusure o festività da escludere;
- fasce predefinite: `15:00`, `15:30`, `16:00`, `16:30`, `17:30`, `20:00`;
- selezione simultanea di più fasce;
- “Nuova opzione +” per inserire altri orari;
- fasce orarie centrate;
- niente titoli/bande superflue davanti a “Programmazione mensile” e “Orari disponibili”.

Per un evento occasionale:

- calendario per scegliere una o più date;
- le date selezionate confluiscono nella sezione degli orari;
- ogni data può avere più orari;
- viene impedita la scelta duplicata di uno slot già assegnato;
- sono consentiti nuovi orari personalizzati.

### Fase 3 — scadenza

- opzioni rapide `3H`, `6H`, `12H`, `24H`;
- opzione personalizzata;
- selezione singola;
- la scadenza può non essere obbligatoria soltanto per gli eventi occasionali.

Confermando la fase 3, l'evento viene aggiunto allo store condiviso e diventa visibile nelle schermate utente durante la stessa esecuzione dell'app.

## Eventi — card amministratore

Le card contengono:

- icona del gioco;
- data e fascia con consenso più alto;
- countdown calcolato rispetto all'inizio del torneo e alla scadenza, con semantica “3h prima”;
- formato completo con numeri separati da `:` e parole `giorni`, `ore`, `minuti`, `secondi`; i giorni compaiono solo quando necessari;
- countdown centrato ma allineato alla partenza dei testi superiori;
- nessun titolo “Timeout”;
- numero partecipanti sul margine destro;
- `assets/curva_eventi.svg` come sfondo destro senza bordi o angoli visibili;
- menu hamburger che apre un popup di gestione con sfondo blur.

Interazioni:

- la lista partecipanti si apre solo cliccando sul numero, non cliccando la card;
- la parola “Partecipanti” è stata rimossa dalla card;
- il menu apre modifica/eliminazione e gestione sondaggio;
- l'eliminazione agisce sulla singola occorrenza/data selezionata e non rimuove le altre date della stessa serie;
- le percentuali più basse sono rosse, quelle medie arancioni, la più alta verde;
- l'amministratore può confermare un pallino/orario come orario definitivo;
- la conferma vale solo per quello specifico evento e quella specifica data;
- dopo la conferma compare in verde `START ORE --:--` con l'orario scelto.

I bordi delle altre card del sito sono rimasti quelli originari; la rimozione dei bordi riguarda la curva laterale delle card Eventi.

## Eventi — esperienza utente

L'utente normale:

- non vede il pulsante per creare eventi;
- non vede i comandi amministrativi di modifica, eliminazione o conferma finale;
- vede il tipo di evento;
- apre la lista partecipanti soltanto dal numero;
- usa card basate su `eventi_screen_user1.png`;
- usa `assets/curva1.svg` sul lato destro;
- vede `START` e, sotto, `ORE --:--` con testo più grande;
- può confermare o modificare il proprio voto.

Per eventi ricorrenti:

- il popup mostra gli orari con percentuali;
- l'opzione `Assente` è disponibile ed esclusiva rispetto agli orari;
- dopo il voto compare lo stato relativo.

Per eventi occasionali, in base a `eventi_screen_user2.png`:

- vengono mostrati elementi combinati `data, ora`;
- è possibile una scelta multipla;
- i pallini selezionati diventano gialli;
- compare l'indicazione `*Scelta multipla`;
- `Assente` resta disponibile ed esclude le altre scelte.

L'amministratore vede gli stessi slot data/ora aggregati con percentuali e partecipanti, poi può sceglierne uno come definitivo.

Limite importante: i voti utente sono ancora stato locale della schermata e non aggiornano realmente le statistiche viste dall'amministratore.

## Giochi

`Games.jsx` contiene 11 giochi predefiniti:

- Yugioh
- Pokemon
- One Piece
- Beyblade
- Yugioh Edison
- Pokemon Champions
- Magic
- Naruto
- D&D
- Lorcana
- Riftbound

Le copertine arrivano esclusivamente da `assets/copertine_giochi/`.

Elenco:

- layout responsive a due colonne;
- immagini ingrandite e scalate individualmente per compensare sorgenti con proporzioni/spazi differenti;
- `resizeMode` e padding evitano ritagli;
- border radius ridotto;
- giochi disattivati con sfondo grigio;
- barra di ricerca;
- totale fisso e centrato;
- pulsante `+` per aggiungere un gioco.
- Il gioco selezionato usa lo sfondo azzurro `#ADF8FF`.

Cliccando un gioco si apre un popup blur con:

- `Lega`;
- attivazione/disattivazione.

Il vecchio tasto “Modifica” è stato rimosso.

Attivare o disattivare un gioco aggiorna anche:

- i filtri disponibili in Utenti;
- i giochi selezionabili durante la creazione di un evento.

Lo stato dei giochi attivi è mantenuto in `MainTabs.jsx` e non è persistente.

### Aggiunta gioco

Il form usa `expo-image-picker` e richiede:

- copertina orizzontale, consigliata 16:7;
- logo/icona quadrata in miniatura;
- nome del gioco.

Il nuovo gioco viene aggiunto e attivato in memoria.

### Lega

- Yugioh usa `assets/lega_yugioh.png`, più grande e con margine inferiore.
- Filtro anno a tendina dal 2026 al 2030, con freccia centrata.
- Filtri stagione con `inverno.svg`, `primavera.svg`, `estate.svg`, `autunno.svg`.
- Colori stagionali: inverno blu, primavera rosa, estate `#D98D36`, autunno rosso scuro.
- La stagione selezionata colora lo sfondo dei punti e mostra bordo bianco.
- Ricerca partecipanti.
- Pulsanti `+4`, `+3`, `+2`, `+1` larghi quanto la card.
- Il click aggiunge punti e incrementa le presenze.
- Ordinamento per punti e poi presenze.
- Fasce oro, argento e bronzo per i primi tre; blu dal quarto posto.
- Sono mostrati i primi 7; “Mostra altri partecipanti” resta fisso in basso.
- È presente un pulsante di salvataggio, ma i dati restano in memoria.

Limite di ruolo: `Games.jsx` non applica ancora tutte le restrizioni di `AuthContext`; un utente normale può ancora vedere alcuni comandi amministrativi come aggiunta, attivazione e attribuzione punti. Questo è uno dei prossimi interventi prioritari.

## Utenti

`Users.jsx` parte da uno stato vuoto con pulsante `+` e include una registrazione in tre fasi.

### Registrazione

1. Dati personali: nome, nickname/ID, data di nascita, telefono facoltativo, email, password.
2. Selezione multipla giochi: copertine da `assets/copertine_giochi/`, ingrandite e centrate rispetto alle pill bianche, contenute senza ritaglio e con sfondo azzurro `#ADF8FF` quando selezionate; Riftbound ha una correzione inferiore specifica di 5 px.
3. Inserimento del codice ID per ogni gioco scelto nella fase precedente, su card azzurre `#ADF8FF`.

Con “Registra” viene generata una card utente locale.

### Elenco e filtri

- filtri gioco in scroll orizzontale, abbastanza visibile da suggerire lo scorrimento;
- solo giochi attivi;
- selezione simultanea di più filtri;
- riempimento azzurro `#ADF8FF` animato;
- semantica AND: se sono selezionati più giochi, compaiono soltanto utenti associati a tutti quei giochi;
- ricerca per nome o nickname;
- totale utenti centrato;
- pulsante di aggiunta separato;
- menu hamburger al posto dei tre puntini.

La card utente mostra dati, giochi selezionati, crediti Sidequest/GameMania e menu. Il popup usa blur e mantiene testi proporzionati, incluso “Modifica profilo”.

### Crediti e storico

- Loghi `sidequestcard.png` e `gamemaniacard.png`, grandi e allineati a sinistra.
- Le card seguono il riferimento `utenti_card.png`.
- Il totale credito non ha pulsanti propri.
- A sinistra esiste un piccolo input numerico per la quantità.
- L'input numerico è centrato tra i pulsanti meno e più.
- Sotto ogni logo è presente una descrizione della transazione editabile.
- `-` sottrae la quantità inserita dal totale.
- `+` aggiunge la quantità inserita al totale.
- Il credito è editabile anche digitando direttamente la quantità da applicare.
- L'icona storico sostituisce la parola “Storico”.
- Cliccando lo storico si apre una vista con movimenti dimostrativi.
- I loghi delle due card sono ingranditi; la card GameMania usa un gradiente orizzontale da `#950D10` a `#FCA129`.

Gli utenti e i movimenti restano in memoria.

Limite di ruolo: `Users.jsx` non applica ancora tutte le restrizioni di `AuthContext`; l'utente normale può ancora accedere a operazioni amministrative di registrazione e credito. Va aggiunto un controllo di ruolo prima di considerare completa la separazione admin/user.

## Impostazioni

`Settings.jsx` usa, nell'ordine, le icone:

- `luna.svg`
- `lingua.svg`
- `ticket.svg`
- `chiave.svg`
- `beatles.svg`
- `logout.svg`

La schermata principale contiene:

- profilo, username e ruolo;
- switch dark mode con badge Premium;
- switch lingua animato;
- Ticket;
- Cambia password;
- Segnalazione bug;
- Logout;
- testo versione esatto: `Sidequest App Ver.1.0`.

Sottosezioni già realizzate, basate su `settings_screen2.png` e `settings_screen3.png`:

- Ticket: messaggio massimo 150 caratteri e conferma invio; piano crediti e link di acquisto sono stati rimossi, il pulsante “Invia” è esterno alla card e testo descrittivo/campo di scrittura sono ingranditi.
- Cambio password: elenco dimostrativo di tre utenti, nuova password di almeno quattro caratteri, conferma e salvataggio locale.
- Bug: testo massimo 500 caratteri e conferma invio.

Logout chiude la sessione e ripristina la navigazione al Login.

Ticket, segnalazioni e cambio password sono simulazioni UI: non inviano dati a un servizio e non aggiornano un backend.

## Design system e regole visive consolidate

Colori principali:

- blu card: `#5372B5`
- blu scuro/bottom bar: `#283F70`
- blu profondo: `#294E9F`
- giallo attivo: `#F5C330`
- verde WhatsApp: `#4AB575`
- rosso annulla: `#C46E6B`
- arancione estate: `#D98D36`

Regole:

- Rubik Dirt va usato per titoli di branding come Login e Recupero Credenziali, non per tutto il testo.
- Le schermate di riferimento PNG servono soltanto come guida visuale: l'interfaccia deve essere costruita con componenti React Native.
- Le frecce indietro in alto a sinistra usano `assets/back.svg`.
- Le icone di navigazione attive usano le varianti `_y.svg`.
- Le copertine gioco provengono da `assets/copertine_giochi/`.
- Le icone compatte gioco provengono da `assets/icone_giochi/`.
- Le immagini vanno contenute con padding, senza ritaglio, compensando le sorgenti che includono spazio trasparente.
- Il contenuto deve riempire bene lo schermo senza risultare completamente a filo; la bottom bar resta fissa.
- Le card scrollabili devono terminare poco prima della bottom bar.
- Tema scuro e traduzione devono essere supportati da ogni nuovo componente.
- Conservare le etichette accessibili e gli `accessibilityRole` già presenti.

## Asset di riferimento

- `assets/copertine_giochi/`: copertine orizzontali dei giochi.
- `assets/icone_giochi/`: loghi compatti usati in eventi e home.
- `assets/home_screen*.png`: riferimenti per Home admin/utente.
- `assets/utenti_screen*.png` e `assets/utenti_card.png`: riferimenti per Utenti.
- `assets/games_screen*.png` e `assets/lega_yugioh.png`: riferimenti per Giochi/lega.
- `assets/eventi_screen*.png`: riferimenti Eventi admin/utente.
- `assets/settings_screen*.png`: riferimenti Impostazioni.
- `assets/curva_eventi.svg`: margine destro card Eventi amministratore.
- `assets/curva1.svg`: margine destro card Eventi utente.
- `assets/sidequestcard.png` e `assets/gamemaniacard.png`: loghi card credito.
- SVG stagionali: `inverno.svg`, `primavera.svg`, `estate.svg`, `autunno.svg`.

Prima di introdurre un nuovo asset, verificare con `rg --files assets` se ne esiste già uno adatto.

## Stato dei dati e limiti architetturali

Quasi tutti i dati vivono nello stato React e vengono persi chiudendo o ricaricando l'app:

- autenticazione;
- utenti registrati;
- crediti e storico;
- giochi aggiunti e stato attivo/disattivo;
- punti e presenze delle leghe;
- tema e lingua;
- sondaggi e voti;
- eventi creati.

`EventStoreProvider` è posizionato sopra `AuthProvider`, quindi un evento creato dall'admin sopravvive a logout/login nella stessa esecuzione e diventa visibile all'utente. Non sopravvive a un riavvio e non è condiviso fra dispositivi.

Non sono presenti:

- backend o API;
- database;
- `AsyncStorage` o altra persistenza locale;
- autenticazione sicura;
- upload remoto delle immagini;
- notifiche push;
- sincronizzazione in tempo reale;
- integrazione con Adeo Agent Hub.

## Priorità tecniche consigliate

1. Applicare realmente i permessi di ruolo in `Games.jsx`, `Users.jsx` e nelle sottosezioni Settings.
2. Introdurre persistenza locale o backend, chiarendo prima con l'utente quale soluzione desidera.
3. Collegare utenti registrati e credenziali al sistema di autenticazione.
4. Unificare i voti utente con le statistiche viste dall'admin.
5. Rimuovere o trasformare in fixture gli eventi demo per evitare duplicati con eventi creati.
6. Salvare lingua e tema.
7. Verificare deep link e refresh diretto dei path web in produzione.
8. Aggiungere test dei flussi critici admin/user e controlli responsive su dispositivi reali.

Queste sono proposte tecniche, non autorizzazioni automatiche a cambiare il prodotto. La richiesta più recente dell'utente ha sempre precedenza.

## Checklist prima di consegnare nuove modifiche

- La modifica rispetta Expo SDK 57?
- È stata usata la documentazione versionata richiesta da `AGENTS.md`?
- Funziona sia con tema chiaro sia con tema scuro?
- Le etichette previste sono tradotte in italiano e inglese?
- Nomi utente, username e nomi gioco restano invariati?
- I permessi admin/user sono coerenti?
- La bottom bar non copre il contenuto?
- Le immagini sono contenute e non tagliate?
- Gli SVG sono usati come componenti senza deformazioni?
- `npx tsc --noEmit` passa?
- `git diff --check` non segnala errori?
- `PROJECT_CONTEXT.md` deve essere aggiornato?

## Git e trasferimento su un altro computer

Il progetto è sincronizzato sul repository GitHub `Pituzzu/Sidequest`. Sul nuovo computer:

```powershell
git clone https://github.com/Pituzzu/Sidequest.git
cd Sidequest
npm install
npx tsc --noEmit
npm run web
```

Poi fornire a Codex `AGENTS.md` e `PROJECT_CONTEXT.md` oppure chiedergli esplicitamente di leggerli dal repository.

L'ID della chat Codex originaria era `019fd22f-b4de-7641-b749-c9bfc9af7dc3`, ma non è un meccanismo portabile affidabile: `codex resume` elenca normalmente sessioni conservate localmente sul computer in cui sono state create. Il repository e questo documento sono quindi il metodo affidabile per trasferire il contesto.
