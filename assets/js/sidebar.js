import { myPreferit } from "./cards.js";
import { playCard } from "./player.js";

const btnMenu = document.querySelector("#btn-menu");
const sidebar = document.querySelector(".sidebar");
const sidebarOverlay = document.querySelector("#sidebar-overlay");

/* apre o chiude la sidebar su mobile insieme all'overlay e cambia l'icona del menu */
function toggleSidebar() {
  const isOpen = sidebar.classList.toggle("active");

  sidebarOverlay.classList.toggle("active", isOpen);

  btnMenu.setAttribute("aria-expanded", isOpen);

  btnMenu.querySelector("span").textContent = isOpen ? "close" : "menu";
}

btnMenu.addEventListener("click", toggleSidebar);

sidebarOverlay.addEventListener("click", toggleSidebar);

/* RIPRODUZIONE BRANI PREFERITI DALLA SIDEBAR */
const sideFavs = document.querySelector("#sidebar-favs");

sideFavs.addEventListener("click", (e) => {
  const selectedFav = e.target.closest("li[data-id]");

  if (!selectedFav) return;

  const track = myPreferit.find(
    (item) => String(item.trackId) === selectedFav.dataset.id,
  );

  if (!track) return;

  playCard(track);

  /* CHIUSURA SIDEBAR SE APERTA */
  if (sidebar.classList.contains("active")) {
    toggleSidebar();
  }
});

// FUNZIONE PER HEADER LOGOUT

const logout = document.querySelector("#logout");

if (logout) {
  logout.addEventListener("click", function (e) {
    e.preventDefault();

    localStorage.removeItem("accessToken");
    localStorage.removeItem("loggedUser");

    window.location.href = "./auth/login.html";
  });
}
