const Transaction = require('../models/transaction');
const getTransactions= async (req, res) => {
  try {

    const transactions = await Transaction.find({ user: req.user._id })
                                          .sort({ date: -1 });

    res.status(200).json(transactions);
    
  } catch (error) {
    res.status(500).send({ error: 'Server error fetching transactions.' });
  }
}
const createTransactions =async (req, res) => {
  try {
    const { title, amount, type, date, category } = req.body;
    
    const newTransaction = new Transaction({
      title,
      amount,
      type,
      date,
      category,
      user: req.user._id
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
    
  } catch (error) {
    res.status(400).send({ error: 'Error creating transaction.' });
  }
}
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;


    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Transaction.findByIdAndDelete(id);

    res.json({ msg: 'Transaction removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
}
module.exports= {
    getTransactions,
    createTransactions,
    deleteTransaction
}