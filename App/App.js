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
    maxAge: 1000 * 60,
    sameSite: "strict",
    httpOnly: true,
    secure: false,
  })
);

//Endpoints for user

//Get all users
app.get("/users", (req, res) => {
  //Send a query to SQL database and send the result back
  pool.query("SELECT * FROM `user`", (err, result, fields) => {
    if (err) {
      return console.log(err);
    }
    res.send(result);
  });
});

//Create a new user
app.post("/createUser", async (req, res, next) => {
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
        return res.json("Username is already taken");
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
            res.send(result);
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
          return res.send("User does not exist");
        }

        if (await bcrypt.compare(req.body.pwd, result[0].password)) {
          if (req.session.id) {
            return res.json("You are already logged in");
          }

          // Create cookie-session
          req.session.id = uuid.v4();
          req.session.username = req.body.username;
          req.session.loginDate = new Date().toLocaleString();
          req.session.userID = result[0].userId;
          console.log(req.session);
          return res.json({ login: true, name: req.body.username });
        } else {
          return res.send("Wrong password!");
        }
      }
    );
  } catch (err) {
    next(err);
  }
});

//Log out
app.delete("/logout", (req, res, next) => {
  req.session = null;
  res.json("You are now logged out!");
});

//Endpoints for order and payment

//Get all orders
app.get("/orders", async (req, res, next) => {
  try {
    pool.query("SELECT * FROM `order`", (err, result, fields) => {
      if (err) {
        return console.log(err);
      }
      res.send(result);
    });
  } catch (err) {
    next(err)
  }
});

//Payment
app.post("/payment", async (req, res) => {});

//Create order
app.post("/verify", async (req, res) => {});

//Cancel trip
app.delete("/cancelTrip", async (req, res) => {});

//Endpoints for products

//Get all products
app.get("/products", async (req, res) => {
  pool.query("SELECT * FROM `product`", (err, result, fields) => {
    if (err) {
      return console.log(err);
    }
    res.send(result);
  });
});

//Create new product
app.post("/createProduct", async (req, res) => {
  /* INSERT INTO `product` (`productId`, `productName`, `productDescription`, `productPrice`) VALUES (NULL, 'prodotto di ossiano', 'product of italy', '1'); */

  pool.query(
    `INSERT INTO product (productId, productName, productDescription, productPrice) VALUES (NULL, '${req.body.productName}', '${req.body.productDescription}', '${req.body.productPrice}');`,
    (err, result, fields) => {
      if (err) {
        return console.log(err);
      }
      res.send(result);
    }
  );
});
//Update product
app.put("/updateProduct", (req, res) => {
  pool.query(
    `UPDATE product SET productName = '${req.body.productName}', productDescription = '${req.body.productDescription}', productPrice = '${req.body.productPrice}' WHERE product.productId = ${req.body.Id};`,
    (err, result, fields) => {
      if (err) {
        return console.log(err);
      }
      res.send(result);
    }
  );
});

//Delete product
app.delete("/deleteProduct", (req, res) => {
  pool.query(
    `DELETE FROM product WHERE product.productId = ${req.body.Id}`,
    (err, result, fields) => {
      if (err) {
        return console.log(err);
      }
      res.send(result);
    }
  );
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
