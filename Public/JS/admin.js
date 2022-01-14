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
  listProducts.innerHTML = "";
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

    //Create a button to update product

    let updateButton = document.createElement("button");
    updateButton.innerText = "Update product";
    updateButton.classList.add("updateButton");
    updateButton.addEventListener("click", async () => {
      updateProduct(product);
    });

    //Create a add to cart button
    let deleteButton = document.createElement("button");
    deleteButton.classList.add("deleteButton");
    deleteButton.innerText = "Delete this trip";
    deleteButton.addEventListener("click", async () => {
      console.log(product.productId);
      let productToDelete = {
        id: product.productId,
      };

      let response = await fetch("/deleteProduct", {
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
        body: JSON.stringify(productToDelete),
      })
        .then((result) => {
          return result.json();
        })
        .then((answer) => {
          if (answer) {
            alert("You've successfully deleted a product");
            getListOfProducts();
          }
          console.log(answer);
        })
        .catch((err) => console.error(err));
      console.log("delete " + product.productName);
    });

    productWrapper.append(
      productTitle,
      productImage,
      productPrice,
      productDescription,
      updateButton,
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
      getListOfProducts();
      if (answer) {
        uploadImage();
      }
    })
    .catch((err) => console.error(err));
});

const uploadImage = async () => {
  let inputImageSrc = document.getElementById("4");

  var body = new FormData();
  body.append("image", inputImageSrc.files[0]);

  let data = await fetch("/upload", {
    method: "POST",
    body: body,
  })
    .then((response) => {
      return response.json();
    })
    .then((answer) => {
      if (answer) {
        console.log("Uploaded an image: " + answer);
      }
    })
    .catch((err) => console.error(err));
};

const updateProduct = async (product) => {
  //Create a modal
  let modal = document.createElement("div");
  modal.classList.add("modal");

  //Create a container
  let container = document.createElement("div");
  container.classList.add("containerUpdate");

  //Create inputfields with current information about product
  let titleInput = document.createElement("input");
  titleInput.value = product.productName;

  let descriptionInput = document.createElement("input");
  descriptionInput.value = product.productDescription;

  let priceInput = document.createElement("input");
  priceInput.value = product.productPrice;

  let saveBtn = document.createElement("button");
  saveBtn.innerText = "Save";
  saveBtn.addEventListener("click", async () => {
    let updatedProduct = {
      productName: titleInput.value,
      productDescription: descriptionInput.value,
      productPrice: priceInput.value,
      productId: product.productId,
      imageSrc: product.imageSrc,
    };

    //Update database
    let response = await fetch("/updateProduct", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(updatedProduct),
    })
      .then((response) => {
        return response.json();
      })
      .then((answer) => {
        console.log(answer);
        body.removeChild(modal);
        getListOfProducts();
      })
      .catch((err) => console.error(err));
  });

  //Append inputfields to container
  container.append(titleInput, descriptionInput, priceInput, saveBtn);

  //Append modal to body
  modal.append(container);
  let body = document.body;
  body.append(modal);

  //This function closes the window when you click outside the box
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};
