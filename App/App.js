const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const cookie = require("cookie-session");
const uuid = require("uuid");
const port = process.env.PORT || 3000;
const fs = require("fs");

//Middleware that can be used to upload files
const multer = require("multer");

//So image isn't saved in this folder
const filePath = __dirname.replace("App", "");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, filePath + "public/productImages");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const env = require("dotenv").config(".env");

//Show index.html in public folder
app.use(express.static("public"));
//Use json
app.use(express.json());

// Collect secret api key from .env file
const secretKey = process.env.STRIPE_SECRET_KEY;
// Connects key to stripe
const stripe = require("stripe")(secretKey);

//Create a connection to database
const { createPool } = require("mysql");
const pool = createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "chronoscape",
  multipleStatements: true,
});

// Creates cookie session
app.use(
  cookie({
    secret: "kjfbdgfjdbgjdfbgdfgbnfdng!1",
    maxAge: 1000 * 60000,
    sameSite: "strict",
    httpOnly: true,
    secure: false,
  })
);

//Endpoints for user

//Create a new user
app.post("/createUser", async (req, res, next) => {
  if (req.session.id) {
    return res.json({ login: false, message: "You are already logged in" });
  }
  try {
    //Hash password
    const hashedPwd = await bcrypt.hash(req.body.pwd, 10);

    //Check if username already exists
    const rawList = fs.readFileSync(__dirname + "/user.json");
    const list = JSON.parse(rawList);
    let userExist = list.find((user) => {
      return user.userName === req.body.username;
    });
    if (userExist) {
      // Don't run code if userExist is true
      return res.json({ login: false, message: "Username is already taken" });
    } else {
      // Create a stripe customer
      const customer = await stripe.customers.create({
        name: req.body.username,
      });

      /* Save customerid here in object */
      let newUser = {
        userId: customer.id,
        userName: req.body.username,
        password: hashedPwd,
        admin: 0,
      };
      list.push(newUser);
      fs.writeFileSync(__dirname + "/user.json", JSON.stringify(list));

      return res.send({
        login: true,
        message: "You successfully created an account, login to travel!",
      });
    }
  } catch (err) {
    next(err);
  }
});

//Login
app.post("/login", async (req, res, next) => {
  if (req.session.id) {
    return res.json("You are already logged in");
  }
  try {
    let unparsedUserList = fs.readFileSync(__dirname + "/user.json");
    let userList = JSON.parse(unparsedUserList);
    let userExist = userList.find((user) => {
      return user.userName === req.body.username;
    });
    if (
      !userExist ||
      !(await bcrypt.compare(req.body.pwd, userExist.password))
    ) {
      // Don't run code if userExist is true
      return res.json({
        login: false,
        message: "Wrong username or password",
      });
    } else {
      // Create cookie-session
      req.session.id = uuid.v4();
      req.session.username = req.body.username;
      req.session.loginDate = new Date().toLocaleString();
      req.session.userID = userExist.userId;
      req.session.admin = userExist.admin;

      if (userExist.admin) {
        return res.send({
          login: true,
          name: req.body.username,
          admin: true,
        });
      } else {
        return res.send({
          login: true,
          name: req.body.username,
          admin: false,
        });
      }
    }
  } catch (err) {
    next(err);
  }
});

//Check if cookie session is live
app.get("/live", (req, res, next) => {
  try {
    if (req.session.id) {
      res.json({ user: req.session.username, admin: req.session.admin });
    } else {
      res.json(false);
    }
  } catch (err) {
    next(err);
  }
});

//Log out
app.delete("/logout", (req, res, next) => {
  try {
    req.session = null;
    res.json("You are now logged out!");
  } catch (err) {
    next(err);
  }
});

//Endpoints for order and payment

