import { artistImg } from "./api.js";

export const myPreferit = JSON.parse(localStorage.getItem("myPreferit")) ?? [];
export const gridFavorites = document.querySelector("#grid-favorites");

/* crea un elemento html con classi e testo opzionali */
export function create(tag, classes, texts) {
  const element = document.createElement(tag);
  if (classes) element.className = classes;
  if (texts !== undefined) element.textContent = texts;
  return element;
}

/* crea una card per ogni brano o album dell'array e la inserisce nel contenitore */
export function renderCard(array, containerPadre) {
  if (!containerPadre) return;
  containerPadre.textContent = "";
  array.forEach((item) => {
    const titleText = item.trackName ?? item.collectionName ?? "";
    const artistText = item.artistName ?? "";

    //DIV CONTENENTE TUTTA LA CARD
    const myDivCard = create("div", "card-personal");
    myDivCard.dataset.id = item.trackId ?? item.collectionId ?? item.artistId;
    //DIV DELL IMG DELLA CANZONE
    const myDivImg = create("div", "myDivImg"); //AGGIUNGERE CLASSI E CONTENUTO
    // myDivImg.classList.add("")
    const myImg = create("img"); //AGGIUNGERE CLASSI E CONTENUTO
    myImg.src = imgClean(item.artworkUrl100, 600);

    // APPEND DELL IMG AL DIV
    myDivImg.append(myImg);

    // BOTTONE PLAY solo per i brani
    if (item.previewUrl) {
      const btnPlay = create("button", "btnPlay");
      btnPlay.type = "button";
      btnPlay.setAttribute("aria-label", "riproduci");
      btnPlay.append(create("span", "material-symbols-rounded", "play_arrow"));
      myDivImg.append(btnPlay);
    }
    const myDivTitle = create("div", "myDivTitle"); //AGGIUNGERE CLASSI IL CONTENUTO SONO GLI ELEMENTI DI SOTTO
    //PARAGRAFO CHE CONTIENE IL TITOLO DEL BRANO
    const mytitle = create("p", "", titleText); //AGGIUNGERE CLASSI E CONTENUTO
    //P CONTENENTE TITOLO ARTISTA
    const myArtist = create("p", "", artistText); //AGGIUNGERE CLASSI E CONTENUTO
    const id = item.trackId ?? item.collectionId;
    const isPref = myPreferit.some(
      (element) => (element.trackId ?? element.collectionId) === id,
    );
    //BTN CHE CONTIENE L ICONA PREFERITI
    const btnPref = create(
      "button",
      `btn ${isPref ? "btnPrefActive" : "btnPref"}`,
      isPref ? "★" : "☆",
    );

    btnPref.addEventListener("click", (e) => {
      e.preventDefault();
      const index = myPreferit.findIndex(
        (element) => (element.trackId ?? element.collectionId) === id,
      );

      /* L'ICONA SI AGGIORNA DOPO, SU TUTTE LE COPIE */
      index !== -1 ? myPreferit.splice(index, 1) : myPreferit.push(item);
      savePreferit();

      const newIcon = index !== -1 ? "☆" : "★"; // se c'era l'abbiamo tolto, se non c'era l'abbiamo messo
      const allButtons = document.querySelectorAll(
        `[data-id="${id}"] .btnPref, [data-id="${id}"] .btnPrefActive`,
      );
      allButtons.forEach((button) => {
        button.textContent = newIcon;
        button.classList.toggle("btnPrefActive", index === -1);
        button.classList.toggle("btnPref", index !== -1);
      });

      renderCard(myPreferit, gridFavorites);
    });

    myDivTitle.append(mytitle, myArtist, btnPref);
    myDivCard.append(myDivImg, myDivTitle);

    /* APERTURA PAGINA ALBUM */
    if (item.collectionId && !item.trackId) {
      myDivCard.addEventListener("click", (e) => {
        if (e.target.closest(".btnPref, .btnPrefActive")) return;

        window.location.href = `album.html?id=${item.collectionId}`;
      });
    }

    containerPadre.append(myDivCard);
  });
}

/* salva i preferiti nel localstorage e aggiorna la sidebar */
export function savePreferit() {
  localStorage.setItem("myPreferit", JSON.stringify(myPreferit));
  renderAsideFavs();
}

/* sostituisce nell'url della copertina la misura 100x100 con quella richiesta */
export function imgClean(url, size = 600) {
  if (!url) return "";
  return url.replace(/\d+x\d+bb/, `${size}x${size}bb`);
}

/* mostra nella sidebar i brani e gli album preferiti, divisi nelle due liste */
export function renderAsideFavs() {
  //intercetto la lista
  const sideFavs = document.querySelector("#sidebar-favs");
  const sideAlbumFavs = document.querySelector("#sidebar-album-favs");

  //svuoto la lista
  sideFavs.textContent = "";
  sideAlbumFavs.textContent = "";

  myPreferit.forEach((item) => {
    if (item.trackId) {
      const listFavs = create("li", "list-favs fst-italic with-hover");
      listFavs.textContent = item.trackName;
      listFavs.dataset.id = item.trackId; // salvo id nel li
      sideFavs.append(listFavs);
    } else if (item.collectionId) {
      const listFavsAlbum = create(
        "li",
        "list-favs-album fst-italic with-hover",
      );

      listFavsAlbum.textContent = item.collectionName;
      listFavsAlbum.dataset.id = item.collectionId;

      /* APERTURA PAGINA ALBUM */
      listFavsAlbum.addEventListener("click", () => {
        window.location.href = `album.html?id=${item.collectionId}`;
      });

      sideAlbumFavs.append(listFavsAlbum);
    }
  });
  if (sideFavs.children.length === 0) {
    sideFavs.append(create("li", "list-favs fst-italic", "Ancora nessuno"));
  }
  if (sideAlbumFavs.children.length === 0) {
    sideAlbumFavs.append(
      create("li", "list-favs fst-italic", "Ancora nessun album"),
    );
  }
}

/* crea le card degli artisti con l'iniziale, poi carica la foto quando arriva */
export function renderCardArtists(array, containerPadre) {
  if (!containerPadre) return;
  containerPadre.textContent = "";

  array.forEach(async (item) => {
    const myDivArtist = create("div", "artist-result-card");

    /* CREAZIONE AVATAR */
    const myDivImg = create("div", "artist-avatar");
    const myImg = create("img");
    myImg.alt = item.artistName;

    /* INIZIALE DA MOSTRARE SE MANCA LA FOTO */
    myDivImg.textContent = item.artistName.charAt(0).toUpperCase();
    myDivImg.append(myImg);

    /* NOME ARTISTA */
    const myTitleArtist = create("p", "myTitleArtist", item.artistName);

    myDivArtist.append(myDivImg, myTitleArtist);
    containerPadre.append(myDivArtist);

    /* APERTURA PAGINA ARTISTA */
    myDivArtist.addEventListener("click", () => {
      window.location.href = `artist.html?id=${item.artistId}`;
    });

    /* RECUPERO FOTO */
    const foto = await artistImg(item.artistName);

    if (foto) {
      myImg.src = foto;
      myDivImg.classList.add("has-image");
      myDivImg.firstChild.textContent = "";
    }
  });
}
