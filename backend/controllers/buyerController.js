const Buyer = require("../models/Buyer");
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')


// @desc Get all buyers
// @route GET /buyers
// @access Private
const getAllBuyers = asyncHandler (async (req,res) => {
    const buyers = await Buyer.find().select('-password').lean()
    if (!buyers?.length) {
        return res.status(400).json({ message: 'No buyers found'})
    }
    res.json(buyers)
})


// @desc create new buyer
// @route POST /buyers
// @access Private
const createNewBuyer = asyncHandler (async (req,res) => {
    const {
        username,
        email,
        password,
        contact,
        roles
    } = req.body
    
    // confirm data
    if (!username || !email || !password || !contact || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message
            :'All fields are required' })
    }

    // check for duplicate 
    const duplicate = await Buyer.findOne({ username }).lean().exec()
    if (duplicate) {
        return res.status(400).json({ message:'Duplicate username' })
    }

    //Hash password

    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const buyerObject = (!Array.isArray(roles) || !roles.length) ? {
        username,
        email,
        password: hashedPwd,
        contact
    } : {
        username,
        email,
        password: hashedPwd,
        contact,
        roles
    }

    //Create and store a new user

    const buyer = await Buyer.create(buyerObject)

    if (buyer) {
        res.status(201).json({ message: `New buyer ${username} created`})
    } else {
        res.status(400).json({ message: 'Invalid buyer data received'})
    } 
    
})



// @desc update a buyer
// @route PATCH /buyers
// @access Private
const updateBuyer = asyncHandler (async (req,res) => {
    const {id,
        username,
        email,
        password,
        contact,
        roles
    } = req.body

    // confirm dat
    if (!id || !username || !email || !contact || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message
            :'All fields are required' })
    }

    const buyer = await Buyer.findById(id).exec()

    if (!buyer) {
        return res.status(400).json({ message: 'buyer not found'})
    }

    // check for duplicate 
    const duplicate = await Buyer.findOne({ username }).lean().exec()
    //Allow updates to t
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username'})
    }

    buyer.username = username
    buyer.email = email
    buyer.contact = contact
    buyer.roles = roles

    if (password) {
        //Hash password
        buyer.password = await bcrypt.hash(password, 10)
    }

    const updatedBuyer = await buyer.save()

    res.json({ message: `${updatedBuyer.username} updated`})
})

// @desc delete a buyer
// @route DELETE /buyers
// @access Private
const deleteBuyer = asyncHandler (async (req,res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: 'Buyer ID required'})
    }

    const buyer = await Buyer.findOneAndDelete({_id: id})

    if(!buyer) {
        return res.status(400).json({ message: 'Buyer not found'})
    }

    const result = await buyer.deleteOne()

    const reply = `Username ${result.username} with ID ${result.id} deleted`

    res.json(reply)
})

module.exports= {
    getAllBuyers,
    createNewBuyer,
    updateBuyer,
    deleteBuyer
}