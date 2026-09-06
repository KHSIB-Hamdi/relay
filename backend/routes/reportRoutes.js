const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const verifyJWT = require("../middleware/verifyJWT")

router.use(verifyJWT)


router.get('/generate-report', reportController.generateReport);

module.exports = router;