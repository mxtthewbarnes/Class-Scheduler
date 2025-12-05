

import React from "react"; 
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {useForm} from 'react-hook-form'
import app from "../firebase";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import {Link} from "react-router-dom";
import "./Login.css"; 
import logo from "../assets/photos/class-logo.png"; 
import {provider} from "../firebase"; 				//google authentication stuff
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";  

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const auth = getAuth(app); 




function Login() {
	const {
		//hooks from react-hook-form library below

		register, //connects input fields.
		handleSubmit, //wraps onSubmit so validation runs first
		formState: {errors} //holds validation error msg's
	} = useForm(); 
	const navigate = useNavigate();



	


	//onSubmit runs when form is submitted successfuly. 
	const onSubmit =  async (data) =>{
		try{
			const userCredential = await signInWithEmailAndPassword(
				auth, 
				data.email,
				data.password
			);

			console.log("Logged in: ", userCredential.user.email); 
			
			toast.success("Login successful!", {
				position: "top-center",
				autoClose: 3000,
			  });
			
			//************ 
			//replace 'schedule' w/ 'dashboard' when dashbaord is compelte
			//************
			setTimeout(() => {
				navigate("/dashboard");
			  }, 3000);


			 

		} catch (error) {
			console.error("Login failed: ", error.message); 
		}
	};

	const handleGoogleSignIn = async () => {
		try {
		  const result = await signInWithPopup(auth, provider);
		  const user = result.user;
		  console.log("Logged in with Google:", user.email);
		  toast.success("Google Sign-In successful!", { position: "top-center", autoClose: 2000 });
		  
		  //************
		  //replace 'schedule' with 'dashboard' once dashbaord is initiated. 
		  //************
		  setTimeout(() => navigate("/schedule"), 3000);

		} catch (error) {
		  console.error("Google Sign-In failed:", error.message);
		  toast.error("Google Sign-In failed", { position: "top-center", autoClose: 3000 });
		}
	  };
	
	return (
		<div className="login-side">
			<div className="login-form">
			
			<div className="logo-image">
			<img src={logo} alt="logo" />
			<h3>class scheduler</h3>
			</div>
			<div className="login-box">
			<h2>Welcome back</h2>
			<p>Please enter your details</p>
			</div>
		<form onSubmit={handleSubmit(onSubmit)}>
		  <input
			type="email"
			placeholder="Email"
			{...register("email", { required: true })}
		  />
		  {errors.email && <span>Email is required!</span>}
	
		  <input
			type="password"
			placeholder="Password"
			{...register("password", { required: true })}
		  />
		  {errors.password && <span>Password is required!</span>}
	
		  <button type="submit">Login</button>
		 
		  <button type="button" onClick={handleGoogleSignIn} className="google-login1">
		  <FcGoogle size={20} style={{ marginRight: "0.1px" }} />
			Sign in with Google
		  </button>
		</form>

		<p>
			Don't have an account? <Link to="/register">Register here!</Link>
		</p>
		</div>

		<div className="login-page-image">
			<img src="landing5.png" alt="loginImage" />
		</div>
		<ToastContainer />
		</div>

	  );
	
}


export default Login;


//testing if branch is correct