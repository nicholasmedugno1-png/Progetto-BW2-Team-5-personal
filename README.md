# EpiTunes

🔗 **Demo online:** [EpiTunes su GitHub Pages](https://vincenzodv27.github.io/Progetto-BW2-Team-5/)

Progetto della **Build Week 2 di EPICODE**, realizzato dal **Team 5** (23–27 novembre 2026).

---

## 📖 Descrizione del progetto

Progetto didattico che riproduce l'esperienza di una piattaforma di streaming musicale in stile Spotify, utilizzando i dati della [iTunes Search API](https://performance-partners.apple.com/search-api).

> ℹ️ L'API di iTunes fornisce solo **anteprime audio di 30 secondi**: i brani riprodotti nell'app sono quindi delle preview, non le tracce complete.

---

## 🛠️ Tecnologie utilizzate

- HTML5
- CSS3
- JavaScript Vanilla (ES Modules)
- Bootstrap
- iTunes Search API
- JSON Server
- JSON Server Auth
- JSON
- LocalStorage
- TheAudioDB API (per renderizzare immagini artista)

### Scelte tecniche

- Chiamate all'API centralizzate in una funzione `fetchJSON` con `try/catch`, che in caso di errore mostra un avviso e restituisce un risultato vuoto.
- Richieste parallele con `Promise.allSettled`: se una chiamata fallisce, le altre vengono comunque mostrate.
- Card create con `createElement` (niente `innerHTML`).
- Event delegation sulle griglie dei risultati e sulla lista dei preferiti (niente `onclick` inline).
- Ricerca con debounce di 1 secondo per non chiamare l'API a ogni tasto.
- Riproduzione gestita con una coda (`setQueue`), così al termine di un brano parte in automatico il successivo.

### Dati salvati nel LocalStorage

| Chiave            | Contenuto                                          |
| ----------------- | -------------------------------------------------- |
| `myPreferit`      | Brani e album preferiti                            |
| `myHistory`       | Ultimi 5 brani riprodotti                          |
| `ricercheRecenti` | Ultime 10 ricerche (viene mostrata la più recente) |
| `accessToken`     | Token di accesso ricevuto al login                 |
| `loggedUser`      | Dati dell'utente loggato                           |

---

## ✨ Funzionalità del progetto

### Funzionalità principali

- [x] Layout con sidebar, contenuto centrale e player inferiore nelle 4 pagine principali.
- [x] Navigazione tra le pagine.
- [x] Classi OOP `Track`, `Album`, `Artist`, `Player`.
- [x] Utilizzo della iTunes Search API.
- [x] Riproduzione delle anteprime audio (30 secondi).
- [x] Play e pausa.
- [x] Brano precedente e successivo, con passaggio automatico alla traccia seguente.
- [x] Barra di avanzamento audio.
- [x] Controllo volume con icona che cambia in base al livello.
- [x] Ricerca con debounce e risultati divisi in brani, album e artisti.
- [x] Salvataggio dell'ultima ricerca, cliccabile per ripeterla.
- [x] Pagina Album: copertina, info (artista, anno, numero di brani, durata totale) e tracklist.
- [x] Pagina Artista: info e top 15 brani.
- [x] Sistema dei preferiti salvato in LocalStorage.
- [x] Cronologia dei brani riprodotti.
- [x] Home: riprodotti di recente, preferiti e suggerimenti per genere.
- [x] Gestione errori: input vuoto, nessun risultato trovato, pulsante "riprova".
- [x] Gestione errori: messaggio di errore in caso di mancata risposta dell'API (con testi diversi per troppe richieste e server non disponibile).
- [x] Test dei limiti della ricerca sull'API.
- [x] Layout responsive e pubblicazione su GitHub Pages.
- [x] Autenticazione con registrazione e login (JSON Server Auth).
- [x] Logout dal menu utente e reindirizzamento al login se non si è autenticati.

### Extra realizzati

- [x] Filtri artista / album / brano nella ricerca.
- [x] Player a tutto schermo con disco in vinile che gira, aperto dal pulsante nel player.
- [x] Pulsante play direttamente sulle card, con icona play/pausa sincronizzata con il player.
- [x] "I brani che ti piacciono" raccolti in un unico array.
- [x] Sezione "Album che ti piacciono" nella sidebar, con collegamento alla pagina dell'album.
- [x] Riproduzione dei preferiti cliccando sul titolo nella sidebar.
- [x] Sidebar a scomparsa su mobile con menu hamburger.
- [x] Interazione con un'ulteriore API per mostrare le foto degli artisti.
- [x] Se la foto non è presente neanche nella seconda API, viene mostrata l'iniziale del nome dell'artista.

---

## 🚀 Come avviare il progetto in locale

Il progetto usa gli ES Modules (`<script type="module">`), quindi **non funziona aprendo direttamente il file HTML** con doppio clic: serve un server locale.

1. Clona la repository:

```bash
git clone https://github.com/VincenzoDV27/Progetto-BW2-Team-5.git
```

2. Apri la cartella con VS Code.
3. Avvia `index.html` con l'estensione **Live Server**.
   > ℹ️ Senza un `accessToken` nel LocalStorage la Home reindirizza alla pagina di login. Per registrarsi e accedere deve essere attivo il server JSON Server Auth indicato in `login.js` e `register.js`.

---

## 📁 Struttura del progetto

````
├── index.html
├── search.html
├── album.html
├── artist.html
├── auth/
│   ├── login.html
│   ├── login.js
│   ├── register.html
│   └── register.js
└─ assets/
   ├── css/
   │   ├── style.css
   │   └── auth.css
   └── js/
       ├── api.js
       ├── models.js
       ├── cards.js
       ├── player.js
       ├── sidebar.js
       ├── index.js
       ├── search.js
       ├── album.js
       └── artist.js


### Le pagine HTML

#### Layout comune

Le 4 pagine principali condividono lo stesso contenitore `app`:

```html
<body>
  <div class="app d-flex flex-column">
    <div class="app-body row g-0">
      <aside class="sidebar">
        <!-- logo, navigazione, brani e album preferiti -->
        <ul id="sidebar-favs"></ul>
        <ul id="sidebar-album-favs"></ul>
      </aside>
      <main class="col overflow-auto">
        <header class="topbar">
          <div class="topbar-nav">
            <button class="btn-menu" id="btn-menu">menu</button>
            <a class="mobile-only" href="index.html">home</a>
            <a class="mobile-only" href="search.html">search</a>
          </div>
          <!-- menu utente con logout -->
          <a id="logout">Logout</a>
        </header>
        <!-- contenuto della pagina -->
      </main>
    </div>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <footer class="player"></footer>
  </div>
  <div class="fullscreen-player" id="fullscreen-player"></div>
</body>
````

L'audio non è un tag `<audio>` nell'HTML: viene creato con `new Audio()` dentro la classe `Player`.

#### 🏠 [Home](index.html)

```html
<section class="home">
  <div id="grid-recent"></div>
  <div id="grid-favorites"></div>
  <div id="grid-pop"></div>
  <div id="grid-rock"></div>
</section>
```

- Riprodotti di recente.
- I tuoi preferiti.
- Suggerimenti musicali pop e rock.

#### 🔍 [Cerca](search.html)

```html
<section class="search">
  <div class="search-box">
    <input
      id="search-input"
      placeholder="Cerca un brano, un album, un artista..."
    />
    <button id="search-button">search</button>
  </div>
  <div class="last-search">
    <span class="last-search-label">ULTIMA RICERCA:</span>
    <span id="lastSearch"></span>
  </div>
  <div id="search-filters"></div>
  <div class="search-results">
    <section id="row-tracks" hidden>
      <h2>Brani</h2>
      <div class="grid" id="grid-tracks"></div>
    </section>
    <section id="row-albums" hidden>
      <h2>Album</h2>
      <div class="grid" id="grid-albums"></div>
    </section>
    <section id="row-artists" hidden>
      <h2>Artisti</h2>
      <div class="grid" id="grid-artists"></div>
    </section>
    <div id="search-empty" hidden>
      <p>Nessun risultato trovato...</p>
      <button id="retry-search">Riprova</button>
    </div>
  </div>
</section>
```

- Input di ricerca con debounce di 1 secondo, oppure ricerca immediata con invio o con il pulsante.
- Risultati divisi in brani, album e artisti, con filtri.
- Ultima ricerca cliccabile.

#### 💿 [Album](album.html)

```html
<section class="album-page">
  <div class="album-hero" id="album-hero">
    <div class="album-cover"></div>
    <div class="hero-meta"></div>
  </div>
  <div class="hero-actions" id="album-actions"></div>
  <div class="tracklist" id="tracklist"></div>
</section>
```

- Copertina e informazioni dell'album.
- Pulsante per riprodurre tutto l'album.
- Tracklist dei brani con pulsante preferiti.

#### 🎤 [Artista](artist.html)

```html
<section class="artist-page">
  <div class="artist-hero" id="artist-hero">
    <div class="album-cover"></div>
    <div class="hero-meta"></div>
  </div>
  <div class="hero-actions" id="artist-actions"></div>
  <div class="top-tracks" id="top-tracks"></div>
</section>
```

- Informazioni sull'artista.
- Pulsante per riprodurre i brani dell'artista.
- Top 15 brani.

#### 🔐 [Login](auth/login.html) e [Registrazione](auth/register.html)

Pagine di autenticazione con struttura propria, separata dal layout comune.

```html
<main class="auth-container">
  <div class="auth-card">
    <div class="auth-brand">
      <div class="auth-logo">E</div>
      <span>EpiTunes</span>
    </div>

    <div class="auth-heading">
      <h1>Bentornato!</h1>
      <p>Accedi al tuo account per continuare ad ascoltare.</p>
    </div>

    <form>
      <div class="auth-fields">
        <input
          type="email"
          id="userEmail"
          placeholder="Inserisci l'email di registrazione"
        />
        <input
          type="password"
          id="userPass"
          placeholder="Inserisci la password"
        />
      </div>

      <div class="auth-actions">
        <button type="submit" id="userLogin">Accedi</button>
        <div class="auth-divider">oppure</div>
        <button type="button" id="userRegister">Registrati</button>
      </div>
    </form>

    <h2 id="loginError"></h2>
    <div id="spinnerLog" class="d-none">Caricamento...</div>
  </div>
</main>
```

Al submit, [login.js](auth/login.js) invia email e password a JSON Server Auth e, se sono corrette, salva il token e porta alla Home:

```js
const response = await fetch("https://ttz342bj-3001.eun1.devtunnels.ms/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(loggedUser),
});
const data = await response.json();
if (!response.ok) throw new Error("Email o password non corrette");

