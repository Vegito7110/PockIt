import React, { useState, useEffect } from 'react';
import apiClient from '../axios/api'; // Assuming you have an axios instance

// --- Category Lists ---
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

// --- Speech Recognition Setup ---
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

  // --- State for voice and confirmation ---
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiData, setAiData] = useState(null); 
  const [voiceError, setVoiceError] = useState('');

  const categoriesToShow = type === 'expense' ? expenseCategories : incomeCategories;

  useEffect(() => {
    // This effect now correctly handles switching categories 
    // when 'type' is set manually OR by the AI
    if (type === 'expense') {
      setCategory(expenseCategories[0]);
    } else {
      setCategory(incomeCategories[0]);
    }
  }, [type]); // Simplified dependency

  // --- Handle starting/stopping voice recording ---
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

  // --- Send transcript to your LangChain backend ---
  const processTranscript = async (transcript) => {
    setIsProcessing(true);
    setVoiceError('');
    try {
      // NOTE: Using the correct backend path for the AI router
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

  // --- UPDATED --- User confirms the AI-extracted data
  const handleConfirmAI = () => {
    if (!aiData) return;

    // 1. Set Type (directly from AI's 'type' field)
    setType(aiData.type); 

    // 2. Set Title (vendor or fallback)
    setTitle(aiData.vendor || aiData.originalText.substring(0, 50));
    
    // 3. Set Amount
    setAmount(aiData.amount.toString());
    
    // 4. Set Category
    setCategory(aiData.category);
    
    // 5. Set Date (Use AI date OR default to today)
    const transactionDate = aiData.date 
      ? aiData.date 
      : new Date().toISOString().split('T')[0];
    setDate(transactionDate);

    // Clear the confirmation
    setAiData(null);
  };

  // --- User cancels the AI confirmation ---
  const handleCancelAI = () => {
    setAiData(null);
  };

  const handleSubmit = () => {
  if (!title || !amount || !date || !category) return;
  
  // Create a Date object for midnight in the user's local timezone
  const localDate = new Date(date + "T00:00:00");

  onSave({ 
    title, 
    amount: Number(amount), 
    date: localDate,  // <-- Pass the Date object
    category, 
    type 
  });
  
  onClose();
};

  // --- UPDATED --- Helper component for the confirmation prompt
  const ConfirmationPrompt = () => {
    // Get today's date for display fallback
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
    // FIX: Changed items-end to items-center to center the modal vertically on all screens
    // Added p-4 for padding on tiny screens so the modal doesn't stick to the edge
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> 
      {/* FIX: Changed fixed width w-[22rem] to a max-width and use w-full for responsiveness */}
      <div className="bg-gray-200 p-6 rounded-3xl w-full max-w-sm shadow-lg">
        <h2 className="text-xl font-semibold text-center mb-4">Add Transaction</h2>
        
        {/* --- Voice Section --- */}
        <div className="p-3 text-center border-b mb-4">
          <button
            onClick={handleVoiceRecording}
            disabled={!mic || isProcessing}
            // Changed from bg-blue-500 to bg-greenCustom
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

        {/* --- Show confirmation prompt if we have AI data --- */}
        {aiData ? (
          <ConfirmationPrompt />
        ) : (
          /* --- Original Form --- */
          <div className="p-3 space-y-3"> {/* Added space-y-3 for cleaner spacing */}
            
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
// import React, { useState, useEffect } from 'react';
// import apiClient from '../axios/api'; // Assuming you have an axios instance

// // --- Category Lists ---
// const expenseCategories = [
//   'Food',
//   'Transport',
//   'Utilities',
//   'Rent',
//   'Shopping',
//   'Entertainment',
//   'Other',
// ];

// const incomeCategories = [
//   'Salary',
//   'Bonus',
//   'Gift',
//   'Investment',
//   'Other',
// ];

// // --- Speech Recognition Setup ---
// const SpeechRecognition =
//   window.SpeechRecognition || window.webkitSpeechRecognition;
// const mic = SpeechRecognition ? new SpeechRecognition() : null;

// if (mic) {
//   mic.continuous = false;
//   mic.interimResults = false;
//   mic.lang = 'en-US';
// }

// function AddTransaction({ onClose, onSave }) {
//   const [title, setTitle] = useState('');
//   const [amount, setAmount] = useState('');
//   const [date, setDate] = useState('');
//   const [type, setType] = useState('expense');
//   const [category, setCategory] = useState(expenseCategories[0]);

//   // --- State for voice and confirmation ---
//   const [isRecording, setIsRecording] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [aiData, setAiData] = useState(null); 
//   const [voiceError, setVoiceError] = useState('');

//   const categoriesToShow = type === 'expense' ? expenseCategories : incomeCategories;

//   useEffect(() => {
//     // This effect now correctly handles switching categories 
//     // when 'type' is set manually OR by the AI
//     if (type === 'expense') {
//       setCategory(expenseCategories[0]);
//     } else {
//       setCategory(incomeCategories[0]);
//     }
//   }, [type]); // Simplified dependency

//   // --- Handle starting/stopping voice recording ---
//   const handleVoiceRecording = () => {
//     if (!mic) {
//       setVoiceError('Speech recognition is not supported in this browser.');
//       return;
//     }

//     if (isRecording) {
//       mic.stop();
//       setIsRecording(false);
//       return;
//     }

//     setIsRecording(true);
//     setVoiceError('');
//     mic.start();

//     mic.onend = () => {
//       setIsRecording(false);
//     };

//     mic.onerror = (event) => {
//       setVoiceError(`Error: ${event.error}`);
//       setIsRecording(false);
//     };

//     mic.onresult = (event) => {
//       const transcript = event.results[0][0].transcript;
//       processTranscript(transcript);
//     };
//   };

//   // --- Send transcript to your LangChain backend ---
//   const processTranscript = async (transcript) => {
//     setIsProcessing(true);
//     setVoiceError('');
//     try {
//       // NOTE: Using the correct backend path for the AI router
//       const response = await apiClient.post('/send-to-dialogflow', {
//         text: transcript,
//       });
//       setAiData(response.data);
//     } catch (err) {
//       setVoiceError('Failed to process. Please try again.');
//       console.error(err);
//     }
//     setIsProcessing(false);
//   };

//   // --- UPDATED --- User confirms the AI-extracted data
//   const handleConfirmAI = () => {
//     if (!aiData) return;

//     // 1. Set Type (directly from AI's 'type' field)
//     setType(aiData.type); 

//     // 2. Set Title (vendor or fallback)
//     setTitle(aiData.vendor || aiData.originalText.substring(0, 50));
    
//     // 3. Set Amount
//     setAmount(aiData.amount.toString());
    
//     // 4. Set Category
//     setCategory(aiData.category);
    
//     // 5. Set Date (Use AI date OR default to today)
//     const transactionDate = aiData.date 
//       ? aiData.date 
//       : new Date().toISOString().split('T')[0];
//     setDate(transactionDate);

//     // Clear the confirmation
//     setAiData(null);
//   };

//   // --- User cancels the AI confirmation ---
//   const handleCancelAI = () => {
//     setAiData(null);
//   };

//   const handleSubmit = () => {
//   if (!title || !amount || !date || !category) return;
  
//   // Create a Date object for midnight in the user's local timezone
//   const localDate = new Date(date + "T00:00:00");

//   onSave({ 
//     title, 
//     amount: Number(amount), 
//     date: localDate,  // <-- Pass the Date object
//     category, 
//     type 
//   });
  
//   onClose();
// };

//   // --- UPDATED --- Helper component for the confirmation prompt
//   const ConfirmationPrompt = () => {
//     // Get today's date for display fallback
//     const displayDate = aiData.date ? aiData.date : new Date().toISOString().split('T')[0];
    
//     return (
//       <div className="bg-white p-4 rounded-lg shadow-inner border border-blue-200">
//         <h4 className="font-semibold text-center mb-2">Confirm Details</h4>
//         <p className="text-sm text-gray-600 italic">"{aiData.originalText}"</p>
//         <ul className="mt-3 space-y-1 text-sm">
//           <li><strong>Type:</strong> <span className="capitalize">{aiData.type}</span></li>
//           <li><strong>Amount:</strong> {aiData.amount}</li>
//           <li><strong>Category:</strong> {aiData.category}</li>
//           <li><strong>Vendor:</strong> {aiData.vendor || 'N/A'}</li>
//           <li><strong>Date:</strong> {displayDate} {aiData.date ? '' : '(Today)'}</li>
//         </ul>
//         <div className="flex justify-between mt-4">
//           <button className="text-gray-500" onClick={handleCancelAI}>Cancel</button>
//           <button className="bg-greenCustom text-white px-4 py-2 rounded" onClick={handleConfirmAI}>
//             Confirm & Fill
//           </button>
//         </div>
//       </div>
//     );
//   };


//   return (
//     // FIX: Changed items-end to items-center to center the modal vertically on all screens
//     // Added p-4 for padding on tiny screens so the modal doesn't stick to the edge
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> 
//       {/* FIX: Changed fixed width w-[22rem] to a max-width and use w-full for responsiveness */}
//       <div className="bg-gray-200 p-6 rounded-3xl w-full max-w-sm shadow-lg">
//         <h2 className="text-xl font-semibold text-center mb-4">Add Transaction</h2>
        
//         {/* --- Voice Section --- */}
//         <div className="p-3 text-center border-b mb-4">
//           <button
//             onClick={handleVoiceRecording}
//             disabled={!mic || isProcessing}
//             className={`px-4 py-2 rounded-full text-white ${
//               isRecording ? 'bg-red-500' : 'bg-blue-500'
//             } ${isProcessing || !mic ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             {isRecording ? 'Stop Recording...' : 'Start Voice Note'}
//           </button>
//           {isProcessing && <p className="text-sm text-blue-600 mt-2">Processing...</p>}
//           {voiceError && <p className="text-sm text-red-600 mt-2">{voiceError}</p>}
//           {!mic && <p className="text-xs text-gray-500 mt-2">Voice is not supported by this browser.</p>}
//         </div>

//         {/* --- Show confirmation prompt if we have AI data --- */}
//         {aiData ? (
//           <ConfirmationPrompt />
//         ) : (
//           /* --- Original Form --- */
//           <div className="p-3 space-y-3"> {/* Added space-y-3 for cleaner spacing */}
//             {/* Note: The 'input input-field' classes need to be defined elsewhere in your CSS for styling */}
//             <input
//               className="input input-field w-full border border-gray-300 rounded-lg p-2"
//               placeholder="Title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//             />
//             <input
//               className="input input-field w-full border border-gray-300 rounded-lg p-2"
//               placeholder="Amount"
//               type="number"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//             />
//             <input
//               className="input input-field w-full border border-gray-300 rounded-lg p-2"
//               placeholder="Date"
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//             />
            
//             <div>
//                 <label className="text-sm font-medium text-gray-700">Type</label>
//                 <select
//                 className="input input-field w-full border border-gray-300 rounded-lg p-2 mt-1"
//                 value={type}
//                 onChange={(e) => setType(e.target.value)}
//                 >
//                 <option value="expense">Expense</option>
//                 <option value="income">Income</option>
//                 </select>
//             </div>
            
//             <div>
//                 <label className="text-sm font-medium text-gray-700">Category</label>
//                 <select
//                 className="input input-field w-full border border-gray-300 rounded-lg p-2 mt-1"
//                 value={category}
//                 onChange={(e) => setCategory(e.target.value)}
//                 >
//                 {categoriesToShow.map((cat) => (
//                     <option key={cat} value={cat}>
//                     {cat}
//                     </option>
//                 ))}
//                 </select>
//             </div>

//             <div className="flex justify-between mt-4 pt-2 border-t border-gray-300">
//               <button className="text-gray-500 px-3 py-1 hover:bg-gray-300 rounded-lg transition" onClick={onClose}>Cancel</button>
//               <button className="bg-greenCustom text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-800 transition" onClick={handleSubmit}>
//                 Save
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default AddTransaction;
// import React, { useState, useEffect } from 'react';

// // --- Category Lists ---
// const expenseCategories = [
//   'Food',
//   'Transport',
//   'Utilities',
//   'Rent',
//   'Shopping',
//   'Entertainment',
//   'Other',
// ];

// const incomeCategories = [
//   'Salary',
//   'Bonus',
//   'Gift',
//   'Investment',
//   'Other',
// ];

// function AddTransaction({ onClose, onSave }) {
//   const [title, setTitle] = useState('');
//   const [amount, setAmount] = useState('');
//   const [date, setDate] = useState('');
//   const [type, setType] = useState('expense');
  
//   // Set initial category based on default type
//   const [category, setCategory] = useState(expenseCategories[0]); 
  
//   // Determine which category list to show
//   const categoriesToShow = type === 'expense' ? expenseCategories : incomeCategories;

//   // --- Effect to reset category when type changes ---
//   useEffect(() => {
//     // When type changes, reset category to the first one in the new list
//     setCategory(categoriesToShow[0]);
//   }, [type, categoriesToShow]); // Dependency array

//   const handleSubmit = () => {
//     if (!title || !amount || !date || !category) return;
//     onSave({ title, amount: Number(amount), date, category, type });
//     onClose();
//   };

//   return (
//     <div className='fixed inset-0 bg-black bg-opacity-30 flex items-end justify-center z-50'>
//       <div className="bg-gray-200 p-6 rounded-3xl w-[22rem] shadow-lg">
//         <h2>Add Transaction</h2>
//         <div className='p-3'>
//           <input 
//             className='input input-field' 
//             placeholder='Title' 
//             value={title} 
//             onChange={e => setTitle(e.target.value)} 
//           />

//           <input 
//             className='input input-field' 
//             placeholder='Amount' 
//             type='number' 
//             value={amount} 
//             onChange={e => setAmount(e.target.value)} 
//           />

//           <input 
//             className='input input-field' 
//             placeholder='Date' 
//             type='date' 
//             value={date} 
//             onChange={e => setDate(e.target.value)} 
//           />
          
//           {/* --- Type Dropdown --- */}
//           <label className="text-sm font-medium text-gray-700">Type</label>
//           <select 
//             className='input input-field' 
//             value={type} 
//             onChange={e => setType(e.target.value)}
//           >
//             <option value="expense">Expense</option>
//             <option value="income">Income</option>
//           </select>

//           {/* --- Category Dropdown (Dynamic) --- */}
//           <label className="text-sm font-medium text-gray-700">Category</label>
//           <select 
//             className='input input-field' 
//             value={category} 
//             onChange={e => setCategory(e.target.value)}
//           >
//             {categoriesToShow.map((cat) => (
//               <option key={cat} value={cat}>{cat}</option>
//             ))}
//           </select>

//           <div className="flex justify-between mt-4">
//             <button className="text-gray-500" onClick={onClose}>Cancel</button>
//             <button className="bg-greenCustom text-white px-4 py-2 rounded" onClick={handleSubmit}>Save</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AddTransaction;
