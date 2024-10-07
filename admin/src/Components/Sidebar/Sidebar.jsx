import React from 'react'
import { Link } from 'react-router-dom'
import './Sidebar.css'
import add_product_icon from '../../assets/Product_Cart.svg'
import list_product from '../../assets/Product_list_icon.svg'
const Sidebar = () => {
    return (
        <div className='sidebar'>
            <Link to={'/addproduct'} style={{ textDecoration: "none" }}>
                <div className='sidebar-icon'>
                    <img src={add_product_icon} className='' />
                    <p>Add Product</p>
                </div>
            </Link>
            <Link to={'/listproduct'} style={{ textDecoration: "none" }}>
                <div className='sidebar-icon'>
                    <img src={list_product} className='' />
                    <p>Product List</p>
                </div>
            </Link>
        </div>
    )
}

export default Sidebar