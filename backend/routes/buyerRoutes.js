const express = require("express");
const buyerController = require("../controllers/buyerController")

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

router.get("/", buyerController.getAllBuyers)

/* create */
router.post("/", verifyJWT, buyerController.createNewBuyer)

/* update */
router.patch("/", verifyJWT, buyerController.updateBuyer)

/* delete */
router.delete("/", verifyJWT, buyerController.deleteBuyer)


module.exports = router