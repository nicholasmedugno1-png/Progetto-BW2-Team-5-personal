const loginForm = document.querySelector("form");
const userEmail = document.querySelector("#userEmail");
const userPass = document.querySelector("#userPass");
const userRegister = document.querySelector("#userRegister");
const loginError = document.querySelector("#loginError");
const spinnerLog = document.querySelector("#spinnerLog");

userRegister.addEventListener("click", function (e) {
  e.preventDefault();
  location.href = "register.html";
});

/* invia email e password al server, se sono corrette salva token e utente e porta alla home */
loginForm.addEventListener("submit", async function (e) {
  spinnerLog.classList.remove("d-none");
  e.preventDefault();
  const loggedUser = {
    email: userEmail.value,
    password: userPass.value,
  };
  try {
    const response = await fetch(
      "https://ttz342bj-3001.eun1.devtunnels.ms/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loggedUser),
      },
    );
    const data = await response.json();
    if (!response.ok) throw new Error("Email o password non corrette");
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("loggedUser", JSON.stringify(data.user));
    loginError.textContent = "Login corretto, accesso al tuo profilo";
    setTimeout(() => {
      location.href = "../index.html";
    }, 3000);
  } catch (err) {
    spinnerLog.classList.add("d-none");
    loginError.textContent = err.message;
    loginForm.reset();
  }
});
