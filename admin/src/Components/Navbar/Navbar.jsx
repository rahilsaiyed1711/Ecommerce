import React from 'react'
import './Navbar.css'
import navLogo from '../../assets/nav-logo.svg'
import navProfile from '../../assets/nav-profile.svg'
const Navbar = () => {
    return (
        <div className='navbar'>
            <img src={navLogo} alt className='navlogo' />
            <img src={navProfile} alt='' className='navlogo' />
        </div>
    )
}

export default Navbar;