import React, { useState, useEffect } from 'react';
import apiClient from '../axios/api'; 

const expenseCategories = [
  'Food',
  'Transport',
  'Utilities',
  'Rent',
  'Shopping',
  'Entertainment',
  'Other',
];

const incomeCategories = [
  'Salary',
  'Bonus',
  'Gift',
  'Investment',
  'Other',
];


const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = SpeechRecognition ? new SpeechRecognition() : null;

if (mic) {
  mic.continuous = false;
  mic.interimResults = false;
  mic.lang = 'en-US';
}

function AddTransaction({ onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(expenseCategories[0]);


  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiData, setAiData] = useState(null); 
  const [voiceError, setVoiceError] = useState('');

  const categoriesToShow = type === 'expense' ? expenseCategories : incomeCategories;

  useEffect(() => {

    if (type === 'expense') {
      setCategory(expenseCategories[0]);
    } else {
      setCategory(incomeCategories[0]);
    }
  }, [type]); 

 
  const handleVoiceRecording = () => {
    if (!mic) {
      setVoiceError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      mic.stop();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    setVoiceError('');
    mic.start();

    mic.onend = () => {
      setIsRecording(false);
    };

    mic.onerror = (event) => {
      setVoiceError(`Error: ${event.error}`);
      setIsRecording(false);
    };

    mic.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      processTranscript(transcript);
    };
  };

 
  const processTranscript = async (transcript) => {
    setIsProcessing(true);
    setVoiceError('');
    try {
 
      const response = await apiClient.post('/send-to-dialogflow', {
        text: transcript,
      });
      setAiData(response.data);
    } catch (err) {
      setVoiceError('Failed to process. Please try again.');
      console.error(err);
    }
    setIsProcessing(false);
  };


  const handleConfirmAI = () => {
    if (!aiData) return;

    setType(aiData.type); 


    setTitle(aiData.vendor || aiData.originalText.substring(0, 50));
    

    setAmount(aiData.amount.toString());
    

    setCategory(aiData.category);
    

    const transactionDate = aiData.date 
      ? aiData.date 
      : new Date().toISOString().split('T')[0];
    setDate(transactionDate);


    setAiData(null);
  };


  const handleCancelAI = () => {
    setAiData(null);
  };

  const handleSubmit = () => {
  if (!title || !amount || !date || !category) return;
  

  const localDate = new Date(date + "T00:00:00");

  onSave({ 
    title, 
    amount: Number(amount), 
    date: localDate, 
    category, 
    type 
  });
  
  onClose();
};


  const ConfirmationPrompt = () => {

    const displayDate = aiData.date ? aiData.date : new Date().toISOString().split('T')[0];
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-inner border border-blue-200">
        <h4 className="font-semibold text-center mb-2">Confirm Details</h4>
        <p className="text-sm text-gray-600 italic">"{aiData.originalText}"</p>
        <ul className="mt-3 space-y-1 text-sm">
          <li><strong>Type:</strong> <span className="capitalize">{aiData.type}</span></li>
          <li><strong>Amount:</strong> {aiData.amount}</li>
          <li><strong>Category:</strong> {aiData.category}</li>
          <li><strong>Vendor:</strong> {aiData.vendor || 'N/A'}</li>
          <li><strong>Date:</strong> {displayDate} {aiData.date ? '' : '(Today)'}</li>
        </ul>
        <div className="flex justify-between mt-4">
          <button className="bg-greenCustom text-white px-4 py-2 rounded shadow hover:bg-emerald-800 transition" onClick={handleCancelAI}>Cancel</button>
          <button className="bg-greenCustom text-white px-4 py-2 rounded shadow hover:bg-emerald-800 transition" onClick={handleConfirmAI}>
            Confirm & Fill
          </button>
        </div>
      </div>
    );
  };


  return (

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> 
 
      <div className="bg-gray-200 p-6 rounded-3xl w-full max-w-sm shadow-lg">
        <h2 className="text-xl font-semibold text-center mb-4">Add Transaction</h2>

        <div className="p-3 text-center border-b mb-4">
          <button
            onClick={handleVoiceRecording}
            disabled={!mic || isProcessing}

            className={`px-4 py-2 rounded-full text-white shadow-md transition ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-greenCustom hover:opacity-90'
            } ${isProcessing || !mic ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? 'Stop Recording...' : 'Start Voice Note'}
          </button>
          {isProcessing && <p className="text-sm text-greenCustom mt-2">Processing...</p>}
          {voiceError && <p className="text-sm text-red-600 mt-2">{voiceError}</p>}
          {!mic && <p className="text-xs text-gray-500 mt-2">Voice is not supported by this browser.</p>}
        </div>

 
        {aiData ? (
          <ConfirmationPrompt />
        ) : (

          <div className="p-3 space-y-3"> 
            
            <input
              className="w-full bg-white text-black border border-gray-300 rounded-lg p-2"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="w-full bg-white text-black border border-gray-300 rounded-lg p-2"
              placeholder="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              className="w-full bg-white text-black border border-gray-300 rounded-lg p-2"
              placeholder="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            
            <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                className="w-full bg-white text-black border border-gray-300 rounded-lg p-2 mt-1"
                value={type}
                onChange={(e) => setType(e.target.value)}
                >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                </select>
            </div>
            
            <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                className="w-full bg-white text-black border border-gray-300 rounded-lg p-2 mt-1"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                >
                {categoriesToShow.map((cat) => (
                    <option key={cat} value={cat}>
                    {cat}
                    </option>
                ))}
                </select>
            </div>

            <div className="flex justify-between mt-4 pt-2 border-t border-gray-300">
              <button 
                className="bg-greenCustom text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-800 transition" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                className="bg-greenCustom text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-800 transition" 
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddTransaction;
