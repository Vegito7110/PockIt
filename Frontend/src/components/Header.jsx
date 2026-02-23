import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import icon from '../assets/profile-icon.png';
import Profile from './Profile';
import { auth } from '../firebase.js';
// import bell from './assets/bell 1.png'

function Header({income, expense, displayName}) {
    const navigate2= useNavigate();
    const [showProfile, setShowProfile] = useState(false);
    const user = auth.currentUser;
    const balance = income - expense;
    
    // Note: The Dashboard button was correctly removed in the previous step
    
  return (
    <div>
        <div className='bg-gradient-to-b from-card via-greenCustom to-bgCustom flex flex-col w-full h-[30rem] md:h-[35rem] px-4 py-8 md:px-10 md:py-20'>

            <div className='flex items-center justify-between'>
                <div className='flex flex-col'> {/* Ensure name and greeting stack correctly */}
                <p className='text-customLightText text-lg font-medium font-inter p-0.5'>Hello,</p>
                <p className=' text-customLightText text-3xl md:text-4xl font-semibold font-inter p-0.5'>{displayName || 'User'}</p>
                </div>
                
                <button 
                    className='bg-transparent focus:outline-none focus:ring-2 focus:ring-white rounded-full' 
                    onClick={() => setShowProfile(true)}
                >
                    <img src={icon} className='w-10 h-10 rounded-full' alt="Profile Icon" />
                </button>
                {showProfile && <Profile onCloseProfile={()=> setShowProfile(false)}/>}
            </div>
            
            {/* Main Balance Card */}
            <div className='bg-card h-[14rem] md:h-[16rem] mt-10 md:mt-16 border border-none rounded-3xl shadow-xl p-4 md:p-6'>
                <div className='text-customLightText font-inter'>
                    <p className='text-base font-semibold p-1'>Total Balance</p>
                    <p className='text-3xl md:text-4xl font-bold p-0.5'>₹{balance}</p>
                </div>

                <div className='flex items-center justify-between px-2 py-4 md:px-6 md:py-5 mt-4 font-inter'>
                    <div className='flex flex-col items-start'>
                        <p className='font-medium p-1'>Income</p>
                        <p className='font-semibold text-lg md:text-xl p-1 text-green-300'>₹{income}</p>
                    </div>

                    <div className='flex flex-col items-end'>
                        <p className='font-medium p-1'>Expenditure</p>
                        <p className='font-semibold text-lg md:text-xl p-1 text-red-300'>₹{expense}</p>
                    </div>
                </div>

            </div>
        </div>
        
    </div>
  )
}

export default Header