import { Player } from "./models.js";
import { imgClean, renderCard } from "./cards.js";

/* CREAZIONE DEL PLAYER */
export const player = new Player();

/* RECUPERO ELEMENTI HTML */
const playerCover = document.querySelector(".player-cover img");
const playerTitle = document.querySelector(".player-title");
const playerArtist = document.querySelector(".player-artist");
const btnPlay = document.querySelector(".btn-play");
const playIcon = btnPlay.querySelector(".material-symbols-rounded");
const btnPrevious = document.querySelector(
  ".player-controls .btn-ctrl:nth-of-type(2)",
);
const btnNext = document.querySelector(
  ".player-controls .btn-ctrl:nth-of-type(4)",
);
const currentTime = document.querySelector(".current-time");
const duration = document.querySelector(".duration");
const progressFill = document.querySelector(".progress-fill");

const volumeControl = document.querySelector(".volume-control");
const iconVolume = document.querySelector(
  ".player-right .material-symbols-rounded",
);

/* ELEMENTI PLAYER A SCHERMO INTERO */
const fullscreenPlayer = document.querySelector("#fullscreen-player");
const fullscreenButton = document.querySelector(".btn-fullscreen");
const closeFullscreen = document.querySelector(".btn-close-player");
const fullscreenCover = document.querySelector(".fullscreen-cover");
const fullscreenTitle = document.querySelector(".fullscreen-title");
const fullscreenArtist = document.querySelector(".fullscreen-artist");
/* CONTROLLI PLAYER FULLSCREEN */
const fullscreenPrev = document.querySelector(".fullscreen-prev");
const fullscreenPlay = document.querySelector(".fullscreen-play");
const fullscreenNext = document.querySelector(".fullscreen-next");

/* COLLEGAMENTO AI CONTROLLI DEL PLAYER */
fullscreenPrev.addEventListener("click", () => {
  btnPrevious.click();
});

fullscreenPlay.addEventListener("click", () => {
  btnPlay.click();
});

fullscreenNext.addEventListener("click", () => {
  btnNext.click();
});

/* AGGIORNAMENTO INFORMAZIONI PLAYER */
export function updatePlayer(track) {
  playerCover.src = imgClean(track.artworkUrl100, 600);
  playerTitle.textContent = track.trackName;
  playerArtist.textContent = track.artistName;

  // AGGIORNAMENTO PLAYER A SCHERMO INTERO
  fullscreenCover.src = imgClean(track.artworkUrl100, 600);
  fullscreenTitle.textContent = track.trackName;
  fullscreenArtist.textContent = track.artistName;

  currentTime.textContent = "0:00";
  duration.textContent = "0:00";
  progressFill.style.width = "0%";

  playIcon.textContent = "play_arrow";
}

/* APERTURA PLAYER A SCHERMO INTERO */
if (fullscreenButton && fullscreenPlayer && closeFullscreen) {
  fullscreenButton.addEventListener("click", () => {
    if (!player.currentTrack) return;

    fullscreenPlayer.style.display = "flex";
  });

  /* CHIUSURA PLAYER */
  closeFullscreen.addEventListener("click", () => {
    fullscreenPlayer.style.display = "none";
  });

  /* CHIUSURA CLICCANDO SULLO SFONDO */
  fullscreenPlayer.addEventListener("click", (e) => {
    if (e.target === fullscreenPlayer) {
      fullscreenPlayer.style.display = "none";
    }
  });

  /* CHIUSURA CON TASTO ESC */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      fullscreenPlayer.style.display = "none";
    }
  });
}

/* AGGIORNAMENTO ICONA PLAY/PAUSA */
function updatePlayIcon() {
  const icon = player.audio.paused ? "play_arrow" : "pause";

  playIcon.textContent = icon;
  fullscreenPlay.querySelector(".material-symbols-rounded").textContent = icon;
}

/* PLAY E PAUSA */
btnPlay.addEventListener("click", () => {
  if (!player.currentTrack) return;

  player.isPlaying ? player.pause() : player.play();

  updatePlayIcon();
});

/* BRANO PRECEDENTE */
btnPrevious.addEventListener("click", () => {
  // SE SIAMO AL PRIMO BRANO, NON FACCIO NULLA
  if (player.currentIndex <= 0) return;

  player.previous();

  if (player.currentTrack) {
    updatePlayer(player.currentTrack);
  }
});