//Get all orders
app.get("/orders", async (req, res, next) => {
  try {
    if (!req.session.id) {
      return res.json("Unauthorized");
    }
    let userID = req.session.userID;
    let unParsedOrderlist = fs.readFileSync(__dirname + "/order.json");
    let orderList = JSON.parse(unParsedOrderlist);
    const result = orderList.filter((order) => order.userId === userID);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

//Payment
app.post("/payment", async (req, res, next) => {
  try {
    let lineItem = {
      description: req.body.productDescription,
      price_data: {
        currency: "sek",
        product_data: {
          name: req.body.productName,
        },
        unit_amount: req.body.productPrice * 100,
      },
      quantity: 1,
    };
    // Save body in variable
    let boughtTrips = [];
    boughtTrips.push(lineItem);

    // Save time and date for order
    let orderDate = new Date().toLocaleString();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: boughtTrips,
      mode: "payment",
      customer: req.session.userID,
      metadata: {
        date: orderDate,
        name: req.body.productName,
      },
      success_url: `http://localhost:3000/success.html`,
      cancel_url: "https://localhost:3000/declined.html",
    });
    res.status(200).json({ id: session.id });
  } catch (err) {
    next(err);
  }
});

//Create order
app.post("/verify", async (req, res, next) => {
  try {
    // Session id is sent in req.body
    const sessionID = req.body.sessionID;

    // We collect info about the session from stripe
    const paymentInfo = await stripe.checkout.sessions.retrieve(sessionID);
    // Check if order is paid
    if (paymentInfo.payment_status === "paid") {
      // Create an object containing order info to save in json-file
      let order = {
        orderId: paymentInfo.id,
        userId: req.session.userID,
        orderDate: paymentInfo.metadata.date,
        totalPrice: paymentInfo.amount_total,
        orderedProducts: paymentInfo.metadata.name,
      };
      // Get list of verified orders and parse it
      let unParsedOrderlist = fs.readFileSync(__dirname + "/order.json");
      let orderList = JSON.parse(unParsedOrderlist);

      // Check if order already exists
      let alreadyExist = orderList.find((orderItem) => {
        return orderItem.orderId === order.orderId;
      });
      if (alreadyExist) {
        // Don't run code if alreadyExists is true
        return res.json("Order already exists");
      }
      // Save new order in json-file
      orderList.push(order);
      fs.writeFileSync(__dirname + "/order.json", JSON.stringify(orderList));
      return res.json(true);
    }
  } catch (err) {
    next(err);
  }
});

//Endpoints for products

//Get all products
app.get("/products", async (req, res, next) => {
  try {
    const rawProductList = fs.readFileSync(__dirname + "/product.json");
    const productList = JSON.parse(rawProductList);

    return res.send(productList);
  } catch (err) {
    next(err);
  }
});

//Create new product
app.post("/createProduct", async (req, res, next) => {
  try {
    const unparsedProductList = fs.readFileSync(__dirname + "/product.json");
    const parsedProductList = JSON.parse(unparsedProductList);

    let product = {
      productId: uuid.v4(),
      productName: req.body.productName,
      productDescription: req.body.productDescription,
      productPrice: req.body.productPrice,
      imageSrc: req.body.imageSrc,
    };
    parsedProductList.push(product);
    fs.writeFileSync(
      __dirname + "/product.json",
      JSON.stringify(parsedProductList)
    );

    return res.send(true);
  } catch (err) {
    next(err);
  }
});

//Update product
app.put("/updateProduct", (req, res, next) => {
  try {
    let rawProductList = fs.readFileSync(__dirname + "/product.json");
    let parsedProductList = JSON.parse(rawProductList);

    for (let i = 0; i < parsedProductList.length; i++) {
      if (parsedProductList[i].productId === req.body.productId) {
        let updatedProduct = {
          productId: parsedProductList[i].productId,
          productName: req.body.productName,
          productDescription: req.body.productDescription,
          productPrice: req.body.productPrice,
          imageSrc: req.body.imageSrc,
        };
        parsedProductList.splice(i, 1);

        parsedProductList.push(updatedProduct);
        fs.writeFileSync(
          __dirname + "/product.json",
          JSON.stringify(parsedProductList)
        );
        return res.send(true);
      }
    }
    return res.send(false);
  } catch (err) {
    next(err);
  }
});

//Delete product
app.delete("/deleteProduct", (req, res, next) => {
  console.log(req.body.id);
  try {
    let rawProductList = fs.readFileSync(__dirname + "/product.json");
    let parsedProductList = JSON.parse(rawProductList);

    for (let i = 0; i < parsedProductList.length; i++) {
      if (parsedProductList[i].productId === req.body.id) {
        parsedProductList.splice(i, 1);

        fs.writeFileSync(
          __dirname + "/product.json",
          JSON.stringify(parsedProductList)
        );
        return res.send(true);
      }
    }
    return res.send(false);
  } catch (err) {
    next(err);
  }
});

//Upload image to folder
app.post("/upload", upload.single("image"), (req, res, next) => {
  try {
    res.send(true);
  } catch (err) {
    next(err);
  }
});

//Error handling
app.use((req, res, next) => {
  console.log(port);
  next();
});

//Listen to port 3000
app.listen(port, () => {
  console.log("server listening to " + port);
});
