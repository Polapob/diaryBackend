const jwt = require("jsonwebtoken");
const jwt_string = "qwertyuiop";
const checkEmail = (req,res,next)=>{
    try{
        const {email,userName} = req.body;
        const {accessToken,refreshToken} = req.cookies;
        const decoded = jwt.verify(accessToken,jwt_string);
        //console.log(decoded);
        //console.log(email);
        if (email === decoded["email"] && userName === decoded["userName"]){
            return next();
        }
        else{
            res.status(400).send("You cannot have permission to access the content");
        }
    }
    catch (err){
        console.log(err);
    }
}
module.exports = checkEmail;