/* BRANO SUCCESSIVO */
btnNext.addEventListener("click", () => {
  player.next();

  if (player.currentTrack) {
    updatePlayer(player.currentTrack);
  }
});

/* AGGIORNAMENTO DURATA E BARRA DI AVANZAMENTO */
player.audio.addEventListener("timeupdate", () => {
  const current = player.audio.currentTime;
  const total = player.audio.duration;

  if (!total) return;

  const percentage = (current / total) * 100;

  progressFill.style.width = `${percentage}%`;
  currentTime.textContent = formatTime(current);
  duration.textContent = formatTime(total);
});

/* RECUPERO DURATA BRANO */
player.audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(player.audio.duration);
});

/* AGGIORNAMENTO ICONE AUDIO */
player.audio.addEventListener("play", () => {
  updatePlayIcon();

  if (player.currentTrack) {
    addToHistory(player.currentTrack);
  }
});
player.audio.addEventListener("pause", updatePlayIcon);
player.audio.addEventListener("ended", updatePlayIcon);

/* FORMATTAZIONE TEMPO */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

/* AGGIORNAMENTO ICONA VOLUME */
function updateIconVolume() {
  if (player.volume === 0) {
    iconVolume.textContent = "volume_off";
  } else if (player.volume < 0.5) {
    iconVolume.textContent = "volume_down";
  } else {
    iconVolume.textContent = "volume_up";
  }
}

/* IMPOSTAZIONE VOLUME INIZIALE */
player.manageVolume(Number(volumeControl.value) / 100);
updateIconVolume();

/* MODIFICA VOLUME */
volumeControl.addEventListener("input", () => {
  player.manageVolume(Number(volumeControl.value) / 100);
  updateIconVolume();
});

export const myHistory = JSON.parse(localStorage.getItem("myHistory")) ?? [];

/* aggiunge il brano in cima alla cronologia, senza doppioni, e la salva nel localstorage */
export function addToHistory(track) {
  // niente doppioni: se c'è già, lo rimuovo e lo rimetto in testa
  const index = myHistory.findIndex((t) => t.trackId === track.trackId);
  if (index !== -1) myHistory.splice(index, 1);

  myHistory.unshift(track);
  if (myHistory.length > 5) myHistory.pop(); // massimo 5

  localStorage.setItem("myHistory", JSON.stringify(myHistory));
  renderRecent();
}

/* mostra la cronologia nella griglia "riprodotti di recente", solo se la pagina la contiene */
export function renderRecent() {
  const gridRecent = document.querySelector("#grid-recent");
  if (!gridRecent) return; // altre pagine
  renderCard(myHistory, gridRecent);
}

/* allinea l'icona play o pausa di tutte le card con lo stato del player */
export function syncPlayBtn() {
  // ID DEL BRANO CARICATO NEL PLAYER
  const currentId = String(player.currentTrack?.trackId ?? "");

  // CONTROLLO SE IL BRANO È IN RIPRODUZIONE
  const playing = !player.audio.paused;

  // RECUPERO TUTTE LE CARD
  document.querySelectorAll(".card-personal").forEach((card) => {
    const btnPlayer = card.querySelector(".btnPlay .material-symbols-rounded");

    // SE LA CARD NON HA IL PULSANTE PLAY, LA SALTO
    if (!btnPlayer) return;

    // CONTROLLO SE È LA CARD DEL BRANO IN RIPRODUZIONE
    const truePlay = playing && card.dataset.id === currentId;

    // AGGIORNO L'ICONA
    btnPlayer.textContent = truePlay ? "pause" : "play_arrow";

    // AGGIORNO L'ETICHETTA ACCESSIBILE
    btnPlayer.parentElement.setAttribute(
      "aria-label",
      truePlay ? "Metti in pausa" : "Riproduci",
    );
  });
}
//ad ogni cambio stato dell'audio
player.audio.addEventListener("play", syncPlayBtn); //play
player.audio.addEventListener("pause", syncPlayBtn); //pausa
player.audio.addEventListener("ended", syncPlayBtn); //end

/* se il brano è già caricato fa play o pausa, altrimenti lo carica e lo fa partire */
export function playCard(track) {
  //il brano è caricato?
  // confronta l'id del brano cliccato con quello caricato.
  const currentPlay = player.currentTrack?.trackId === track.trackId;
  if (currentPlay) {
    player.audio.paused ? player.play() : player.audio.pause();
    return;
  }

  player.select(track);
  updatePlayer(track);
  player.play();
}
