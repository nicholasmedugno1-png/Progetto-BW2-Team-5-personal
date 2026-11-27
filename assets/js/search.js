import { fetchJSON, API_BASE } from "./api.js";
import { Track, Album, Artist } from "./models.js";
import { renderCard, renderCardArtists, renderAsideFavs } from "./cards.js";
import { player, updatePlayer, addToHistory, playCard } from "./player.js";

const inputUser = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const gridTracks = document.querySelector("#grid-tracks");
const gridAlbums = document.querySelector("#grid-albums");
const gridArtists = document.querySelector("#grid-artists");
const searchSpinner = document.querySelectorAll(".search-spinner");
const mySections = document.querySelectorAll(".mysection");
const searchEmpty = document.querySelector("#search-empty");
const retryButton = document.querySelector("#retry-search");
const lastSearchBox = document.querySelector(".last-search");
const lastSearch = document.querySelector("#lastSearch");
const searchFilters = document.querySelector("#search-filters");
const setLoading = (on) =>
  searchSpinner.forEach((s) => s.classList.toggle("d-none", !on));

//array per i brani della ricerca
let tracksFound = [];
renderAsideFavs();

/* ricerca generica, entity = canzone o album o artista */
const search = async (term, entity, limit) => {
  const url = `${API_BASE}/search?term=${encodeURIComponent(term)}&entity=${entity}&limit=${limit}`;
  const data = await fetchJSON(url);
  return data.results;
};

/* traccia */
export const searchTracks = async (term, limit = 12) => {
  const results = await search(term, "song", limit);
  return results
    .filter((data) => data.previewUrl)
    .map((data) => new Track(data));
};

/* album */
export const searchAlbums = async (term, limit = 12) => {
  const results = await search(term, "album", limit);
  return results.map((data) => new Album(data));
};

/* artisti */
export const searchArtists = async (term, limit = 12) => {
  const results = await search(term, "musicArtist", limit);
  return results.map((data) => new Artist(data));
};

/* GESTIONE EVENTI PAGINA SEARCH */
let timerSearch;

/* parte con il click sul bottone o con invio, salva il termine, avvia la ricerca e svuota l'input */
function manageResearch(e) {
  if (e.type === "click" || e.key === "Enter") {
    e.preventDefault();

    const term = inputUser.value.trim();

    if (!term) return;
    saveSearch(term);
    searchAll(term);
    inputUser.blur(); // fa partire il salvataggio finché il testo c'è ancora
    clearInputUser();
  }
}

searchButton.addEventListener("click", manageResearch);
inputUser.addEventListener("keydown", manageResearch);

inputUser.addEventListener("input", () => {
  clearTimeout(timerSearch);

  const query = inputUser.value.trim();

  if (!query) {
    clearSearch();
    return;
  }
  timerSearch = setTimeout(() => {
    searchAll(query);
  }, 1000);
});

inputUser.addEventListener("blur", () => {
  const term = inputUser.value.trim();
  if (!term) return; // input vuoto, niente da salvare
  saveSearch(term);
});

const KEY_SEARCH = "ricercheRecenti";

/* salva il termine in cima alla lista, togliendo un eventuale doppione */
function saveSearch(term) {
  const ricerche = JSON.parse(localStorage.getItem(KEY_SEARCH)) || [];

  const noDuplicates = ricerche.filter(
    (r) => r.toLowerCase() !== term.toLowerCase(),
  );

  noDuplicates.unshift(term); // la più recente va per prima

  localStorage.setItem(KEY_SEARCH, JSON.stringify(noDuplicates.slice(0, 10)));
  showLastSearch();
}

/* mostra l'ultima ricerca salvata, se non ce ne sono nasconde il box */
function showLastSearch() {
  const ricerche = JSON.parse(localStorage.getItem(KEY_SEARCH)) || [];

  if (ricerche.length === 0) {
    lastSearchBox.hidden = true;
    return;
  }

  lastSearch.textContent = ricerche[0];
  lastSearchBox.hidden = false;
}

lastSearch.addEventListener("click", () => {
  const term = lastSearch.textContent;

  if (!term) return;

  clearTimeout(timerSearch); // annullo una ricerca col timer eventualmente in attesa
  searchAll(term);
});

showLastSearch(); // al caricamento della pagina

const FILTERS = [
  { label: "Tutti", value: "all" },
  { label: "Brani", value: "tracks" },
  { label: "Album", value: "albums" },
  { label: "Artisti", value: "artists" },
];

