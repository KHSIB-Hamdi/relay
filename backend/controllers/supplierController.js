const Supplier = require("../models/Supplier");
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const Article = require("../models/Article");



// @desc Get all suppliers
// @route GET /suppliers
// @access Private
const getAllSuppliers = asyncHandler (async (req,res) => {
    const suppliers = await Supplier.find().select('-password').lean()
    if (!suppliers?.length) {
        return res.status(400).json({ message: 'No suppliers found'})
    }
    res.json(suppliers)
})

const getArticlesForSupplier  = asyncHandler (async (req,res) => {
    try {
        const supplierId = req.params.supplierId;
        
        // Fetch articles for the given supplierId
        const articles = await Article.find({ supplier: supplierId }).exec();
        
        res.status(200).json(articles);
      } catch (error) {
        console.error("Error fetching articles for supplier:", error);
        res.status(500).json({ error: "An error occurred while fetching articles" });
      }
})


const getSupplierById = asyncHandler(async (req, res) => {
    const supplierId = req.params.supplierId;
    
    
    try {
      const supplier = await Supplier.findById(supplierId).exec();
  
      if (!supplier) {
        return res.status(400).json({ message: 'Supplier not found' });
      }
  
      res.json(supplier);
    } catch (error) {
      // Handle any errors that might occur during the process
      console.error('Error fetching supplier by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// @desc create new supplier
// @route POST /suppliers
// @access Private
const createNewSupplier = asyncHandler (async (req,res) => {
    const {
        username,
        email,
        password,
        address,
        contact,
        domain
        
    } = req.body
    
    // confirm data
    if (!username || !email || !address || !contact || !domain ) {
        return res.status(400).json({ message
            :'All fields are required' })
    }

    // check for duplicate 
    const duplicate = await Supplier.findOne({ username }).lean().exec()
    if (duplicate) {
        return res.status(400).json({ message:'Duplicate firstname' })
    }

    //Hash password

    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const supplierObject = {
        username,
        email,
        password: hashedPwd,
        address,
        contact,
        domain,
        roles: ['Supplier']
    }

    //Create and store a new user

    const supplier = await Supplier.create(supplierObject)

    if (supplier) {
        res.status(201).json({ message: `New supplier ${username} created`})
    } else {
        res.status(400).json({ message: 'Invalid supplier data received'})
    } 
    
})



// @desc update a supplier
// @route PATCH /suppliers
// @access Private
const updateSupplier = asyncHandler (async (req,res) => {
    const supplierId = req.params.supplierId;
    console.log('Supplier ID:', supplierId);
    const {
        username,
        email,
        password,
        address,
        contact,
        domain
    } = req.body

    // confirm data
    if ( !username || !email || !password || !address || !contact || !domain ) {
        return res.status(400).json({ message
            :'All fields are required' })
    }

    const supplier = await Supplier.findById(supplierId).exec();

    if (!supplier) {
        return res.status(400).json({ message: 'supplier not found'})
    }

    // check for duplicate 
    const duplicate = await Supplier.findOne({ username }).lean().exec()
    //Allow updates to t
    if (duplicate && duplicate?._id.toString() !== supplierId) {
        return res.status(409).json({ message: 'Duplicate username'})
    }

    supplier.username = username
    supplier.email = email
    supplier.address = address
    supplier.contact = contact
    supplier.domain = domain
    
    if (password) {
        
        supplier.password = await bcrypt.hash(password, 10)
    }

    const updatedSupplier = await supplier.save()

    res.json({ message: `${updatedSupplier.username} updated`})
})

// @desc delete a supplier
// @route DELETE /suppliers
// @access Private
const deleteSupplier = asyncHandler (async (req,res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ message: 'Supplier ID required'})
    }

    const supplier = await Supplier.findOneAndDelete({_id: id})

    if(!supplier) {
        return res.status(400).json({ message: 'Supplier not found'})
    }

    const result = await supplier.deleteOne()

    const reply = `Username ${result.username} with ID ${result.id} deleted`

    res.json(reply)
})

const renderSuppliersByDomain = asyncHandler( async(req, res) => {
    try {
      const suppliers = await Supplier.find().sort('domain');
      const suppliersByDomain = {};
  
      suppliers.forEach(supplier => {
        if (!suppliersByDomain[supplier.domain]) {
          suppliersByDomain[supplier.domain] = [];
        }
        suppliersByDomain[supplier.domain].push(supplier);
      });
  
    res.status(201).json(suppliersByDomain)
    } catch (error) {
        console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching suppliers.' });
    }
  })

const filterSuppliers = asyncHandler(async (req, res) => {
    const filterTerm = req.query.term;
  
    if (!filterTerm) {
      return res.status(400).json({ message: 'Filter term is required.' });
    }
  
    try {
      const searchResults = await Supplier.find({
        $or: [ 
          { username: { $regex: filterTerm, $options: 'i' } }, 
          { email: { $regex: filterTerm, $options: 'i' } },
          { contact: { $regex: filterTerm, $options: 'i' } }, 
          { address: { $regex: filterTerm, $options: 'i' } } 
        ],
      })
  
      res.json(searchResults);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while searching for suppliers.' });
    }
})

const compareOffers = asyncHandler(async (req, res) => {
    try {
        const { supplierNames } = req.body;

        const suppliers = await Supplier.find({ username: { $in: supplierNames } });

        const comparisonData = suppliers.map(supplier => {
            return {
                supplierName: supplier.name,
                offers: supplier.products.map((product, index) => {
                    return {
                        product,
                        price: supplier.prices[index]
                    };
                })
            };
        });
        console.log(comparisonData)
        res.json(comparisonData);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while fetching supplier offers' });
    }
});

module.exports= {
    getAllSuppliers,
    createNewSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    renderSuppliersByDomain,
    filterSuppliers,
    compareOffers,
    getArticlesForSupplier
}