const bcrypt = require("bcrypt")
const crypto = require('crypto')
const jwt =require("jsonwebtoken")
const Supplier = require("../models/Supplier")
const Buyer = require("../models/Buyer")
const asyncHandler = require("express-async-handler")
const transporter = require('../config/mailer')
const otpGenerator = require('otp-generator')



function generateConfirmationCode() {
    const length = 8; 
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
  
    return code;
  }

const sendConfirmationEmail = (email, confirmationCode) => {
    const confirmationLink = `http://localhost:3000/email-confirmation?code=${confirmationCode}`;
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Confirm Your Email',
      html: `<p>To confirm your email, click <a href="${confirmationLink}">here</a></p>`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending confirmation email:', error);
      } else {
        console.log('Confirmation email sent:', info.response);
      }
    });
  };


const register = asyncHandler (async (req,res) => {
    const {
        username,
        email,
        password,
        address,
        contact,
        domain
    } = req.body
    
    const errors = {};

    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    if (!username) {
        errors.username = 'Username is required';
    }

    if (!username) {
        errors.email = 'Email is required';
    }

    if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (isNaN(contact)) {
        errors.contact = 'Contact must be a valid number';
    }

    const duplicate = await Supplier.findOne({ username }).lean().exec()
    if (duplicate) {
        errors.username = 'Duplicate username';
    }

    const duplicateEmail = await Supplier.findOne({ email }).lean().exec()
    if (duplicateEmail) {
        errors.email = 'Duplicate email';
    }

    if(!specialChars.test(password)){
        errors.password = "Password must have special character"
    }

    if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)){
        errors.email = "Invalid email address...!"
    }


    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    const hashedPwd = await bcrypt.hash(password, 10) 

    const confirmationCode = generateConfirmationCode();

    const supplierObject = {
        username,
        email,
        password: hashedPwd,
        address,
        contact,
        domain,
        roles: ['Supplier'],
        confirmationCode ,
        
    };

    const supplier = await Supplier.create(supplierObject)

    if (supplier) {
        res.status(201).json({ message: `New supplier ${username} created`})
        sendConfirmationEmail(supplier.email, confirmationCode);
    } else {
        res.status(400).json({ message: 'Invalid supplier data received'})
    } 
    
})

const confirmMail = asyncHandler(async(req, res) => {

    const confirmationCode = req.query.code;
    console.log(confirmationCode)

    const foundSupplier = await Supplier.findOneAndUpdate(
        { confirmationCode },
        { confirmedEmail: true }
      ).exec();

    console.log(foundSupplier)

    if (foundSupplier) {
        await foundSupplier.save();
        res.status(200).json({ message: 'Email confirmed successfully!' });
      } else {
        res.status(400).json({ message: 'Invalid confirmation code' });
      }
})



const login = asyncHandler(async(req, res) => {
    const { username, password } = req.body
    const { rememberMe } = req.body

    const errors = {};

    if (!username) {
        errors.username = 'All fields is required'
    }

    let foundUser;
    let roles = [];

    const isSupplier = await Supplier.exists({ username });
    
    if (isSupplier) {
        foundUser = await Supplier.findOne({ username }).exec()
        roles = foundUser ? foundUser.roles : []
    } else {
        foundUser = await Buyer.findOne({ username }).exec()
        roles = foundUser ? foundUser.roles : []
    }

    if (!foundUser) {
        return res.status(401).json({ message: 'Unauthorized'})
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) return res.status(401).json({ message: 'Unauthorized'})

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                username: foundUser.username,
                roles,
                ...(isSupplier ? {supplierId: foundUser._id.toString()} : { buyerId: foundUser._id.toString() }),
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m'}
    )

    const refreshToken = jwt.sign(
        {
            username: foundUser.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d'}
    )
    const longLivedToken = jwt.sign(
        {
            UserInfo: {
                username: foundUser.username,
                roles,
                ...(isSupplier ? {supplierId: foundUser._id.toString()} : { buyerId: foundUser._id.toString() }),
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30d' }
    );
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true, // Enable this in production with HTTPS
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      
        
    res.json({ accessToken, longLivedToken, foundUser})
})



const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized'})

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundSupplier = await Supplier.findOne({ username: decoded.username }).exec()

            if (!foundSupplier) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundSupplier.username,
                        "roles": foundSupplier.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken })
        })
    )

}


const logout = (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(204)
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None'
    , secure: true})
    
    res.json({ message: 'Cookie cleared'})
}

const generateOTP = asyncHandler( async(req,res) => {
    const { email } = req.body;
    const OTP = await otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
    
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email, // Replace with the user's email
        subject: 'OTP Verification',
        text: `Your OTP code is: ${OTP}`,
      };
    
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending OTP email:', error);
          return res.status(500).send({ error: 'Error sending OTP email' });
        } else {
          console.log('OTP email sent:', info.response);
          req.app.locals.OTP = OTP;
          req.app.locals.resetSession = true;
          return res.status(201).send({ msg: 'OTP sent!' });
        }
      });
})

const verifyOTP = asyncHandler(async (req, res) => {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        return res.status(200).send({ message: 'Verfied successfully' });
    } else {
      return res.status(400).send({ error: 'Invalid OTP' });
    }
  });



const createResetSession = asyncHandler(async(req,res) => {
    if(req.app.locals.resetSession){
         return res.status(201).send({ flag : req.app.locals.resetSession})
    }
    return res.status(440).send({error : "Session expired!"})
 })

 function generateResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    return token;
  }
 
 
 const resetPassword = asyncHandler(async (req, res) => {
    try {
      if (!req.app.locals.resetSession) {
        return res.status(440).send({ error: "Session expired!" });
      }
  
      const { email,newPassword, confirmPassword } = req.body;
  
      try {
        
        const resetToken = generateResetToken();
  
       
        const supplier = await Supplier.findOneAndUpdate(
          { email},
          {
            resetToken: resetToken,
            resetTokenExpiry: Date.now() + 3600000, 
          }
        );
  
        if (!supplier) {
          return res
            .status(400)
            .send({ error: "Invalid reset token or expired session" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        supplier.password = hashedPassword;

      
        await supplier.save();
  
        const resetLink = `http://localhost:3000/reset-password?resetToken=${resetToken}`;
        const mailOptions = {
          from: process.env.SMTP_FROM,
          to: email,
          subject: "Password Reset Confirmation",
          html: `<p>To reset your password, click <a href="${resetLink}">here</a></p>`,
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending reset email:", error);
          } else {
            console.log("Reset email sent:", info.response);
          }
        });
  
        req.app.locals.resetSession = false;
        return res.status(201).send({ msg: "Password reset email sent!" });
      } catch (error) {
        return res.status(500).send({ error: "Error resetting password" });
      }
    } catch (error) {
      return res.status(401).send({ error });
    }
  });
  
module.exports = {
    register,
    login,
    refresh,
    logout,
    confirmMail,
    generateOTP,
    verifyOTP,
    createResetSession,
    resetPassword
}
