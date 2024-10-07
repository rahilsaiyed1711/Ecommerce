import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'
const AddProduct = () => {

    const [image, setImage] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
        category: "women",
        old_price: "",
        new_price: ""
    })
    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    }
    const imageHandler = (e) => {
        setImage(e.target.files[0]);

    }
    const Add_Product = async () => {
        console.log(productDetails);
        let responseData;
        let product = productDetails;
        let formData = new FormData();
        formData.append('product', image);
        await fetch('https://ecommerce-backend-38z9.onrender.com/upload', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
            body: formData,
        }).then((res) => res.json()).then((data) => responseData = data);
        if (responseData.success) {
            product.image = responseData.image_url;
            console.log(product)
            await fetch('https://ecommerce-backend-38z9.onrender.com/addproduct', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'content-type': 'application/json'
                },
                body: JSON.stringify(product),
            }).then((res)=>res.json()).then((data)=>{
                data.success?alert("Product added successfully"):alert("failed")
            })
        }
    }

    return (
        <div className='addproduct'>
            <div className='addproduct-itemfield'>
                <p>Product title</p>
                <input value={productDetails.name} onChange={changeHandler} type='text' name='name' placeholder='Type here' />
            </div>
            <div className='addproduct-price'>
                <div className='addproduct-itemfield'>
                    <p>Price</p>
                    <input type='text' value={productDetails.old_price} onChange={changeHandler} name='old_price' placeholder='Type here' />
                </div>
                <div className='addproduct-itemfield'>
                    <p>Offer Price</p>
                    <input type='text' value={productDetails.new_price} onChange={changeHandler} name='new_price' placeholder='Type here' />
                </div>
            </div>
            <div className='addproduct-itemfield'>
                <p>Product Category</p>
                <select name='category' value={productDetails.category} onChange={changeHandler} className='add-product-selector'>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kid">Kids</option>
                </select>
            </div>
            <div className='addproduct-thumb-img'>
                <label htmlFor='file-input'>
                    <img src={image ? URL.createObjectURL(image) : upload_area} style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }} />
                </label>
                <input onChange={imageHandler} type='file' name='image' id='file-input' hidden />
            </div>
            <button onClick={() => { Add_Product() }} className='addproduct-btn'>ADD</button>
        </div>
    )
}

export default AddProduct
