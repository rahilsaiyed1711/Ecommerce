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


//db coonection with mongodb 
mongoose.connect("mongodb+srv://rahilsaiyed1711:k9fidyxTiQb0aCSK@cluster0.8lpp2.mongodb.net/ecommerce");

//Api creations
app.get("/", (req, res) => {
    res.send("express app is running");
});


//Image Storage Engine {yet to learn}
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => { return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`) }
});

const upload = multer({ storage: storage })
//creating upload endpoint for images   
app.use("/images", express.static('upload/images'))
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

//schema for creating schema

const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    new_price: {
        type: Number,
        required: true
    },
    old_price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    available: {
        type: Boolean,
        default: true
    },
});

app.post("/addproduct", async (req, res) => {
    let products = await Product.find({});
    try {
        let id;
        if (products.length > 0) {
            let last_product_array = products.slice(-1);
            last_product = last_product_array[0];
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
        console.log(product);
        await product.save();
        console.log("saved");
        res.json({
            success: true,
            name: req.body.name
        });
    } catch (err) {
        console.log(err);
    }
});

//creating api for deleting products
app.post("/removeproduct", async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("removed");
    res.json({
        success: true,
        name: req.body.name
    })

})

//creating APi for getting  all the products

app.get("/allproducts", async (req, res) => {
    let products = await Product.find({});
    console.log("all products fetched");
    res.send(products);

})

//schema creation for user model

const Users = mongoose.model('User', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now
    }
})


//creating endpoint for user regitration
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email })
    if (check) {
        return res.status(400).json({ success: false, errors: "user already exists" });
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
    })
    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token })

})


//creating endpoint for user login

app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token })
        } else {
            res.json({ success: false, errors: "Incorrect Password" })

        }

    } else {
        res.json({ success: false, errors: "Incorrect Email Id" })

    }
})


//creating endpoint for new collection data

app.get('/newcollection', async (req, res) => {
    let products = await Product.find({});
    let newcollections = products.slice(1).slice(-8);
    console.log("New Collection Fetched");
    res.send(newcollections)
})

//creating endpoint for popular in women section

app.get('/popinwom', async (req, res) => {
    let products = await Product.find({ category: "women" })
    let pop_in_wom = products.slice(0, 4);
    console.log("women collection fetched");
    res.send(pop_in_wom)
})
//craeting middleware to fetch user and reder the cart data accordingly
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "please authenticate using valid credentials" })
    } else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            return res.status(401).json({ errors: "authenticate using valid token" });
        }
    }
}

//creating endpoint for adding product in cart data
app.post('/addtocart', fetchUser, async (req, res) => {
    console.log("Added", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Added");
    console.log(req.body, req.user);


})

//creating endpoint for remove product from cart data
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("removed", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.send("remove");
    }

})

//creating endpoint for retriving cart data when logging In again

app.post('/getcart',fetchUser,async(req,res)=>{
    console.log("get cart")
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("listening on port " + port);
});


