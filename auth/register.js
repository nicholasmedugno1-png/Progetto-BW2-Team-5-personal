/* modello del nuovo utente da inviare al server */
class NewUser {
  constructor(_email, _password, _userName) {
    this.email = _email;
    this.password = _password;
    this.userName = _userName;
  }
}

const registerForm = document.querySelector("form");
const userName = document.querySelector("#userName");
const userEmail = document.querySelector("#userEmail");
const userPass = document.querySelector("#userPass");
const regMessage = document.querySelector("#regMessage");
const userRegister = document.querySelector("#userRegister");

userRegister.addEventListener("click", function (e) {
  e.preventDefault();
  location.href = "login.html";
});

/* invia i dati di registrazione, se va a buon fine porta al login, altrimenti mostra l'errore */
registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const newUser = new NewUser(userEmail.value, userPass.value, userName.value);
  try {
    const response = await fetch(
      "https://ttz342bj-3001.eun1.devtunnels.ms/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      },
    );
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        typeof data === "string" ? data : "Registrazione non riuscita",
      );
    regMessage.textContent =
      "Registrazione completata, reindirizzamento al login...";
    setTimeout(() => window.location.replace("login.html"), 1500);
  } catch (err) {
    regMessage.textContent = err.message;
    registerForm.reset();
  }
});
