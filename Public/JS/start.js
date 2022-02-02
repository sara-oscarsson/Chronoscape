window.addEventListener("load", () => {
  checkIfLoggedIn();
  mobileLinks.style.display = "none";
});

let prevScrollpos = window.pageYOffset;
window.onscroll = function () {
  let currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById("header").style.top = "0";
  } else {
    document.getElementById("header").style.top = "-80px";
  }
  prevScrollpos = currentScrollPos;
};

let logoutDiv = document.getElementById("logout");
let mobileLogin = document.getElementById("mobileLogin");
let mobileLinks = document.getElementById("mobileLinks");
let barsMenu = document.getElementById("barsMenu");

const mobileLoginFunction = async () => {
  if (mobileLogin.innerText === "Logout") {
    let response = await makeRequest("/logout", "DELETE");
    checkIfLoggedIn();
    checkMyAccount();
  } else {
    location.replace("http://localhost:3000/login.html");
  }
};

barsMenu.addEventListener("click", () => {
  let mobileHeader = document.querySelector(".mobileHeader");
  if (mobileLinks.style.display === "none") {
    mobileLinks.style.display = "flex";
    mobileHeader.style.backgroundColor = "black";
    barsMenu.classList.replace("fa-bars", "fa-times");
    barsMenu.style.color = "white";
    mobileHeader.style.position = "fixed";
  } else {
    mobileLinks.style.display = "none";
    barsMenu.classList.replace("fa-times", "fa-bars");
    mobileHeader.style.backgroundColor = "white";
    barsMenu.style.color = "black";
    mobileHeader.style.position = "relative";
  }
});

const checkIfLoggedIn = async () => {
  let userDisplay = document.getElementById("userDisplay");
  let data = await makeRequest("/live", "GET");
  if (data) {
    if (data.admin) {
      userDisplay.innerText = "Adminpanel";
      logoutDiv.innerHTML = "";
    } else {
      userDisplay.innerText = "Welcome " + data.user;
      logoutDiv.innerHTML = "";
    }
    mobileLogin.innerText = "Logout";
    let logoutButton = document.createElement("button");
    logoutButton.innerText = "Logout";
    logoutDiv.append(logoutButton);
    logoutButton.addEventListener("click", async () => {
      let response = await makeRequest("/logout", "DELETE");
      checkIfLoggedIn();
      checkMyAccount();
    });
  } else {
    mobileLogin.innerText = "Login";
    logoutDiv.innerHTML = " ";
    let loginButton = document.createElement("a");
    loginButton.innerText = "Login";
    loginButton.href = "login.html";
    userDisplay.innerText = "Welcome to Chronoscape";
    logoutDiv.append(loginButton);
  }
};

//Connect to backend with fetch
const makeRequest = async (url, requestMethod, body) => {
  try {
    const response = await fetch(url, {
      method: requestMethod,
      body,
    });
    return response.json();
  } catch (err) {
    console.error(err);
  }
};
