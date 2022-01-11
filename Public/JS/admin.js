window.addEventListener("load", () => {
  authenticationCheck();
});

let listProducts = document.getElementById("listProducts");

const authenticationCheck = async () => {
  let data = await makeRequest("/live", "GET");
  if (!data.admin) {
    location.replace("http://localhost:3000/");
    return;
  }
  getListOfProducts();
};

const getListOfProducts = async () => {
  let response = await makeRequest("/products", "GET");
  console.log(response);
  response.forEach((product) => {
    //Create a wrapper for every product
    let productWrapper = document.createElement("div");
    productWrapper.classList.add("adminProductWrapper");

    //Create a title
    let productTitle = document.createElement("h3");
    productTitle.classList.add("adminProductTitle");
    productTitle.innerText = product.productName;

    //Create an image
    let productImage = document.createElement("img");
    productImage.src = "./productImages/" + product.imageSrc;
    productImage.style.width = "25%";

    //Create a price
    let productPrice = document.createElement("p");
    productPrice.classList.add("adminProductPrice");
    productPrice.innerText = product.productPrice + ":-";

    //Create a description
    let productDescription = document.createElement("p");
    productDescription.classList.add("adminProductDescription");
    productDescription.innerText = product.productDescription;

    //Create a add to cart button
    let deleteButton = document.createElement("button");
    deleteButton.classList.add("deleteButton");
    deleteButton.innerText = "Delete this trip";
    deleteButton.addEventListener("click", () => {
      console.log("delete " + product.productName);
    });

    productWrapper.append(
      productTitle,
      productImage,
      productPrice,
      productDescription,
      deleteButton
    );
    listProducts.append(productWrapper);
  });
};

let createButton = document.getElementById("createBtn");
createButton.addEventListener("click", async () => {
  let productName = document.getElementById("1");
  let productDescription = document.getElementById("2");
  let productPrice = document.getElementById("3");
  let imageSrc = document.getElementById("4").value;
  imageSrc = imageSrc.replace(/.*[\/\\]/, "");

  let product = {
    productName: productName.value,
    productDescription: productDescription.value,
    productPrice: productPrice.value,
    imageSrc: imageSrc,
  };

  let data = await fetch("/createProduct", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(product),
  })
    .then((result) => {
      return result.json();
    })
    .then((answer) => {
      if (answer) {
        alert("You've successfully created a product");
        productName.value = "";
        productDescription.value = "";
        productPrice.value = "";
        imageSrc = "";
      }
      console.log(answer);
    })
    .catch((err) => console.error(err));
});
