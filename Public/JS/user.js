window.addEventListener("load", () => {
  checkIfLoggedIn();
});

const checkMyAccount = async () => {
  let data = await makeRequest("/live", "GET");
  if (!data) {
    location.replace("http://localhost:3000/start.html");
    return;
  }
  getOrders();
};

const getOrders = async () => {
  let getOrders = document.getElementById("getOrders");

  let response = await makeRequest("/orders", "GET");
  console.log(response);

  if (response.length === 0) {
    getOrders.innerText = "You have no previous orders";
    return;
  }
  let table = document.createElement("table");
  let rubrikerna = document.createElement("tr");
  let headers = Object.keys(response[0]);
  headers.forEach((header) => {
    let headerElement = document.createElement("th");
    headerElement.innerText = header;
    rubrikerna.appendChild(headerElement);
  });
  table.appendChild(rubrikerna);
  response.forEach((order) => {
    let orderRow = document.createElement("tr");
    headers.forEach((header) => {
      let content = document.createElement("td");
      if (header === "totalPrice") {
        content.innerText = order[header] / 100 + " :-";
      } else {
        content.innerText = order[header];
      }
      orderRow.appendChild(content);
    });
    table.appendChild(orderRow);
  });
  getOrders.appendChild(table);
};

let logoutDiv = document.getElementById("logout");
let mobileLogin = document.getElementById("mobileLogin");

const mobileLoginFunction = async () => {
  if (mobileLogin.innerText === "Logout") {
    let response = await makeRequest("/logout", "DELETE");
    checkIfLoggedIn();
    checkMyAccount();
  } else {
    location.replace("http://localhost:3000/login.html");
  }
};

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
