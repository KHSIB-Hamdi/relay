const express = require("express");
const authController = require("../controllers/authController")
const loginLimiter = require("../middleware/loginLimiter")

const router = express.Router()

router.route("/register")
    .post( authController.register)

router.route("/login")
    .post( loginLimiter,authController.login)

{/* router.route("/loginBuyer")
.post( loginLimiter,  authController.loginBuyer)*/}

router.route("/refresh")
    .get(authController.refresh)

router.route("/logout")
    .post(authController.logout)

// Reads the code from the query string (see confirmMail -> req.query.code),
// matching the link emailed by authController.register.
router.get('/confirm', authController.confirmMail);

router.post('/generate-otp', authController.generateOTP);

router.get('/verify-otp', authController.verifyOTP);

router.get('/check-reset-session', authController.createResetSession);

router.post('/reset-password', authController.resetPassword);

    
module.exports = router
