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

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

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