localStorage.setItem("accessToken", data.accessToken);
localStorage.setItem("loggedUser", JSON.stringify(data.user));
```

- Form di login.
- Form di registrazione di un nuovo utente.
- Autenticazione gestita con JSON Server Auth.

### I file CSS

- **[style.css](assets/css/style.css)**: stile globale dell'applicazione (colori, sidebar, card, player, pagine album e artista, player a tutto schermo).
- **[auth.css](assets/css/auth.css)**: stile delle pagine di login e registrazione.

### I file JavaScript

La logica è organizzata in moduli ES, che esportano e importano le funzioni tra i vari file.

- **[api.js](assets/js/api.js)**: funzione `fetchJSON` con `try/catch`, messaggi di errore, `getAlbum`, `getArtist` e `artistImg` (foto da TheAudioDB).
- **[models.js](assets/js/models.js)**: definizione delle classi `Track`, `Album`, `Artist` e `Player` (coda, play/pausa, precedente/successivo, volume).
- **[cards.js](assets/js/cards.js)**: funzioni helper per creare le card con `createElement` (`renderCard`, `renderCardArtists`) e gestione dei preferiti (`savePreferit`, `renderAsideFavs`).
- **[player.js](assets/js/player.js)**: istanza del `Player` e collegamento all'interfaccia (barra di avanzamento, volume, player a tutto schermo, cronologia, `playCard`).
- **[sidebar.js](assets/js/sidebar.js)**: apertura della sidebar su mobile, riproduzione dei preferiti dalla sidebar e logout.
- **[index.js](assets/js/index.js)**: logica della Home (recenti, preferiti, suggerimenti per genere).
- **[search.js](assets/js/search.js)**: ricerca sull'API con debounce, filtri, ultima ricerca ed event delegation sulle griglie.
- **[album.js](assets/js/album.js)**: logica della pagina Album (dettagli e tracklist).
- **[artist.js](assets/js/artist.js)**: logica della pagina Artista (info e top track).
- **[login.js](auth/login.js)**: logica della pagina di login con JSON Server Auth.
- **[register.js](auth/register.js)**: logica della pagina di registrazione di un nuovo utente.

---

## 🏷️ Versioni

### v2.1

- `api.js` con `fetchJSON` (`try/catch`), `searchTracks`, `searchAlbums`, `searchArtists`, `getAlbum` e `getArtist`.
- Classi `Track`, `Album`, `Artist` e `Player` base in `models.js`.
- `renderCard` con `createElement` per le card della Home.
- Bottone preferiti con salvataggio in LocalStorage.

### v3.1

- Pagina Cerca con input, debounce e risultati divisi in brani, album e artisti.
- Card generate con `createElement` e click gestiti con event delegation sulle griglie.
- Pagina Album con copertina, info e tracklist.
- `Player` con barra di avanzamento e volume.
- Home con riprodotti di recente, preferiti e suggerimenti per genere.
- Layout responsive e sito online su GitHub Pages.

### v3.2

- Risoluzione dei problemi con GitHub.

### v3.3

- Correzione di bug e sistemazione delle funzionalità.

### v4.1

- Pagina Artista con informazioni e top 15 brani.
- Riproduzione di album e artisti tramite coda musicale.
- Controlli per brano precedente e successivo, con passaggio automatico alla traccia seguente.
- Cronologia dei brani salvata in LocalStorage e mostrata nella Home.
- Aggiornamento della gestione del player e delle card musicali.
- Interazione con un'ulteriore API per mostrare le foto degli artisti.
- Se la foto non è presente neanche nella seconda API, viene mostrata l'iniziale del nome dell'artista.

### v4.5

- Riorganizzazione del codice JavaScript in moduli.
- Miglioramento della gestione di brani, album e artisti.
- Aggiornamento delle card musicali e degli artisti.
- Ottimizzazione della gestione del player.

### v4.6

- Implementazione aside su mobile.

### v5.0

- Autenticazione con registrazione e login (pagine `login.html` e `register.html`, stile in `auth.css`).

### v5.1

- Pulizia del codice: rimossi codice inutilizzato, `console.log` di controllo e regole CSS duplicate.
- Rimosso un listener doppio sui preferiti della sidebar.
- Corretta la duplicazione dei preferiti all'apertura della pagina Artista.
- Corretti l'icona dei preferiti nella pagina Artista e il messaggio di errore della registrazione.
- Aggiunti i commenti alle funzioni principali.

---

## 📅 Diario di sviluppo

### Giorno 0 · Lunedì 23 — Briefing

- Definiti il funzionamento dell'app e il flusso utente.
- Divisione dei compiti tra i 5 membri del team.
- Individuate le classi `Track`, `Album`, `Artist`, `Player` e i dati necessari.
- Creati la repo pubblica, le cartelle, i file vuoti e i branch.

### Giorno 1 · Martedì 24 — Layout, classi e API

- HTML statico con Bootstrap e layout sidebar / centro / player nelle 4 pagine.
- `style.css` con colori, card e player.
- Classi `Track`, `Album`, `Artist` in `models.js`.
- `fetchJSON` con `try/catch` e richieste parallele; primi dati dell'API stampati in console.
- Classe `Player` con play e pausa.

### Giorno 2 · Mercoledì 25 — Ricerca, card e dettagli

- Ricerca con debounce.
- Card di brani, album e artisti con `createElement` ed event delegation.
- Pagine Album e Artista complete.
- Player con barra di avanzamento e volume.

### Giorno 3 · Giovedì 26 — LocalStorage, Home e chiusura lavori

- Preferiti salvati in LocalStorage e raccolti nell'array "I brani che ti piacciono".
- Sezione "Album che ti piacciono".
- Cronologia dei brani riprodotti e salvataggio dell'ultima ricerca.
- Home con riprodotti di recente, preferiti e generi.
- Gestione degli errori: input vuoto, nessun risultato, pulsante "riprova", API che non risponde.
- Extra: filtri nella ricerca, player a tutto schermo e pulsante play sulle card.
- Interazione con un'ulteriore API per mostrare le foto degli artisti.
- Se la foto non è presente neanche nella seconda API, viene mostrata l'iniziale del nome dell'artista.
- Autenticazione con registrazione e login.
- Test dei limiti della ricerca sull'API.
- Controllo del codice: niente `var`, `innerHTML` e `onclick`; console pulita.
- Layout responsive e pubblicazione su GitHub Pages.

### Giorno 4 · Venerdì 27 — Revisione e consegna

- Revisione finale del codice: rimozione del codice inutilizzato, correzione di alcuni bug e commenti alle funzioni principali.
- Aggiornamento del README.
- Consegna della repo ed esposizione del progetto.

---

## 👥 Realizzato da

| Persona                | Ruolo                                                     |
| ---------------------- | --------------------------------------------------------- |
| Vincenzo Dell'Aversana | Team Leader, HTML, CSS, JS e GitHub (da mercoledì in poi) |
| Matteo Fratini         | HTML, CSS e JS                                            |
| Manuel Burgalassi      | JS e README                                               |
| Nicholas Medugno       | JS e GitHub (dall'inizio del progetto a mercoledì)        |
| Federico Semeraro      | CSS, JS e README                                          |
