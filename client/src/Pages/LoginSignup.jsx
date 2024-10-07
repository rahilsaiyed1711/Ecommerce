import React, { useState } from 'react'
import './CSS/LoginSignup.css'
const LoginSignUp = () => {

  const [state, setState] = useState('Login');
  const [formData, setFormData] = useState({
    username:"",
    password:"",
    email:""
  });
    
  const changeHandler=(e)=>{
      setFormData({...formData,[e.target.name]:e.target.value})
  }

  const login = async()=>{
    console.log("login function execured" , formData);
    let responseData;
    await fetch('http://localhost:4000/login',{
      method: 'POST',
      headers:{
        Accept: 'application/form-data',
        'Content-Type':'application/json'
      },
      body: JSON.stringify(formData)
    }).then((res)=>res.json()).then((data)=>responseData = data);
    if (responseData.success) {
      localStorage.setItem('auth-token',responseData.token);
      window.location.replace('/');
    }else{
      alert(responseData.errors)
    }
  }
  const signup = async()=>{
    console.log("signup function execured",formData);
    let responseData;
    await fetch('http://localhost:4000/signup',{
      method: 'POST',
      headers:{
        Accept: 'application/form-data',
        'Content-Type':'application/json'
      },
      body: JSON.stringify(formData)
    }).then((res)=>res.json()).then((data)=>responseData = data);
    if (responseData.success) {
      localStorage.setItem('auth-token',responseData.token);
      window.location.replace('/');
    }else{
      alert(responseData.errors)
    }
    
  }
  return (
    <div className='logInSignUp'>
      <div className="logInSignUp-container">
        <h1>{state}</h1>
        <div className="logInSignUp-fields">
          {state === "Sign Up" ? <input type="text" name='username' value={formData.username} onChange={changeHandler} placeholder='Your Name' /> : <></>}
          <input name='email' value={formData.email} onChange={changeHandler} type="email" placeholder='Email Address' />
          <input name='password' value={formData.password} onChange={changeHandler} type="password" placeholder='Password' />
        </div>
        <button onClick={()=>{state === 'Login'? login() : signup()}}>Continue</button>
        {state === "Sign Up" ? <p className='logInSignUp-login'>Already have an account? <span onClick={()=>{setState("Login")}}>LogIn Here</span></p>
          : <p className='logInSignUp-login'>
            Create An Account <span onClick={()=>{setState("Sign Up")}}>Click Here</span>
          </p>}


        <div className="logInSignUp-agree">
          <input type="checkbox" name='' id='' />
          <p>By continuing, I agree to the terms of use & privacy policy. </p>
        </div>
      </div>
    </div>
  )
}

export default LoginSignUp
