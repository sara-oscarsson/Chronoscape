const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const cookie = require("cookie-session");
const uuid = require("uuid");

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

//Get all users
app.get("/users", (req, res, next) => {
  try {
    //Send a query to SQL database and send the result back
    pool.query("SELECT * FROM `user`", (err, result, fields) => {
      if (err) {
        return console.log(err);
      }
      res.send(result);
    });
  } catch (err) {
    next(err);
  }
});

//Create a new user
app.post("/createUser", async (req, res, next) => {
  if (req.session.id) {
    return res.json({ login: false, message: "You are already logged in" });
  }
  const hashedPwd = await bcrypt.hash(req.body.pwd, 10);
  try {
    //Check if username already exists
    pool.query("SELECT * FROM `user`", async (err, result, fields) => {
      if (err) {
        return console.log(err);
      }
      let UsernameTaken = result.find((user) => {
        return user.userName === req.body.username;
      });
      if (UsernameTaken) {
        return res.json({ login: false, message: "Username is already taken" });
      } else {
        // Create a stripe customer
        const customer = await stripe.customers.create({
          name: req.body.username,
        });
        //Create a new user with admin false
        pool.query(
          `INSERT INTO user (userId, userName, password, admin) VALUES ('${customer.id}', '${req.body.username}', '${hashedPwd}', 0)`,
          (err, result, fields) => {
            if (err) {
              return console.log("FEL:" + err);
            }
            res.send({
              login: true,
              message: "You successfully created an account, login to travel!",
            });
          }
        );
      }
    });
  } catch (err) {
    next(err);
  }
});

//Login
app.post("/login", (req, res, next) => {
  try {
    pool.query(
      `SELECT * FROM user WHERE userName = "${req.body.username}";`,
      async (err, result, fields) => {
        if (err) {
          return console.log("FEL: " + err);
        }
        if (result.length === 0) {
          return res.json({
            login: false,
            message: "Wrong username or password",
          });
        }

        if (await bcrypt.compare(req.body.pwd, result[0].password)) {
          if (req.session.id) {
            return res.json({
              login: false,
              message: "You are already logged in",
            });
          }

          // Create cookie-session
          req.session.id = uuid.v4();
          req.session.username = req.body.username;
          req.session.loginDate = new Date().toLocaleString();
          req.session.userID = result[0].userId;
          req.session.admin = result[0].admin;

          console.log(req.session);
          if (result[0].admin) {
            console.log("JA DU ÄR ADMIN");
            return res.send({
              login: true,
              name: req.body.username,
              admin: true,
            });
          }
          return res.send({
            login: true,
            name: req.body.username,
            admin: false,
          });
        } else {
          return res.json("Wrong password!");
        }
      }
    );
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
    pool.query("SELECT * FROM `orders`", (err, result, fields) => {
      if (err) {
        return console.log(err);
      }
      res.send(result);
    });
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
app.post("/verify", async (req, res) => {
  // Session id is sent in req.body
  const sessionID = req.body.sessionID;

  // We collect info about the session from stripe
  const paymentInfo = await stripe.checkout.sessions.retrieve(sessionID);
  // Check if order is paid
  if (paymentInfo.payment_status === "paid") {
    pool.query(
      `INSERT INTO orders (orderId, userId, orderDate, totalPrice, orderedProducts) VALUES ('${paymentInfo.id}', '${req.session.userID}', '${paymentInfo.metadata.date}', '${paymentInfo.amount_total}', '${paymentInfo.metadata.name}')`,
      async (err, result, fields) => {
        if (err) {
          return console.log("FEL: " + err);
        }
        res.json("bra gick det");
      }
    );
  }
});

//Cancel trip
app.delete("/cancelTrip", async (req, res) => {});

//Endpoints for products

//Get all products
app.get("/products", async (req, res, next) => {
  try {
    pool.query("SELECT * FROM `product`", (err, result, fields) => {
      if (err) {
        return console.log(err);
      }
      res.json(result);
    });
  } catch (err) {
    next(err);
  }
});

//Create new product
app.post("/createProduct", async (req, res, next) => {
  console.log(req.body.product)
  try {
    pool.query(
      `INSERT INTO product (productId, productName, productDescription, productPrice, imageSrc) VALUES (NULL, '${req.body.productName}', '${req.body.productDescription}', '${req.body.productPrice}', '${req.body.imageSrc}');`,
      (err, result, fields) => {
        if (err) {
          return console.log(err);
        }
        res.send(true);
      }
    );
  } catch (err) {
    next(err);
  }
});

//Update product
app.put("/updateProduct", (req, res) => {
  pool.query(
    `UPDATE product SET productName = '${req.body.productName}', productDescription = '${req.body.productDescription}', productPrice = '${req.body.productPrice}', imageSrc = '${req.body.imageSrc}' WHERE product.productId = ${req.body.Id};`,
    (err, result, fields) => {
      if (err) {
        return console.log(err);
      }
      res.send(result);
    }
  );
});

//Delete product
app.delete("/deleteProduct", (req, res, next) => {
  try {
    pool.query(
      `DELETE FROM product WHERE product.productId = ${req.body.Id}`,
      (err, result, fields) => {
        if (err) {
          return console.log(err);
        }
        res.send(result);
      }
    );
  } catch (err) {
    next(err);
  }
});

//Error handling
app.use((req, res, err) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong...");
});

//Listen to port 3000
app.listen(3000, () => {
  console.log("listening to port 3000...");
});
