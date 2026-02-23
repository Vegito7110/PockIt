import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import AddTransaction from './AddTransaction';
import apiClient from '../axios/api.jsx'; 

function Transactions({ userId, onTotalsUpdate }) {
  const navigate = useNavigate(); // Initialize navigate hook
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // --- NEW FILTER STATES ---
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'income', 'expense'
  const [timeFilter, setTimeFilter] = useState('allTime'); // 'allTime', 'yearly', 'monthly', 'daily_7'

  // 1. Fetch all transactions from the backend
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await apiClient.get('/transactions');
      // Safety check to prevent .map crashes
      const data = response.data;
      setTransactions(Array.isArray(data) ? data : (data?.data || [])); 
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  }, []);

  // 2. Fetch data when the component loads (or userId changes)
  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId, fetchTransactions]);

  // 3. Update totals (Calculates totals based on ALL fetched transactions, not the filtered list)
  useEffect(() => {
    const safeList = Array.isArray(transactions) ? transactions : [];

    const income = safeList
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    const expense = safeList
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      
    onTotalsUpdate({ income, expense });
  }, [transactions, onTotalsUpdate]);

  // --- 4. Filtering Logic ---
  const filteredTransactions = useMemo(() => {
    let list = Array.isArray(transactions) ? transactions : [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Filter by Time Period
    switch (timeFilter) {
      case 'daily_7':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);
        list = list.filter(tx => new Date(tx.date) >= sevenDaysAgo);
        break;
      case 'monthly':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        list = list.filter(tx => new Date(tx.date) >= startOfMonth);
        break;
      case 'yearly':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        list = list.filter(tx => new Date(tx.date) >= startOfYear);
        break;
      case 'allTime':
      default:
        // No filtering needed
        break;
    }

    // Filter by Transaction Type
    if (typeFilter !== 'all') {
      list = list.filter(tx => tx.type === typeFilter);
    }

    return list;
  }, [transactions, typeFilter, timeFilter]);


  // 5. Add a new transaction
  const addTransaction = async (newTx) => {
    try {
      await apiClient.post('/transactions', newTx);
      fetchTransactions();
      setShowModal(false);
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };

  // 6. Delete a transaction (Removed window.confirm)
  const handleDelete = async (transactionId) => {
    try {
      await apiClient.delete(`/transactions/${transactionId}`);
      // On success, refresh the list
      fetchTransactions();
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  // --- UPDATED JSX LAYOUT for Responsiveness ---
  return (
    <div className='text-customDarkText pb-24 font-inter'>
      <div className='p-4 md:p-6 font-inter'> 
        
        {/* Row for Title, Filters, and Button */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4'>
            
            {/* Title */}
            <p className='font-semibold text-lg whitespace-nowrap'>Transaction History</p>
            
            {/* Filters and Dashboard Button Wrapper */}
            <div className='flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto'>

              {/* Filters */}
              <div className='flex flex-wrap items-center gap-3 w-full md:w-auto'>
                  <select 
                      value={typeFilter} 
                      onChange={(e) => setTypeFilter(e.target.value)}
                      // Added bg-white
                      className="bg-white border border-gray-300 rounded-lg p-2 text-sm flex-grow min-w-0" 
                  >
                      <option value="all">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                  </select>
                  
                  <select 
                      value={timeFilter} 
                      onChange={(e) => setTimeFilter(e.target.value)}
                      // Added bg-white
                      className="bg-white border border-gray-300 rounded-lg p-2 text-sm flex-grow min-w-0" 
                  >
                      <option value="allTime">All Time</option>
                      <option value="yearly">This Year</option>
                      <option value="monthly">This Month</option>
                      <option value="daily_7">Last 7 Days</option>
                  </select>
              </div>
              
              {/* Dashboard Button */}
              <button 
                  onClick={() => navigate('/dashboard')}
                  // Changed to bg-greenCustom and text-white
                  className='bg-greenCustom text-white px-4 py-2 rounded-lg shadow whitespace-nowrap text-sm hover:opacity-90 transition w-full md:w-auto' 
              >
                  View Dashboard
              </button>
            </div>
        </div>

      </div>

      {/* Transaction List */}
      <div className='px-4 md:px-6'> 
        {filteredTransactions.length === 0 ? (
          <div className="text-center text-gray-500 italic mt-10 p-4">
            <p>No transactions found for the selected filters.</p>
            <p>Click <span className="font-semibold text-greenCustom">+ Add Transaction</span> to begin.</p>
          </div>
        ) : (
          <ul className='space-y-2'>
            {filteredTransactions.map((tx) => (
              <li key={tx._id} className='bg-white shadow p-3 rounded-xl flex justify-between items-center'>
                
                {/* Details */}
                <div className='flex flex-col'>
                  <p className='font-semibold text-base'>{tx.title}</p>
                  <p className='text-xs text-gray-500'>{new Date(tx.date).toLocaleDateString()}</p>
                  <p className='text-xs text-gray-400'>Category: {tx.category}</p>
                </div>
                
                {/* Amount and Delete Button */}
                <div className='flex flex-col items-end'>
                  <p className={`font-bold text-base ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {/* Added safety check for tx.amount to prevent crashes */}
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount ? Number(tx.amount).toFixed(2) : '0.00'}
                  </p>
                  <button onClick={() => handleDelete(tx._id)} className="text-red-500 hover:text-red-700 text-xs mt-1 transition"> Delete </button>
                </div>

              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        className='fixed bottom-6 right-6 bg-greenCustom text-white px-6 py-3 rounded-full shadow-2xl font-semibold transform hover:scale-105 transition-transform duration-200'
        onClick={() => setShowModal(true)}
      >
        + Add Transaction
      </button>

      {showModal && (
        <AddTransaction
          onClose={() => setShowModal(false)}
          onSave={addTransaction} 
        />
      )}
    </div>
  );
}

export default Transactions;