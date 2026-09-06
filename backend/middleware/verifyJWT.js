const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized'})
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })
            
            const roles = decoded.UserInfo.roles;
            if (roles.includes('Supplier')) {
                req.supplierId = decoded.UserInfo.supplierId;
                
            } else if (roles.includes('Buyer')) {
                req.buyerId = decoded.UserInfo.buyerId;
            }
            req.roles = decoded.UserInfo.roles;
            next()
        }
    )
}




module.exports = verifyJWT