let activeFilter = "all";

/* creates the filter buttons, the active one is filled */
function showFilters() {
  searchFilters.textContent = "";

  FILTERS.forEach(({ label, value }) => {
    const isActive = value === activeFilter;
    const colorClass = isActive ? "btn-light" : "btn-outline-light";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `btn btn-sm rounded-pill ${colorClass}`;
    btn.textContent = label;
    btn.dataset.filter = value;
    btn.setAttribute("aria-pressed", isActive);
    searchFilters.append(btn);
  });
}

/* mostra una sezione solo se ha risultati e se passa il filtro */

function applyFilter() {
  const sections = [
    { value: "tracks", grid: gridTracks },
    { value: "albums", grid: gridAlbums },
    { value: "artists", grid: gridArtists },
  ];

  sections.forEach(({ value, grid }) => {
    const hasResults = grid.children.length > 0;
    const matchesFilter = activeFilter === "all" || activeFilter === value;
    grid.closest("section").hidden = !(hasResults && matchesFilter);
  });
}

/* click su un filtro (event delegation sul contenitore) */
searchFilters.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;

  activeFilter = btn.dataset.filter;
  showFilters(); //aggiorna quale bottone è attivo
  applyFilter(); //mostra e nascone le sezioni
});

showFilters(); //al caricamento della pagina mette i filtri

/* cerca in parallelo brani, album e artisti, poi mostra i risultati e applica il filtro attivo */
const searchAll = async (term) => {
  mySections.forEach((spinner) => (spinner.hidden = false));
  setLoading(true);
  try {
    const [tracks, albums, artists] = await Promise.allSettled([
      searchTracks(term),
      searchAlbums(term),
      searchArtists(term),
    ]);

    const arrayTrack = tracks.status === "fulfilled" ? tracks.value : [];
    const arrayAlbum = albums.status === "fulfilled" ? albums.value : [];
    const arrayArtist = artists.status === "fulfilled" ? artists.value : [];

    const noResults =
      arrayTrack.length === 0 &&
      arrayAlbum.length === 0 &&
      arrayArtist.length === 0;

    searchEmpty.hidden = !noResults;

    //salvo i brani
    tracksFound = arrayTrack;

    renderCard(arrayTrack, gridTracks);
    renderCard(arrayAlbum, gridAlbums);
    renderCardArtists(arrayArtist, gridArtists);
    applyFilter();
  } finally {
    setLoading(false);
  }
};

// EVENT DELEGATION sula griglia dei brani
gridTracks.addEventListener("click", (e) => {
  // ESCLUDO IL CLICK SUI PREFERITI
  if (e.target.closest(".btnPref, .btnPrefActive")) return;

  // INTERCETTO LA CARD
  const cardSelected = e.target.closest(".card-personal");
  if (!cardSelected) return;

  // RECUPERO L'ID DEL BRANO
  const cardSelectedId = Number(cardSelected.dataset.id);

  // CERCO IL BRANO NEI DATI DISPONIBILI
  const track = tracksFound.find((item) => item.trackId === cardSelectedId);

  if (!track) return;
  if (player.currentTrack?.trackId !== track.trackId) addToHistory(track);

  if (e.target.closest(".btnPlay")) {
    playCard(track);
  } else {
    // SELEZIONO IL BRANO
    player.select(track);

    // AGGIORNO IL PLAYER
    updatePlayer(track);
  }
});

/* svuota le griglie, nasconde le sezioni e azzera i risultati della ricerca */
function clearSearch() {
  clearTimeout(timerSearch); // annulla una ricerca che stava per partire
  setLoading(false);

  // svuoto le griglie
  gridTracks.textContent = "";
  gridAlbums.textContent = "";
  gridArtists.textContent = "";

  // nascondo le sezioni
  gridTracks.closest("section").hidden = true;
  gridAlbums.closest("section").hidden = true;
  gridArtists.closest("section").hidden = true;

  // NASCONDO IL MESSAGGIO DI NESSUN RISULTATO
  searchEmpty.hidden = true;

  // AZZERO I BRANI TROVATI
  tracksFound = [];
}

/* svuota il campo di ricerca */
function clearInputUser() {
  inputUser.value = "";
}

/* "riprova" pulisce tutto e rimette il cursore nel campo di ricerca */
retryButton.addEventListener("click", () => {
  inputUser.value = "";
  clearSearch();
  inputUser.focus();
});
