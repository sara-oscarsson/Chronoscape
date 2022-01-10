window.addEventListener("load", () => {
  showTrip();
  checkCart();
});

const checkCart = async () => {
  let paymentContainer = document.getElementById("paymentContainer");

  //Check if localstorage is empty
  let currentCart = localStorage.getItem("cart");
  if (currentCart === null) {
    return;
  }

  //Create a button that removes trip from cart and takes customer back to the startpage
  let removeBtn = document.createElement("button");
  removeBtn.innerText = "Change trip";
  removeBtn.classList.add("removeBtn");
  removeBtn.addEventListener("click", () => {
    localStorage.removeItem("cart");
    location.replace("http://localhost:3000");
  });

  //Check if customer is logged in, if true payment button appears
  let data = await makeRequest("/live", "GET");
  console.log(data);
  let payBtn = document.createElement("button");
  if (data) {
    payBtn.innerText = "Pay";
    payBtn.addEventListener("click", paymentWithStripe);
  } else {
    payBtn.innerText = "Login to travel";
    payBtn.disabled = true;
  }

  paymentContainer.append(removeBtn, payBtn);
};

const showTrip = () => {
  //Get container where products will be displayed
  let container = document.getElementById("tripContainer");
  let trip = localStorage.getItem("cart");

  if (trip === null) {
    container.innerText = "No trips chosen..";
    return;
  }
  trip = JSON.parse(trip);

  //Create a wrapper for every product
  let productWrapper = document.createElement("div");
  productWrapper.classList.add("productWrapper");

  //Create a title
  let productTitle = document.createElement("h3");
  productTitle.classList.add("productTitle");
  productTitle.innerText = trip.productName;

  //Create an image
  let productImage = document.createElement("img");
  productImage.src = "./productImages/" + trip.imageSrc;

  //Create a price
  let productPrice = document.createElement("p");
  productPrice.classList.add("productPrice");
  productPrice.innerText = trip.productPrice + ":-";

  //Create a description
  let productDescription = document.createElement("p");
  productDescription.classList.add("productDescription");
  productDescription.innerText = trip.productDescription;

  productWrapper.append(
    productTitle,
    productImage,
    productPrice,
    productDescription
  );
  container.append(productWrapper);
};

const paymentWithStripe = () => {
  console.log("%cMOOOOONEEEYY", "color: green; font-size: 30px;");
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
