window.addEventListener("load", () => {
  getProducts();
});

const getProducts = async () => {
  let products = await makeRequest("/products", "GET");
  showProducts(products);
};

const showProducts = (products) => {
  //Get container where products will be displayed
  let container = document.getElementById("productContainer");

  products.forEach((product) => {
    //Create a wrapper for every product
    let productWrapper = document.createElement("div");
    productWrapper.classList.add("productWrapper");

    //Create a title
    let productTitle = document.createElement("h3");
    productTitle.classList.add("productTitle");
    productTitle.innerText = product.productName;

    //Create an image
    let productImage = document.createElement("img");
    productImage.src = "./productImages/" + product.imageSrc;

    //Create a price
    let productPrice = document.createElement("p");
    productPrice.classList.add("productPrice");
    productPrice.innerText = product.productPrice + ":-";

    //Create a description
    let productDescription = document.createElement("p");
    productDescription.classList.add("productDescription");
    productDescription.innerText = product.productDescription;

    //Create a add to cart button
    let buyBtn = document.createElement("button");
    buyBtn.classList.add("buyBtn");
    buyBtn.innerText = "Book this trip";
    buyBtn.addEventListener("click", () => {
      let tripToBook = {
        productID: product.productId,
        productName: product.productName,
        productPrice: product.productPrice,
        productDescription: product.productDescription,
        imageSrc: product.imageSrc,
      };
      localStorage.removeItem("cart");
      localStorage.setItem("cart", JSON.stringify(tripToBook));
      location.replace("http://localhost:3000/cart.html");
    });

    productWrapper.append(
      productTitle,
      productImage,
      productPrice,
      productDescription,
      buyBtn
    );
    container.append(productWrapper);
  });
};

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
