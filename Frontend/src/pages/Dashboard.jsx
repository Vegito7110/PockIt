import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

import apiClient from '../axios/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1967'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


const processCategoryData = (transactionsToProcess, type) => {
  const categoryMap = transactionsToProcess
    .filter(tx => tx.type === type)
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

  return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
};


const EmptyChartPlaceholder = ({ message = "No data for this period" }) => (
  <div className="flex items-center justify-center h-full" style={{ minHeight: '300px' }}>
    <div className="text-center text-gray-500">
      <div className="w-48 h-48 border-8 border-gray-200 border-dashed rounded-full flex items-center justify-center">
        <p className="text-sm px-4">{message}</p>
      </div>
    </div>
  </div>
);



function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [globalTimeFilter, setGlobalTimeFilter] = useState('allTime'); 
  
  const [categoryChartType, setCategoryChartType] = useState('expense'); 
  const navigate = useNavigate();


  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await apiClient.get('/transactions');
        setTransactions(response.data);
      } catch (err) {
        setError('Failed to fetch transactions. Please try again.');
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

 
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 

    switch (globalTimeFilter) {
      case 'daily_7': 
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); 
        return transactions.filter(tx => new Date(tx.date) >= sevenDaysAgo);
      
      case 'monthly': 
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactions.filter(tx => new Date(tx.date) >= startOfMonth);
      
      case 'yearly': 
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return transactions.filter(tx => new Date(tx.date) >= startOfYear);
      
      case 'allTime':
      default:
        return transactions; 
    }
  }, [transactions, globalTimeFilter]);

  const { 
    incomeVsExpenseData, 
    expenseByCategoryData_Pie,
    incomeByCategoryData_Pie,
    totalFilteredSum 
  } = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = filteredTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return { 
      incomeVsExpenseData: [
        { name: 'Income', value: totalIncome },
        { name: 'Expense', value: totalExpense },
      ],
      expenseByCategoryData_Pie: processCategoryData(filteredTransactions, 'expense'),
      incomeByCategoryData_Pie: processCategoryData(filteredTransactions, 'income'), 
      totalFilteredSum: totalIncome + totalExpense 
    };
  }, [filteredTransactions]); 

  const categoryChartData = useMemo(() => {
    return processCategoryData(filteredTransactions, categoryChartType);
  }, [filteredTransactions, categoryChartType]); 


  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-customDarkText">Dashboard</h1>
          

          <div className="flex-grow md:flex-grow-0 md:w-72">
            <label htmlFor="timeFilter" className="block text-sm font-medium text-gray-700">Select Time Period</label>
            <select
              id="timeFilter"
              value={globalTimeFilter}
              onChange={(e) => setGlobalTimeFilter(e.target.value)}
              className="mt-1 block w-full bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-sm shadow-sm"
            >
              <option value="allTime">All Time</option>
              <option value="yearly">This Year</option>
              <option value="monthly">This Month</option>
              <option value="daily_7">Last 7 Days</option>
            </select>
          </div>

          <button
            onClick={() => navigate('/home')}
            className="bg-greenCustom text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-800 transition"
          >
            Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2 text-customDarkText">Income vs. Expense</h3>
            <p className="text-sm text-gray-600 mb-4">
              A high-level overview of your income and expenses for the selected time period.
            </p>
            <div style={{ width: '100%', height: 300 }}>
              {totalFilteredSum === 0 ? (
                <EmptyChartPlaceholder message="No income or expenses for this period." />
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={incomeVsExpenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomeVsExpenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Income' ? '#00C49F' : '#FF8042'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2 text-customDarkText">Expense Breakdown (Pie)</h3>
            <p className="text-sm text-gray-600 mb-4">
              This pie chart shows what percentage of your spending goes to each category.
            </p>
            <div style={{ width: '100%', height: 300 }}>
              {expenseByCategoryData_Pie.length === 0 ? (
                <EmptyChartPlaceholder message="No expense data for this period." />
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={expenseByCategoryData_Pie}
                      cx="50%"
                      cy="50%"  
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={renderCustomizedLabel}
                      labelLine={false}
                    >
                      {expenseByCategoryData_Pie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2 text-customDarkText">Income Breakdown (Pie)</h3>
            <p className="text-sm text-gray-600 mb-4">
              This pie chart shows what percentage of your income comes from each source.
            </p>
            <div style={{ width: '100%', height: 300 }}>
              {incomeByCategoryData_Pie.length === 0 ? (
                <EmptyChartPlaceholder message="No income data for this period." />
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={incomeByCategoryData_Pie}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={renderCustomizedLabel}
                      labelLine={false}
                    >
                      {incomeByCategoryData_Pie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-customDarkText">Breakdown by Category</h3>
              <select
                value={categoryChartType}
                onChange={(e) => setCategoryChartType(e.target.value)}
                className="bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-sm"
              >
                <option value="expense">Expenses</option>
                <option value="income">Income</option>
              </select>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This chart compares the total amount for each {categoryChartType} category for the selected time period.
            </p>
            <div style={{ width: '100%', height: 300 }}>
            {categoryChartData.length === 0 ? (
                <EmptyChartPlaceholder message={`No ${categoryChartType} data for this period.`} />
              ) : (
                <ResponsiveContainer>
                  <BarChart data={categoryChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" type="category" />
                    <YAxis type="number" label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}/>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill={categoryChartType === 'expense' ? '#FF8042' : '#00C49F'} 
                      name={categoryChartType === 'expense' ? 'Amount Spent' : 'Amount Earned'} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;