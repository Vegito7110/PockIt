import React from 'react'
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import icon from '../assets/close-icon.png';
import {auth} from '../firebase.js';
import { signOut } from 'firebase/auth'; // Import signOut function

function Profile({onCloseProfile}) {
    const user = auth.currentUser;
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // After successful sign out, close the modal and redirect to the root (login) page
            onCloseProfile();
            navigate('/'); 
        } catch (error) {
            console.error("Error signing out:", error);
            // Optionally, show a message to the user
            alert("Logout failed. Please try again.");
        }
    };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
        <div className="bg-white p-6 rounded-xl w-full max-w-sm md:max-w-md shadow-2xl text-customDarkText">
            <div className='flex justify-between items-center border-b pb-3 mb-4'>
                <h2 className='font-inter font-bold text-xl md:text-2xl'>User Profile</h2>
                <button className='bg-transparent focus:outline-none' onClick={onCloseProfile}>
                    {/* Using a simple X icon for better accessibility */}
                    <span className='text-gray-500 hover:text-gray-800 text-2xl'>&times;</span>
                </button>
            </div>
            
            <div className='mt-3 space-y-3'>
                <div>
                    <label className='font-semibold text-base md:text-lg text-gray-800'>Name:</label>
                    <p className='text-gray-600 font-medium p-1 border-b border-gray-300'>{user?.displayName || 'N/A'}</p>
                </div>
                <div>
                    <label className='font-semibold text-base md:text-lg text-gray-800'>Email:</label>
                    <p className='text-gray-600 font-medium p-1 border-b border-gray-300'>{user?.email || 'N/A'}</p>
                </div>
                
            </div>
            
            {/* --- Logout Button --- */}
            <div className='mt-8 pt-4 border-t border-gray-200'>
                <button
                    onClick={handleLogout}
                    className='w-full bg-red-500 text-white font-semibold py-2 rounded-lg shadow hover:bg-red-600 transition duration-200'
                >
                    Log Out
                </button>
            </div>
            
        </div>
    </div>
  )
}

export default Profile;