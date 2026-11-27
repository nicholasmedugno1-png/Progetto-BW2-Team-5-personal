// Federico -> Definizione classe Track all'interno del constructor si riceve un oggetto data ed all'interno del costruttore viene letto il valore della proprietà messo in export da importare in index.js

export class Track {
  constructor(data) {
    this.trackId = data.trackId;
    this.trackName = data.trackName;
    this.artistId = data.artistId;
    this.trackTimeMillis = data.trackTimeMillis || 0;
    this.artistName = data.artistName;
    this.collectionId = data.collectionId;
    this.collectionName = data.collectionName;
    this.previewUrl = data.previewUrl;
    this.artworkUrl100 = data.artworkUrl100;
    this.wrapperType = data.wrapperType;
  }
}

// classe album ->

export class Album {
  constructor(data) {
    this.collectionId = data.collectionId;
    this.collectionName = data.collectionName;
    this.artistName = data.artistName;
    this.primaryGenreName = data.primaryGenreName;
    this.artistId = data.artistId;
    this.artworkUrl100 = data.artworkUrl100;
    this.releaseDate = data.releaseDate;
    this.wrapperType = data.wrapperType;
  }
}

/* classe artista, tiene solo id, nome e genere */
export class Artist {
  constructor(data) {
    this.artistId = data.artistId;
    this.artistName = data.artistName;
    this.primaryGenreName = data.primaryGenreName;
  }
}

// non vengono passate proprietà all'interno del constructor perché non si sa in origine quale canzone verrà riprodotta

export class Player {
  constructor() {
    this.currentTrack = null;
    this.isPlaying = false;
    this.volume = 1;
    this.audio = new Audio();

    // CODA DI RIPRODUZIONE
    this.queue = [];
    this.currentIndex = -1;

    // PASSA AUTOMATICAMENTE AL BRANO SUCCESSIVO
    this.audio.addEventListener("ended", () => {
      this.next();
    });
  }

  // IMPOSTA UNA CODA DI RIPRODUZIONE
  setQueue(tracks, index = 0) {
    this.queue = tracks;
    this.currentIndex = index;

    this.select(this.queue[index]);
  }

  // SELEZIONA UN BRANO
  select(track) {
    this.currentTrack = track;
    this.isPlaying = false;
    this.audio.pause();
    this.audio.currentTime = 0;

    const index = this.queue.findIndex(
      (item) => item.trackId === track.trackId,
    );

    if (index !== -1) {
      this.currentIndex = index;
    }
  }

  // RIPRODUCE IL BRANO
  play() {
    if (!this.currentTrack || !this.currentTrack.previewUrl) return;

    this.audio.src = this.currentTrack.previewUrl;

    this.audio
      .play()
      .then(() => {
        this.isPlaying = true;
      })
      .catch((error) => {
        this.isPlaying = false;
        console.error("Riproduzione fallita:", error);
      });
  }

  // METTE IN PAUSA
  pause() {
    this.isPlaying = false;
    this.audio.pause();
  }

  // BRANO SUCCESSIVO
  next() {
    if (this.currentIndex < 0) return;
    if (this.currentIndex >= this.queue.length - 1) {
      this.pause();
      return;
    }

    this.select(this.queue[this.currentIndex + 1]);
    this.play();
  }

  // BRANO PRECEDENTE
  previous() {
    if (this.currentIndex <= 0) return;

    this.select(this.queue[this.currentIndex - 1]);
    this.play();
  }

  // GESTIONE VOLUME
  manageVolume(volume) {
    const safeVolume = Math.min(1, Math.max(0, volume));
    this.volume = safeVolume;
    this.audio.volume = safeVolume;
  }

  // AVANZAMENTO BRANO
  seek(seconds) {
    if (!this.currentTrack) return;
    this.audio.currentTime = seconds;
  }
}
