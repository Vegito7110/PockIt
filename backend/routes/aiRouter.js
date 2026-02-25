const express = require('express');
const router = express.Router();
const { ChatGroq } = require('@langchain/groq'); 
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { z } = require('zod');


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
const allCategories = [...new Set([...expenseCategories, ...incomeCategories])];


const transactionSchema = z.object({
  type: z.enum(['expense', 'income']).describe('The transaction type.'),
  amount: z.number().describe('The numerical amount of the transaction.'),
  category: z
    .enum(allCategories)
    .describe(`The category. Must be one of: ${allCategories.join(', ')}.`),
  vendor: z
    .string()
    .nullable()
    .describe('The store or person (e.g., "Starbucks", "Advik").'),
  date: z
    .string()
    .optional()
    .nullable()
    .describe("The date in YYYY-MM-DD format. E.g., '2025-11-04'. Null if not mentioned."),
});


const llm = new ChatGroq({
  model: 'llama-3.1-8b-instant', 
  temperature: 0,
});

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are an expert at extracting transaction data from user text. ' +
        "Today's date is {currentDate}. " +
        'You must extract the amount, vendor, category, and date. ' +
        'If the user mentions spending, the type is "expense". ' +
        'If the user mentions "credit", "salary", or "received", the type is "income". ' +
        `If type is "income", the category MUST be one of: ${incomeCategories.join(', ')}. ` +
        `If type is "expense", the category MUST be one of: ${expenseCategories.join(', ')}. ` +
        'If no specific category is mentioned, use "Other". ' +
        'If the user says "today", use {currentDate}. If they say "yesterday", calculate and use the previous day\'s date in YYYY-MM-DD format. ' +
        'If no date is mentioned, the date field must be {currentDate} in YYYY-MM-DD format.'
  ],
  ['human', '{inputText}'],
]);


const structuredLlm = llm.withStructuredOutput(transactionSchema);
const chain = prompt.pipe(structuredLlm);


router.post('/send-to-dialogflow', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).send({ error: 'Text is required' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    const structuredResponse = await chain.invoke({
      inputText: text,
      currentDate: today,
    });
    
    structuredResponse.originalText = text;

    console.log('Groq Response:');
    console.log(JSON.stringify(structuredResponse, null, 2));

    res.send(structuredResponse);

  } catch (error) {
    console.error('ERROR calling LLM:', error);
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;

