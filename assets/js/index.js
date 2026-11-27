import { fetchJSON, API_BASE } from "./api.js";
import { Track } from "./models.js";
import {
  player,
  updatePlayer,
  myHistory,
  renderRecent,
  playCard,
} from "./player.js";
import {
  myPreferit,
  renderCard,
  gridFavorites,
  renderAsideFavs,
} from "./cards.js";

const gridPop = document.querySelector("#grid-pop");
const gridRock = document.querySelector("#grid-rock");

const home = document.querySelector(".home");

// const gridRecent = document.querySelector("#grid-recent");
// const myHistory = JSON.parse(localStorage.getItem("myHistory")) ?? [];
renderRecent();

let popTracks = [];
let rockTracks = [];
renderAsideFavs();
renderCard(myPreferit, gridFavorites);

// renderCard(myHistory, gridRecent);
// console.log(myHistory);

const BASE_URL = `${API_BASE}` + "/search?entity=song&limit=8&term=";

/* carica in parallelo i brani pop e rock e li mostra nelle due griglie */
const loadSuggestions = async () => {
  const [pop, rock] = await Promise.allSettled([
    fetchJSON(BASE_URL + "pop"),
    fetchJSON(BASE_URL + "rock"),
  ]);

  if (pop.status === "fulfilled") {
    popTracks = pop.value.results;
    renderCard(popTracks, gridPop);
  }

  if (rock.status === "fulfilled") {
    rockTracks = rock.value.results;
    renderCard(rockTracks, gridRock);
  }
};
loadSuggestions();

//add event listener su tutta la griglia section class home
home.addEventListener("click", (e) => {
  // ESCLUDO IL CLICK SUI PREFERITI
  if (e.target.closest(".btnPref, .btnPrefActive")) return;

  // INTERCETTO LA CARD
  const cardSelected = e.target.closest(".card-personal");
  if (!cardSelected) return;

  // RECUPERO L'ID DEL BRANO
  const cardSelectedId = Number(cardSelected.dataset.id);

  // INDIVIDUO LA GRIGLIA DI PROVENIENZA
  const selectedGrid = cardSelected.closest(
    "#grid-pop, #grid-rock, #grid-favorites, #grid-recent",
  );

  // RECUPERO I BRANI DELLA SEZIONE
  let selectedTracks = [];

  if (selectedGrid?.id === "grid-pop") {
    selectedTracks = popTracks;
  } else if (selectedGrid?.id === "grid-rock") {
    selectedTracks = rockTracks;
  } else if (selectedGrid?.id === "grid-favorites") {
    selectedTracks = myPreferit;
  } else if (selectedGrid?.id === "grid-recent") {
    selectedTracks = myHistory;
  }

  // CERCO IL BRANO
  const trackData = selectedTracks.find(
    (item) => item.trackId === cardSelectedId,
  );

  if (!trackData) return;

  // CREO L'OGGETTO TRACK
  const track = new Track(trackData);

  // CONTROLLO SE È CAMBIATO IL BRANO
  const isNewTrack = player.currentTrack?.trackId !== cardSelectedId;

  // CONTROLLO SE È CAMBIATA LA CODA
  const queueChanged =
    player.queue.length !== selectedTracks.length ||
    player.queue.some(
      (item, index) => item.trackId !== selectedTracks[index].trackId,
    );

  // AGGIORNO LA CODA SE NECESSARIO
  if (isNewTrack || queueChanged) {
    const queue = selectedTracks.map((item) => new Track(item));
    const index = queue.findIndex((item) => item.trackId === cardSelectedId);

    player.setQueue(queue, index);
  }

  // SE CLICCO SUL PULSANTE PLAY
  if (e.target.closest(".btnPlay")) {
    // SE È CAMBIATO IL BRANO O LA CODA, AGGIORNO IL PLAYER
    if (isNewTrack || queueChanged) {
      updatePlayer(track);
      player.play();
    } else {
      // SE IL BRANO È GIÀ SELEZIONATO, GESTISCO PLAY E PAUSA
      playCard(track);
    }
  } else {
    // SE CLICCO SULLA CARD, AGGIORNO LE INFORMAZIONI DEL PLAYER
    updatePlayer(track);
  }
});
