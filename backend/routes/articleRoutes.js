const express = require("express");
const articleController = require("../controllers/articleController")
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

router.get("/", articleController.getAllarticles)

/* create */
router.post("/", verifyJWT, articleController.createNewArticle)

/* update */
router.patch("/", verifyJWT, articleController.updateArticle)

/* delete */
router.delete("/", verifyJWT, articleController.deleteArticle)

router.post('/:id/reviews', verifyJWT, articleController.createArticleReview)

router.get('/:id', articleController.getArticleId)


module.exports = router