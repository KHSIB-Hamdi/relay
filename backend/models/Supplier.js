const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true
        },
        contact: {
            type: String,
            required: true
        },
        domain: {
            type: String,
            required: true
        },
        roles: [{
            type: String,
            default: ["Supplier"]
        }],
        confirmationCode: {
            type: String,
        },
        confirmedEmail: {
            type: String,
        }
         
    },
    { timestamps: true }
)

const Supplier = mongoose.model("Supplier", SupplierSchema)

module.exports = Supplier