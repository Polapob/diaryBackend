const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  initializeApp,
  applicationDefault,
  cert,
  refreshToken,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const auth = require("./middleware/auth");
const deserializeUser = require("./middleware/deserializeUser");
const cookies = require("cookie-parser");
const jwt_string = "qwertyuiop";
const checkAuth = require("./middleware/checkAuth");
let app = express();
app.use(bodyParser.json()); // ให้ server(express) ใช้งานการ parse json
app.use(morgan("dev")); // ให้ server(express) ใช้งานการ morgam module
//app.use(cors()); // ให้ server(express) ใช้งานการ cors module
app.use(cookies());
//app.use(deserializeUser);
const serviceAccount = require("./diaryproject_api_key.json");
const { rmSync } = require("fs");
const checkEmail = require("./middleware/checkEmail");

const corsOptions = {
  origin: "https://diary-front-end-v2.vercel.app",
  credentials: true,
};
initializeApp({
  credential: cert(serviceAccount),
});

app.use(cors(corsOptions));
const db = getFirestore();

app.listen(4000, function () {
  console.log("Server Listen at http://localhost:4000");
  //console.log('Users :', users)
});

app.get("/", (req, res, next) => {
  console.log(req.cookies);
  res.send("Hello world");
});

app.post("/register", async function (req, res, next) {
  try {
    const { userName, email, password } = req.body;
    if (!(userName && email && password)) {
      res.status(400).send("All input is required");
    }
    // validation if user exist in database
    const userRef = db.collection("User");
    const oldUser = await userRef.where("email", "==", email).get();
    if (!oldUser.empty) {
      return res.status(409).send("User already exist Please login.");
    }

    // Encrypted user password

    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log("password = ", password);
    // create user in database
    // console.log(encryptedPassword);
    const data = {
      userName: userName,
      email: email.toLowerCase(),
      password: encryptedPassword,
    };
    db.collection("User")
      .add(data)
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch((err) => {
        console.error("Error adding document: ", err);
      });

    // create token
    const token = jwt.sign({ userName: userName, email }, "qwertyuiop", {
      expiresIn: "2h",
    });
    // save user token
    data.token = token;

    return res.status(201).json(data);
  } catch (err) {
    console.log(err);
  }
});
app.post("/login", async (req, res) => {
  try {
    // get user input
    console.log(req.body);
    const { email, password } = req.body;

    // validate user input
    if (!(email && password)) {
      console.log("All input is Required.");
      return res.status(400).send("All input is Required.");
    }

    const userRef = db.collection("User");
    const oldUser = await userRef.where("email", "==", email).get();
    if (oldUser.empty) {
      console.log("User not found");
      return res.status(400).send("User not found");
    } else {
      var checkData;
      oldUser.forEach((doc) => {
        checkData = doc.data();
      });
      if (!(await bcrypt.compare(password, checkData["password"]))) {
        console.log("Incorrect Password");
        return res.status(400).send("Incorrect password");
      } else {
        const accessToken = jwt.sign(
          { userName: checkData["userName"], email },
          "qwertyuiop",
          {
            expiresIn: "20m",
          }
        );
        const refreshToken = jwt.sign(
          { userName: checkData["userName"], email },
          "qwertyuiop",
          {
            expiresIn: "24h",
          }
        );
        res.cookie("accessToken", accessToken, {
          maxAge: 60000,
          httpOnly: true,
          secure:true,
          domain: "vercel.app"
        });
        res.cookie("refreshToken", refreshToken, {
          maxAge: 86400000,
          httpOnly: true,
          secure:true,
          domain: "vercel.app"
        });
        //console.log(accessToken);
        //console.log(refreshToken);
        //oldUser.token = token;
        /*oldUser.forEach(doc => {
                    userRef.doc(doc.id).update({token:token});
                    checkData = doc.data();
                  });*/
      }
     // console.log(checkData);

      res.status(200).json(checkData);
    }
  } catch (err) {
    console.log(err);
    return res.status(200).send(err);
  }
});
app.post("/checkLogin", (req, res) => {
  try {
    //console.log(req.cookies);
    const { accessToken, refreshToken } = req.cookies;
    if (!(accessToken && refreshToken)) {
      return res.status(401).send("Please login!");
    }
    //console.log(accessToken);
    //console.log(refreshToken);
    //res.status(200).send("Welcome");
    console.log("error");
    const decoded = jwt.verify(accessToken, "qwertyuiop");
    console.log(decoded);
    res.status(200).send(decoded);
  } catch (err) {
    console.log(err);
    res.status(400).send("");
  }
});

app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome I love you.");
});

