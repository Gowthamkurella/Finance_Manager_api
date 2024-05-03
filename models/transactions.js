const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Assuming you have a User model
    },
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense'] // Transaction type can either be income or expense
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String
    }
});


const Transactions = mongoose.model('transactions', transactionSchema);
module.exports = Transactions;