const jwt = require("jsonwebtoken");
const jwt_string = "qwertyuiop";
const checkAuth = (req,res,next)=>{
    try{
        const {accessToken , refreshToken} = req.cookies;
        // user doesn't login 
        //console.log(req.cookies);
        if (!refreshToken){
            res.status(401).send("User is unauthorized")
        }
        else if (!accessToken && refreshToken){
            res.status(400).send("Access token is expired but Refresh token isn't expired")
        }
        else{
            const decoded = jwt.verify(accessToken,jwt_string);
            //connsole.log(decoded);
            if (!decoded){
                res.status(401).send("Access token is expired.")
            }
            console.log(decoded);
            return next();
        }
    }
    catch (err){
        console.log(err);
    }
}
module.exports = checkAuth;