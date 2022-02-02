const checkMyAccount = async () => {
  let data = await makeRequest("/live", "GET");
  if (!data) {
    location.replace("http://localhost:3000/login.html");
    return;
  }
  getOrders();
};

const getOrders = async () => {
  let getOrders = document.getElementById("getOrders");
  let response = await makeRequest("/orders", "GET");

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
