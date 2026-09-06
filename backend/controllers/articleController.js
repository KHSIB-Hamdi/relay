const Article = require("../models/Article");
const asyncHandler = require('express-async-handler')


// @desc Get all articles
// @route GET /articles
// @access Private
const getAllarticles = asyncHandler (async (req,res) => {
    const articles = await Article.find()
    if (!articles?.length) {
        return res.status(400).json({ message: 'No articles found'})
    }
    res.json(articles)
})

const getArticleId = asyncHandler(async (req, res) => {
    const article = await Article.findById(req.params.id)
 
    if (article) {
      res.json(article)
    } else {
      res.status(404)
      throw new Error('Article not found')
    }
  })


// @desc create new Article
// @route POST /articles
// @access Private
const createNewArticle = asyncHandler (async (req,res) => {
    const {
        name,
        description,
        products,
        prices,
        quantity
    } = req.body


    if (!name || !description || !products || !prices || !quantity ) {
        return res.status(400).json({ message
            :'All fields are required' })
    }
    const supplierId = req.supplierId;
    
    try {
        const newArticle = new Article({
            supplier : supplierId,
            name,
            description,
            products,
            prices,
            quantity
        });

        await newArticle.save();
        
        res.status(201).json({ message: 'Article created successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while creating the Article' });
    }
    
})



// @desc update a supplier
// @route PATCH /suppliers
// @access Private
const updateArticle = asyncHandler (async (req,res) => {
    const {id,
        supplier,
        name,
        description,
        products,
        prices,
        quantity
    } = req.body

    
    // confirm dat
    if (!id || !supplier || !name || !description ||  !products || !prices || !delai) {
        return res.status(400).json({ message
            :'All fields are required' })
    }

    const Article = await Article.findById(id).exec()

    if (!Article) {
        return res.status(400).json({ message: 'Article not found'})
    }

    Article.supplier = supplier
    Article.name = name
    Article.description = description
    Article.products = products
    Article.prices = prices
    Article.quantity = quantity


    const updatedArticle = await Article.save()

    res.json({ message: `Article updated`})
})

// @desc delete a supplier
// @route DELETE /suppliers
// @access Private
const deleteArticle = asyncHandler (async (req,res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Article ID required'})
    }

    const Article = await Article.findById(id).exec()

    if(!Article) {
        return res.status(400).json({ message: 'Article not found'})
    }

    const result = await Article.deleteOne()

    const reply = `Article with ID ${result.id} deleted`

    res.json(reply)
})


const createArticleReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body
  
    const article = await Article.findById(req.params.id)
  
    if (article) {
      const alreadyReviewed = article.reviews.find(
        (r) => r.buyer.toString() === req.buyerId.toString()
      ) 
  
      if (alreadyReviewed) {
        res.status(400)
        throw new Error('Article already reviewed')
      }
      const buyerId = req.buyerId
      const review = {
        rating: Number(rating),
        comment,
        buyer:buyerId
      }
  
      article.reviews.push(review)
  
      article.numReviews = article.reviews.length
  
      article.rating =
        article.reviews.reduce((acc, item) => item.rating + acc, 0) /
        article.reviews.length
  
      await article.save()
      res.status(201).json({ message: 'Review added' })
    } else {
      res.status(404)
      throw new Error('Article not found')
    }
  })

module.exports= {
    getAllarticles,
    createNewArticle,
    updateArticle,
    deleteArticle,
    createArticleReview,
    getArticleId
}