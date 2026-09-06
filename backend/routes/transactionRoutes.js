const express = require("express");
const transactionController = require("../controllers/transactionController")

const verifyJWT = require("../middleware/verifyJWT")

const router = express.Router()


/* read */
/*
 * Writes require a valid access token (middleware/verifyJWT.js), which sets
 * req.supplierId or req.buyerId. Reads are left public so the catalogue stays
 * browsable without a session.
 *
 * NOT YET ENFORCED: per-record ownership. A token holder can currently modify
 * records they do not own - see docs/AUDIT.md.
 */

router.get("/", transactionController.getAllTransactions)

/* create */
router.post("/", verifyJWT, transactionController.createNewTransaction)

/* update */
router.patch("/", verifyJWT, transactionController.updateTransaction)

/* delete */
router.delete("/", verifyJWT, transactionController.deleteTransaction)


module.exports = router