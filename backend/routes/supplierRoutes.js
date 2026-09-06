const express = require("express");
const supplierController = require("../controllers/supplierController")
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

router.get('/', supplierController.getAllSuppliers)

/* create */
router.post("/", verifyJWT, supplierController.createNewSupplier)

/* update */
router.patch("/:supplierId", verifyJWT, supplierController.updateSupplier)

/* delete */
router.delete("/:id", verifyJWT, supplierController.deleteSupplier)

/* get by id*/
router.get("/:supplierId", supplierController.getSupplierById)

router.get("/:supplierId/articles", supplierController.getArticlesForSupplier)

/* sort by domain */
router.get("/bydomain", supplierController.renderSuppliersByDomain)

/* filter by different attributes */
router.get("/filter", supplierController.filterSuppliers)

/* Compare offers */
router.post("/compare-offers", verifyJWT, supplierController.compareOffers)

module.exports = router