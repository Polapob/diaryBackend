const jwt_string = "qwertyuiop";
var cookies = require("cookie-parser");
const jwt = require("jsonwebtoken");
function verifyJWT(token){
    try{
        //console.log(token);
        const decoded = jwt.verify(token,jwt_string);
        //console.log(decoded);
        return { payload: decoded, expired: false };
    }
    catch (err){
        //console.log(err);
        return { payload: null, expired: true};
    }
}

function deserializeUser(req,res,next){
    try{
        //console.log(req.cookies);
        const {accessToken,refreshToken} = req.cookies;
       // console.log("accessToken = ",accessToken,"refreshToken =",refreshToken);
        //console.log(accessToken);
        if (accessToken){
            return next();
        }
       
        const {payload, expired} = verifyJWT(accessToken);
        if (payload){
            req.user = payload;
            return next();
        }
        const refresh = expired && refreshToken ? verifyJWT(refreshToken) : null;

        if (!refresh){
            
            return next();
        }
      
        const userEmail = refresh.payload.email;
        const newAccessToken = jwt.sign(
            {userName: refresh.payload.userName , userEmail},
            "qwertyuiop",
            {
                expiresIn: "30s"
            }
        )
        res.cookie("accessToken", newAccessToken, {
            maxAge: 1200000, // 30 second
            httpOnly: true,
          });
        
        req.user = verifyJWT(newAccessToken).payload;
        //res.status(200).send("OK verify");
        return next();
    }
    catch (err){
        console.log(err);
        res.status(401).send("invalid token");
    }
    
}
module.exports = deserializeUser;