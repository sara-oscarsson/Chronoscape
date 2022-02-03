window.addEventListener("load", () => {
  showTrip();
  checkCart();
});

//Connect to stripe with publishable key
let stripe = Stripe(
  "pk_test_51KDqsTCio34vZIfrWGRiv3voRqKxEDW0DBfjwglAjpIx7j57i8zbBDGBxbPF7NjlGnOtxOSNuUy3JYB5gd1tujI200Q9eLuoi3"
);

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
    location.replace("http://localhost:3000/start.html");
  });

  //Check if customer is logged in, if true payment button appears
  let data = await makeRequest("/live", "GET");
  console.log(data);
  let payBtn = document.createElement("button");
  if (data) {
    let containerTerms = document.createElement("div");
    let containerButtons = document.createElement("div");
    let shipping = document.createElement("div");
    shipping.innerHTML =
      "<h5>Once purchased you'll be contacted about a date that suits you</h5>";
    shipping.classList.add("shipping");
    payBtn.innerText = "Pay";
    payBtn.addEventListener("click", paymentWithStripe);
    let agreeCheckBox = document.createElement("input");
    agreeCheckBox.type = "checkbox";
    agreeCheckBox.id = "agreed";
    let terms = document.createElement("a");
    terms.href = "terms.html";
    terms.innerText =
      "I have read and agreed to the websites Terms & Conditions";
    containerTerms.append(agreeCheckBox, terms);
    containerButtons.append(removeBtn, payBtn);
    paymentContainer.append(shipping, containerTerms, containerButtons);
  } else {
    payBtn.innerText = "Login to travel";
    payBtn.disabled = true;
    paymentContainer.append(removeBtn, payBtn);
  }
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

  //Create a wrapper for product
  let productWrapper = document.createElement("div");
  productWrapper.classList.add("cartProductWrapper");

  //Create a title
  let productTitle = document.createElement("h3");
  productTitle.classList.add("cartProductTitle");
  productTitle.innerText =
    "Guess what? One step left and you're on the trip of your life, head on over to payment and we'll let you know when it's all done! DISCLAIMER: This is solely a school project, we do not sell timetravels.";

  //Create an image
  let productImage = document.createElement("img");
  productImage.src = "./productImages/" + trip.imageSrc;

  //Create a price
  let productPrice = document.createElement("p");
  productPrice.classList.add("cartProductPrice");
  productPrice.innerText = trip.productPrice + ":-";

  //Create a description
  let productDescription = document.createElement("p");
  productDescription.classList.add("cartProductDescription");
  productDescription.innerText = trip.productName;

  productWrapper.append(
    productTitle,
    productImage,
    productDescription,
    productPrice
  );
  container.append(productWrapper);
};

const paymentWithStripe = async () => {
  let agreed = document.getElementById("agreed");
  if (!agreed.checked) {
    alert(
      "You have to agree to the websites Terms and Conditions to purchase a trip"
    );
    return;
  }

  let currentCart = localStorage.getItem("cart");
  let response = await fetch("/payment", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: currentCart,
  })
    .then((result) => {
      return result.json();
    })
    .then((session) => {
      console.log(session);
      localStorage.setItem("sessionID", session.id);
      localStorage.removeItem("cart");
      return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .catch((err) => console.error(err));
  console.log("%cMOOOOONEEEYY", "color: green; font-size: 30px;");
};