app.post("/refreshToken",(req,res) => {
  const {accessToken,refreshToken} = req.cookies;
  // when there exist refresh and access token
  if (accessToken && refreshToken){
    //res.status(400).send("The access token is not expired");
    try{
      //console.log(refreshToken);
      const decoded = jwt.verify(refreshToken, jwt_string);
      const email = decoded.email;
      const newAccessToken = jwt.sign({userName:decoded["userName"],email},jwt_string,{ expiresIn: '20m' })
      res.cookie("accessToken", newAccessToken, {
        maxAge: 60000,
        httpOnly: true,
        secure:true,
        domain: "vercel.app"
      });

      res.status(200).send("Cookie send");
      console.log("success generating new access token.");
    }
    catch (err) {
      console.log(err);
      res.status(401).send("Please Login_V2");
    }
  }
  else if (refreshToken === undefined){
    res.status(401).send("Please Login")
  }
  else if (refreshToken && !accessToken){
    // generate new refreshToken
    try{
      //console.log(refreshToken);
      const decoded = jwt.verify(refreshToken, jwt_string);
      const email = decoded.email;
      const newAccessToken = jwt.sign({userName:decoded["userName"],email},jwt_string,{ expiresIn: '20m' })
      res.cookie("accessToken", newAccessToken, {
        maxAge: 60000,
        httpOnly: true,
        secure:true,
        domain: "vercel.app"
      });

      res.status(200).send("Cookie send");
      console.log("success generating new access token.");
    }
    catch (err) {
      console.log(err);
      res.status(401).send("Please Login_V2");
    }
   
  }
})

app.post("/logout", (req, res) => {
  const { accessToken, refreshToken } = req.cookies;
  if (!(accessToken && refreshToken)) {
    return res.status(401).send("Please login!");
  }
  res.cookie("accessToken", "", {
    maxAge: 0,
    httpOnly: true,
    secure:true,
    domain: "vercel.app"
  });
  res.cookie("refreshToken", "", {
    maxAge: 0,
    httpOnly: true,
    secure:true,
    domain: "vercel.app"
  });
  res.status(200).send("Finish Logout");
});

app.post("/addMemo",checkAuth,checkEmail, (req, res) => {
 try{
  const { userName, text, pictureUrl, date, topic } = req.body;
  //console.log((userName&&text&&pictureUrl));
  console.log(!pictureUrl);
  console.log(req.body);
  if (!(userName && text && date && topic)) {
    return res.status(400).send("Incorrect Type");
  }
  const data = {
    userName: userName,
    date: date,
    topic: topic,
    text: text,
  };
  db.collection("Memo")
    .add(data)
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch((err) => {
      console.error("Error adding document: ", err);
    });

    res.status(200).send("Finish Added");
    
 }
 catch (err){
   console.log(err);
 }
});

app.get("/getAllMemo",async (req,res)=>{
  try{
    const memoRef = await db.collection("Memo").orderBy("date","desc").get();
    const allData = [];
    memoRef.forEach((doc)=>{
      const newJson = doc.data();
      newJson["documentID"] = doc.id;
      allData.push(newJson);
      //console.log(newJson);
    })
    console.log(allData);
    res.status(200).json({memoData:allData});
  }
  catch (err){
    console.log(err);
  }
})

app.delete("/deleteMeMo/:docID",checkAuth,checkEmail,async (req,res)=>{
  try{
    const deleteID = req.params.docID;
    console.log(deleteID);
    const memoRef = await db.collection("Memo").doc(deleteID).get();

    if (!memoRef.exists){
      return res.status(400).send("No document id in database.");
    }
    const deleteData = await db.collection("Memo").doc(deleteID).delete();
    //console.log(deleteData);
    //console.log('Delete: ', deleteData);
    res.status(200).send("successful delete");
  }
  catch (err){
    console.log(err);
  }
})

app.get("/getMemo/:DocID",async (req,res)=>{
  try{
    const documentID = req.params.DocID;
    const memoRef = await db.collection("Memo").doc(documentID).get();
    if (!memoRef.exists){
      res.status(400).send("Don't found data in memo");
    }
    else{
      res.status(200).json({"data":memoRef.data()});
    }
  }
  catch (err){
    console.log(err);
  }
})

app.post("/editMemo/:DocID",checkAuth,checkEmail,async (req,res)=>{
  try{
    const {userName,text,editDate,date,topic} = req.body;
    const data = {
      userName:userName,
      text:text,
      editDate:editDate,
      date:date,
      topic:topic
    }
    if (!(userName && text && date && topic && editDate)){
      return res.status(400).send("Please add every field of Data");
    }
    const documentID = req.params.DocID;
    const memoRef = await db.collection("Memo").doc(documentID).get();
    if (!memoRef.exists){
      res.status(400).send("Don't found data in memo.");
      
    }
    else{
      const addNewData = await db.collection("Memo").doc(documentID).set(data);
      res.status(200).json(data);
    }
  }
  catch (err){
    console.log(err);
  }
})

app.get("/checkMiddleWare",checkAuth,(req,res)=>{
  res.status(200).send("passCheckMiddleWare");
})