const Transaction = require("../models/Transaction")
const asyncHandler = require("express-async-handler")

const generateReport = asyncHandler(async (req, res) => {
    try {
        const { buyerId, supplierId, domain } = req.query;

        const query = {};
        if (buyerId) query.buyer = buyerId;
        if (supplierId) query.supplier = supplierId;
        if (domain) query.supplier = domain;
        

        const transactions = await Transaction.find(query);

        const reportData = transactions.map(transaction => ({
            buyer: transaction.buyer,
            supplier: transaction.supplier,
            amountSpent: transaction.amountSpent,
            deadlineMet: transaction.deadlineMet,
            qualityOfService: transaction.qualityOfService,
        }));

        console.log(reportData)

        res.json(reportData);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'An error occurred while generating the report' });
    }
});


module.exports = {
    generateReport
}

