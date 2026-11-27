import { getArtist } from "./api.js";
import { player, updatePlayer } from "./player.js";
import { myPreferit, savePreferit, renderAsideFavs } from "./cards.js";

/* VISUALIZZAZIONE PREFERITI NELLA SIDEBAR */
renderAsideFavs();

const artistActions = document.querySelector("#artist-actions");

/* RECUPERO ELEMENTI HTML */
const artistCover = document.querySelector(".album-cover");
const heroMeta = document.querySelector(".hero-meta");
const topTracks = document.querySelector("#top-tracks");

/* RECUPERO ID ARTISTA DALL'URL */
const params = new URLSearchParams(window.location.search);
const artistId = params.get("id");

/* RECUPERO DATI ARTISTA */
const loadArtist = async () => {
  try {
    const data = await getArtist(artistId);

    if (!data.artist) return;

    renderArtist(data.artist, data.tracks);
    renderTopTracks(data.tracks);
  } catch (error) {
    console.error("Errore nel recupero dell'artista:", error);
  }
};

/* VISUALIZZAZIONE DATI ARTISTA */
const renderArtist = (artist, tracks) => {
  // CREAZIONE PULSANTE PLAY
  const playButton = document.createElement("button");
  const playIcon = document.createElement("span");

  // ASSEGNAZIONE CLASSI
  playButton.className = "btn-album-play";
  playButton.type = "button";

  playIcon.className = "material-symbols-rounded";
  playIcon.textContent = "play_arrow";

  // INSERIMENTO ELEMENTI
  playButton.append(playIcon);
  artistActions.append(playButton);

  // RIPRODUZIONE BRANI ARTISTA
  playButton.addEventListener("click", () => {
    if (!tracks.length) return;

    player.setQueue(tracks, 0);
    updatePlayer(tracks[0]);
    player.play();
  });

  // CREAZIONE ELEMENTI
  const img = document.createElement("img");
  const label = document.createElement("span");
  const title = document.createElement("h1");
  const metadata = document.createElement("div");
  const genre = document.createElement("span");

  // ASSEGNAZIONE CLASSI
  img.className = "album-image";
  label.className = "album-label";
  title.className = "album-title";
  metadata.className = "album-metadata";

  // RECUPERO COPERTINA DALLE TRACCE
  const artwork = tracks.find((track) => track.artworkUrl100);

  // ASSEGNAZIONE CONTENUTI
  img.src = artwork
    ? artwork.artworkUrl100.replace("100x100bb", "600x600bb")
    : "";

  img.alt = artist.artistName;

  label.textContent = "ARTISTA";
  title.textContent = artist.artistName;
  genre.textContent = artist.primaryGenreName ?? "Genere non disponibile";

  // INSERIMENTO METADATI
  metadata.append(genre);

  // INSERIMENTO NEL DOM
  artistCover.append(img);
  heroMeta.append(label, title, metadata);
};

/* GENERAZIONE TOP TRACK */
const renderTopTracks = (tracks) => {
  topTracks.textContent = "";

  // TITOLO SEZIONE
  const heading = document.createElement("h2");
  heading.textContent = "Popolari";

  topTracks.append(heading);

  // MOSTRO I PRIMI 15 BRANI
  tracks.slice(0, 15).forEach((track, index) => {
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

      player.select(track);
      updatePlayer(track);
      player.play();
    });

    topTracks.append(row);
  });
};

loadArtist();
