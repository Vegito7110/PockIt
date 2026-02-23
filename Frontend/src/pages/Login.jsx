import React, {use, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth,formData.email,formData.password);
      alert("Login Successful!");
      navigate('/home');
    } catch(err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError("No user found with the email");
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  }

    return (
      <div className="w-full min-h-screen bg-bgCustom flex items-center justify-center p-4">
        <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-center text-customDarkText font-inter">Login</h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className='gap-6 mb-6'>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 font-inter">Email address</label>
            <input 
            type='email' 
            id='email' 
            name='email'
            value={formData.email}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-5"
            placeholder="john.doe@company.com"
            required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 font-inter">Password</label>
            <input 
            type='password' 
            id='password' 
            name='password'
            value={formData.password}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="•••••••••"
            required
            />
          </div>
          </div>
          <button 
          type="submit"
          className="text-white bg-greenCustom p-3 font-medium rounded-lg focus:outline-none text-center w-full text-md hover:bg-emerald-800 px-5 shadow-lg">Go to Home</button>
        </form>
      </div>
      
    )
  }
  
  export default Login
  