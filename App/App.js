const express = require('express');
const app = express();
const bcrypt = require('bcrypt');

//Show index.html in public folder
/* app.use(express.static('public')); */
//Use json
app.use(express.json());

const { createPool } = require('mysql');
const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chronoscape',
    multipleStatements: true
});

//Endpoints for user

//Get all users
app.get('/users', (req, res) => {
    //Send a query to SQL database and send the result back
    pool.query('SELECT * FROM `user`', (err, result, fields)=> {
        if(err){
            return console.log(err);
        }
        res.send(result);
    });
});

//Create a new user
app.post('/createUser', async (req, res, next) => {
    const hashedPwd = await bcrypt.hash(req.body.pwd, 10);
    try{
        //Check if username already exists
        pool.query('SELECT * FROM `user`', (err, result, fields) => {
            if (err) {
                return console.log(err);
            }
            let UsernameTaken = result.find(user => {
                return user.userName === req.body.username;
            });
            if (UsernameTaken) {
                return res.json('Username is already taken');          
            } else {
                //Create a new user with admin false
                pool.query(`INSERT INTO user (userId, userName, password, admin) VALUES (NULL, '${req.body.username}', '${hashedPwd}', 0)`,(err, result, fields) => {
                    if(err) {
                        return console.log('FEL:'+ err);
                    }
                    res.send(result);
                })  

            }          
        })
        
        
    } catch (err){
        next(err);       
    }

});

//Login
app.post('/login', (req, res, next) => {

});

//Log out
app.post('/logout', (req, res, next) => {

});

//Delete user
app.delete('/deleteUser', (req, res, next) => {

})


//Endpoints for order and payment

//Get all orders
app.get("/orders", async (req, res) => {
    
});

//Payment
app.post("/payment", async (req, res) => {
    
});

//Create order
app.post("/verify", async (req, res) => {

});

//Cancel trip
app.delete("/cancel", async (req, res) => {

});


//Endpoints for products

//Get all products
app.get("/products", async (req, res) => {
    
});

//Create new product
app.post("/createProduct", async (req, res) => {

});

//Update product
app.put('/updateProduct', (req, res) => {

});

//Delete product
app.delete('/deleteProduct', (req, res) => {

});




//Error handling
app.use((err, req, res)=> {
    console.error(err.stack);
    res.status(500).send('Something went wrong...');
})

//Listen to port 3000
app.listen(3000, () => {
    console.log('listening to port 3000...');
});