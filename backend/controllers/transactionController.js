const Transaction = require("../models/Transaction");
const asyncHandler = require('express-async-handler')


// @desc Get all transactions
// @route GET /transactions
// @access Private
const getAllTransactions = asyncHandler (async (req,res) => {
    const transactions = await Transaction.find()
    if (!transactions?.length) {
        return res.status(400).json({ message: 'No transactions found'})
    }
    res.json(transactions)
})


// @desc create new transaction
// @route POST /transactions
// @access Private
const createNewTransaction = asyncHandler (async (req,res) => {
    const {
        buyer,
        supplier,
        amountSpent,
        deadlineMet,
        qualityOfService
    } = req.body
    
    if (!buyer || !supplier || !amountSpent || !deadlineMet || !qualityOfService) {
        return res.status(400).json({ message
            :'All fields are required' })
    }

    try {
        const newTransaction = new Transaction({
            buyer,
            supplier,
            amountSpent,
            deadlineMet,
            qualityOfService
        });

        await newTransaction.save();
        
        res.status(201).json({ message: 'Transaction created successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while creating the transaction' });
    }
    
})



// @desc update a buyer
// @route PATCH /buyers
// @access Private
const updateTransaction = asyncHandler (async (req,res) => {
    const {id,
        buyer,
        supplier,
        amountSpent,
        deadlineMet,
        qualityOfService
    } = req.body

    // confirm dat
    if (!id || !buyer || !supplier || !amountSpent || !deadlineMet || !qualityOfService) {
        return res.status(400).json({ message
            :'All fields are required' })
    }

    const transaction = await Transaction.findById(id).exec()

    if (!transaction) {
        return res.status(400).json({ message: 'transaction not found'})
    }

    transaction.buyer = buyer
    transaction.supplier = supplier
    transaction.amountSpent = amountSpent
    transaction.deadlineMet = deadlineMet
    transaction.qualityOfService = qualityOfService


    const updatedTransaction = await transaction.save()

    res.json({ message: `Transaction updated`})
})

// @desc delete a buyer
// @route DELETE /buyers
// @access Private
const deleteTransaction = asyncHandler (async (req,res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Transaction ID required'})
    }

    const transaction = await Transaction.findById(id).exec()

    if(!transaction) {
        return res.status(400).json({ message: 'Transaction not found'})
    }

    const result = await transaction.deleteOne()

    const reply = `Transaction with ID ${result.id} deleted`

    res.json(reply)
})

module.exports= {
    getAllTransactions,
    createNewTransaction,
    updateTransaction,
    deleteTransaction
}