const jwt = require("jsonwebtoken");
const jwt_string = "qwertyuiop";
const verifyToken = (req,res,next) =>{
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token){
        return res.status(403).send("A token is required for authentication.");
    }
    try{
        const decoded = jwt.verify(token,jwt_string);
        req.user = decoded;

    } catch(err){
        return res.status(401).send("invalid token");
    }
    return next();

}
module.exports = verifyToken;