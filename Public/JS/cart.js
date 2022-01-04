window.addEventListener("load", () => {
  showTrip();
});

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
