const mongoose = require("mongoose");
const bcrypt = require("bcrypt")

const buyerSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            min: 2,
            max: 50
        },
        email: {
            type: String,
            required: true,
            unique: true,
            max: 50
        },
        password: {
            type: String,
            required: true,
            min: 5
        },
        contact: {
            type: String,
            required: true
        },
        roles: [{
            type: String,
            default: ["Buyer"]
        }]
    },
    { timestamps: true }
)



const Buyer = mongoose.model("Buyer", buyerSchema)

module.exports = Buyer