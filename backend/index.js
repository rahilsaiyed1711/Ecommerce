const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");
const { log } = require("console");
const port = process.env.PORT || 4000;
app.use(express.json());
app.use(cors());

// DB connection with MongoDB 
mongoose.connect("mongodb+srv://rahilsaiyed1711:k9fidyxTiQb0aCSK@cluster0.8lpp2.mongodb.net/ecommerce");

// API creations
app.get("/", (req, res) => {
    res.send("Express app is running");
});

// Image Storage Engine 
const storage = multer.diskStorage({
    destination: './upload/images',  // Make sure this folder exists
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Serve static files for images
app.use("/images", express.static('upload/images'));

// Set the base URL depending on the environment
const baseUrl = req.hostname === 'localhost' 
  ? `http://localhost:${port}` 
  : 'https://ecommerce-backend-38z9.onrender.com';

// Upload endpoint for images
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `${baseUrl}/images/${req.file.filename}`
    });
});

// Product schema
const Product = mongoose.model("Product", {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now() },
    available: { type: Boolean, default: true },
});

// Add product API
app.post("/addproduct", async (req, res) => {
    let products = await Product.find({});
    try {
        let id;
        if (products.length > 0) {
            let last_product = products[products.length - 1];
            id = last_product.id + 1;
        } else {
            id = 1;
        }
        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });
        await product.save();
        res.json({ success: true, name: req.body.name });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Failed to add product" });
    }
});

// Delete product API
app.post("/removeproduct", async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true, name: req.body.name });
});

// Get all products API
app.get("/allproducts", async (req, res) => {
    let products = await Product.find({});
    res.send(products);
});

// User schema
const Users = mongoose.model('User', {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object },
    date: { type: Date, default: Date.now }
});

// Signup API
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "User already exists" });
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart
    });
    await user.save();

    const data = { user: { id: user.id } };
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token });
});

// Login API
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = { user: { id: user.id } };
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        } else {
            res.json({ success: false, errors: "Incorrect Password" });
        }
    } else {
        res.json({ success: false, errors: "Incorrect Email Id" });
    }
});

// Fetch new collection data
app.get('/newcollection', async (req, res) => {
    let products = await Product.find({});
    let newcollections = products.slice(1).slice(-8);
    res.send(newcollections);
});

// Fetch popular in women section
app.get('/popinwom', async (req, res) => {
    let products = await Product.find({ category: "women" });
    let pop_in_wom = products.slice(0, 4);
    res.send(pop_in_wom);
});

// Middleware to fetch user and render cart data accordingly
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "Please authenticate using valid credentials" });
    } else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            return res.status(401).json({ errors: "Authenticate using a valid token" });
        }
    }
};

// Add product to cart
app.post('/addtocart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Added");
});

// Remove product from cart
app.post('/removefromcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.send("Removed");
    }
});

// Retrieve cart data when logging in again
app.post('/getcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
});

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("Listening on port " + port);
});
