const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const verifyJWT = require("../middleware/verifyJWT")

router.use(verifyJWT)

router.post('/rate-supplier', ratingController.createRating);

module.exports = router;
