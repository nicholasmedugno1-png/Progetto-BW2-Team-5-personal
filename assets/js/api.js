/*>>>>>>>> MANUEL <<<<<<<<<<< */
import { Track, Album, Artist } from "./models.js";

export const API_BASE = "https://itunes.apple.com";

export const API_SECOND =
  "https://www.theaudiodb.com/api/v1/json/123/search.php?s=";

/* mostra sotto l'header un avviso di errore che sparisce dopo 4 secondi, il testo cambia in base allo status */
const showApiError = (status) => {
  let errorMessage = document.querySelector("#api-error");

  if (!errorMessage) {
    errorMessage = document.createElement("div");
    errorMessage.id = "api-error";
    errorMessage.className = "alert alert-danger text-center m-3";
    errorMessage.setAttribute("role", "alert");

    if (status === 429) {
      errorMessage.textContent =
        "Hai effettuato troppe richieste. Attendi qualche secondo prima di riprovare.";
    } else if (status >= 500) {
      errorMessage.textContent =
        "Il server non è momentaneamente disponibile. Riprova più tardi.";
    } else {
      errorMessage.textContent =
        "⚠️ Impossibile comunicare con l'API iTunes. Controlla la connessione e riprova.";
    }

    document.querySelector("header").after(errorMessage);

    setTimeout(() => {
      errorMessage.remove();
    }, 4000);
  }
};

/* fetchJSON con try/catch */
/* esegue la fetch e restituisce il json, in caso di errore mostra l'avviso e restituisce un risultato vuoto */
export const fetchJSON = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      showApiError(response.status);
      return {
        results: [],
        resultCount: 0,
        error: true,
        status: response.status,
      };
    }

    return await response.json();
  } catch (error) {
    console.error("fetchJSON:", error);
    showApiError();
    return { results: [], resultCount: 0, error: true };
  }
};

/* RECUPERO ALBUM E RELATIVE TRACCE */

// restituisce un oggetto album e un array di oggetti track
export const getAlbum = async (id) => {
  const data = await fetchJSON(`${API_BASE}/lookup?id=${id}&entity=song`);

  const albumData = data.results.find(
    (item) => item.wrapperType === "collection",
  );

  const tracks = data.results
    .filter((item) => item.wrapperType === "track")
    .map((item) => new Track(item));

  return {
    album: albumData ? new Album(albumData) : null,
    tracks,
  };
};

/* RECUPERO ARTISTA E RELATIVE TRACCE */

// restituisce un oggetto artist e un array di oggetti track
export const getArtist = async (id) => {
  const data = await fetchJSON(`${API_BASE}/lookup?id=${id}&entity=song`);

  const artistData = data.results.find((item) => item.wrapperType === "artist");

  const tracks = data.results
    .filter((item) => item.wrapperType === "track")
    .map((item) => new Track(item));

  return {
    artist: artistData ? new Artist(artistData) : null,
    tracks,
  };
};

/* cerca la foto dell'artista su theaudiodb, se non la trova restituisce null */
export const artistImg = async (name) => {
  try {
    const response = await fetch(API_SECOND + encodeURIComponent(name));
    const dati = await response.json();

    if (!dati.artists) return null; // cantante non trovato

    return dati.artists[0].strArtistThumb || null; // a volte la foto è vuota
  } catch (errore) {
    console.error("errore nel caricamento della foto", errore);
    return null;
  }
};
