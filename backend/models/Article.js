// ratings.js
const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer'
    }
   },
  {
    timestamps: true,
  }
)

const articleSchema = new mongoose.Schema({

  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  name: {
    type: String,
    required: true,
  },
  description: {
      type: String,
  },
  products: {
      type: String,
      required: true,
  },
  prices: {
      type: Number,
      required: true,
  },
  delai: {
    type: Date
  },
  quantity: {
    type: Number,
    required: true,
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    
    default: 0,
  },
  numReviews: {
    type: Number,
    
    default: 0,
  }

},
{ timestamps: true }
);



const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
