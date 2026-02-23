import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Transactions from '../components/Transactions';

import { auth } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

function HomePage() {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState('');

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    // This sets up a listener. It fires once on mount, and again any time
    // the user logs in or out.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // When the listener fires, it gives us the user object or null.
      setUser(currentUser);
      // Now we know the auth state, so we can stop loading.
      setIsLoading(false);
    });

    // This is a cleanup function. It will unsubscribe from the listener
    // when the component is unmounted, preventing memory leaks.
    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   if (auth.currentUser) {
  //     setUserId(auth.currentUser.uid);
  //     setDisplayName(auth.currentUser.displayName || 'User');
  //   }
  // },[]);

  const handleTotalsUpdate = ({income,expense}) => {
    setIncome(income);
    setExpense(expense);
  }
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-bgCustom">
        <p className="text-black text-xl">Loading...</p>
      </div>
    );
  }
  if (!user) {
    // You could also use `useNavigate` to redirect to the login page here.
    return (
      <div className="w-full h-screen flex items-center justify-center bg-bgCustom">
        <p className="text-white text-xl">Please log in to continue.</p>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen bg-bgCustom'>
        <Header income={income} expense={expense} displayName={user.displayName} />
        <Transactions userId={user.uid} onTotalsUpdate={handleTotalsUpdate} />
    </ div>
  )
}

export default HomePage