window.addEventListener("load", () => {
  checkIfLoggedIn();
});

const checkMyAccount = async () => {
  let data = await makeRequest("/live", "GET");
  if (!data) {
    location.replace("http://localhost:3000/");
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
  response.forEach((signup) => {
    let signupRow = document.createElement("tr");
    headers.forEach((header) => {
      let content = document.createElement("td");
      content.innerText = signup[header];
      signupRow.appendChild(content);
    });
    table.appendChild(signupRow);
  });
  getOrders.appendChild(table);
};

let logoutDiv = document.getElementById("logout");

const checkIfLoggedIn = async () => {
  let userDisplay = document.getElementById("userDisplay");
  let data = await makeRequest("/live", "GET");
  if (data) {
    userDisplay.innerText = "Welcome " + data.user;
    logoutDiv.innerHTML = "";

    let logoutButton = document.createElement("button");
    logoutButton.innerText = "Logout";
    logoutDiv.append(logoutButton);
    logoutButton.addEventListener("click", async () => {
      let response = await makeRequest("/logout", "DELETE");
      checkIfLoggedIn();
      checkMyAccount();
    });
  } else {
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
