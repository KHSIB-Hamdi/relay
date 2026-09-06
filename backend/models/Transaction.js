
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    buyer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Buyer' 
    }, 
    supplier: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Supplier' 
    }, 
    amountSpent: { 
        type: Number 
    },
    deadlineMet: { 
        type: Boolean,
    },    
    qualityOfService: { 
        type: Number,
    },    
    }, 
    { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
