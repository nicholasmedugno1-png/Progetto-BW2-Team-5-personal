import { getAlbum } from "./api.js";
import { player, updatePlayer } from "./player.js";
import { myPreferit, savePreferit, renderAsideFavs } from "./cards.js";

/* VISUALIZZAZIONE PREFERITI NELLA SIDEBAR */
renderAsideFavs();

// PULSANTE GIALLO RIPRODUZIONE ALBUM
const albumActions = document.querySelector("#album-actions");

/* RECUPERO ELEMENTI HTML */
const albumCover = document.querySelector(".album-cover");
const heroMeta = document.querySelector(".hero-meta");
const tracklist = document.querySelector("#tracklist");

/* RECUPERO ID ALBUM DALL'URL */
const params = new URLSearchParams(window.location.search);
const albumId = params.get("id");

/* RECUPERO DATI ALBUM */
const loadAlbum = async () => {
  try {
    const data = await getAlbum(albumId);

    if (!data.album) return;

    renderAlbum(data.album, data.tracks);
    renderTracklist(data.tracks);
  } catch (error) {
    console.error("Errore nel recupero dell'album:", error);
  }
};

/* VISUALIZZAZIONE DATI ALBUM */
const renderAlbum = (album, tracks) => {
  // CREAZIONE ELEMENTI
  const img = document.createElement("img");
  const label = document.createElement("span");
  const title = document.createElement("h1");
  const metadata = document.createElement("div");
  const artist = document.createElement("span");
  const year = document.createElement("span");
  const trackCount = document.createElement("span");
  const totalDuration = document.createElement("span");

  // RECUPERO ANNO
  const releaseYear = album.releaseDate
    ? new Date(album.releaseDate).getFullYear()
    : "";

  // CALCOLO DURATA TOTALE
  const totalMilliseconds = tracks.reduce(
    (total, track) => total + track.trackTimeMillis,
    0,
  );

  const totalMinutes = Math.floor(totalMilliseconds / 60000);
  const remainingSeconds = Math.floor((totalMilliseconds % 60000) / 1000);

  // ASSEGNAZIONE CLASSI
  img.className = "album-image";
  label.className = "album-label";
  title.className = "album-title";
  metadata.className = "album-metadata";

  // ASSEGNAZIONE CONTENUTI
  img.src = album.artworkUrl100.replace("100x100bb", "600x600bb");
  img.alt = album.collectionName;

  label.textContent = "ALBUM";
  title.textContent = album.collectionName;
  artist.textContent = album.artistName;
  year.textContent = releaseYear;
  trackCount.textContent = `${tracks.length} brani`;
  totalDuration.textContent = `${totalMinutes}:${String(remainingSeconds).padStart(2, "0")}`;

  // INSERIMENTO METADATI
  metadata.append(
    artist,
    document.createTextNode(" · "),
    year,
    document.createTextNode(" · "),
    trackCount,
    document.createTextNode(" · "),
    totalDuration,
  );

  // INSERIMENTO NEL DOM
  albumCover.append(img);
  heroMeta.append(label, title, metadata);

  // CREAZIONE PULSANTE PLAY
  const playButton = document.createElement("button");
  const playIcon = document.createElement("span");

  playButton.className = "btn-album-play";
  playButton.type = "button";

  playIcon.className = "material-symbols-rounded";
  playIcon.textContent = "play_arrow";

  playButton.append(playIcon);
  albumActions.append(playButton);

  // RIPRODUZIONE INTERO ALBUM
  playButton.addEventListener("click", () => {
    const firstTrack = tracks.find((track) => track.previewUrl);

    if (!firstTrack) return;

    const firstIndex = tracks.indexOf(firstTrack);

    player.setQueue(tracks, firstIndex);
    updatePlayer(firstTrack);
    player.play();
  });
};

/* GENERAZIONE TRACKLIST */
const renderTracklist = (tracks) => {
  tracklist.textContent = "";

  tracks.forEach((track, index) => {
    // CREAZIONE ELEMENTI
    const row = document.createElement("div");
    const number = document.createElement("span");
    const title = document.createElement("span");
    const duration = document.createElement("span");
    const btnPref = document.createElement("button");

    // ASSEGNAZIONE CLASSI
    row.className = "track-row";
    number.className = "track-number";
    title.className = "track-title";
    duration.className = "track-duration";

    btnPref.type = "button";

    // CONTROLLO PREFERITI
    const isPref = myPreferit.some(
      (element) => element.trackId === track.trackId,
    );

    // ASSEGNAZIONE CLASSE E ICONA
    btnPref.className = `btn ${isPref ? "btnPrefActive" : "btnPref"}`;
    btnPref.textContent = isPref ? "★" : "☆";

    // RECUPERO DURATA
    const minutes = Math.floor(track.trackTimeMillis / 60000);
    const seconds = Math.floor((track.trackTimeMillis % 60000) / 1000);

    // ASSEGNAZIONE CONTENUTI
    number.textContent = index + 1;
    title.textContent = track.trackName;
    duration.textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;

    /* GESTIONE PREFERITI */
    btnPref.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const indexPref = myPreferit.findIndex(
        (element) => element.trackId === track.trackId,
      );

      indexPref !== -1
        ? myPreferit.splice(indexPref, 1)
        : myPreferit.push(track);

      // SALVATAGGIO PREFERITI
      savePreferit();

      // AGGIORNAMENTO ICONA
      const isFavorite = indexPref === -1;

      btnPref.textContent = isFavorite ? "★" : "☆";

      btnPref.classList.toggle("btnPrefActive", isFavorite);
      btnPref.classList.toggle("btnPref", !isFavorite);
    });

    // INSERIMENTO ELEMENTI
    row.append(number, title, duration, btnPref);

    // RIPRODUZIONE BRANO
    row.addEventListener("click", () => {
      if (!track.previewUrl) return;

      player.setQueue(tracks, index);
      updatePlayer(track);
      player.play();
    });

    tracklist.append(row);
  });
};

loadAlbum();
