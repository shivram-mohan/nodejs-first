// // import Math from "Math"
// import http from "http"
// import fs from "fs"
// // const ballu = require("./random")
// import {generateLovePercent} from "./random.js"
// import path from "path"


// const home =fs.readFileSync("./index.html")
// console.log(path.extname("/home/random/index.html")) // use path for different uses
// console.log(path.dirname("/home/random/index.html"))
// const server = http.createServer((req,res)=>{
//     // console.log("servered")
//     // res.end("<h1>whats up nigga</h1>")

//     if(req.url === "/about"){
//         res.end(`<h1> Love is ${generateLovePercent()} </h1>`)
//     }
//     else if(req.url === '/'){
//         // fs.readFile("./index.html", (err, home)=>{
//         //     res.end(home)
//         // })
//         res.end(home);
        
//     }
//     else if(req.url === '/contact'){
//         res.end("Contact page")
//     }
//     else{
//         res.end("Page not found")
//     }
// });

// server.listen(800,()=>{
//     console.log("Server is working");
// });

import { name } from "ejs"
import express from "express"
import fs from "fs"
import path from "path"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt" //for encryption of the password
const app = express()

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
}).then(()=> console.log("Database Connected")).catch((e)=>console.log(e));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
})//schema is basically logically assigning 

const User = mongoose.model("User", userSchema)//sending message to the name. email

// const users = []; // temporary array for storing data

//for static allocation, which means it wont change, can be used for css files, as athat file can be connected from any directory, and can be availed publically
app.use(express.static(path.join(path.resolve(),"public")));
//middlewear for post!
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())

//this is to set engine for ejs files, agar .ejs laga rahe ho tab iski zarurat nahi
app.set("view engine", "ejs")

const isAuthenticated = async (req, res, next)=>{
    const {token} = req.cookies;
    if(token){
        const decoded = jwt.verify(token, "asdasd");
        req.user = await User.findById(decoded._id)
    }
    else{
        res.redirect("/login")
    }
}

app.get("/", isAuthenticated, (req,res, next)=>{
    // res.send("JaiShriRAm")
    // res.sendStatus(404) for sending status, or codes
    // res.json({
    //     success: true,
    //     products: []
    // }).sendstatus(400)
    // const pathlocation = path.resolve()
    // console.log())
    // const file = fs.readFileSync("./index.html")
    // res.sendFile(path.join(pathlocation,"./index.html"))
    //so basically we can upload html files from here
    // console.log(req.cookies)
    

    // res.sendFile("index") also for static, no need for .html
    
    res.render("logout", {name: req.user.name})

})

app.get("/login", (req,res,next)=>{
    res.render("login");
})
app.get("/register", (req,res, next)=>{
    
    
    res.render("register")

})

app.post("/login", async(req,res)=>{
    const{email,password}= req.body
    let user = await User.findOne({email})
    if(!user) res.redirect("/register")
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch) return res.render("login", {email, message:"Incorrect Password"})

    const token = jwt.sign({_id:user._id}, "asdasd")
    res.cookie("token",token, user._id,{
        httpOnly: true,
        expires: new Date(Date.now() +60*1000 ),
    });
    res.redirect("/")
})
app.post("/register",async(req,res)=>{
    const{name, email, password} = req.body
    let user = await User.findOne({email})
    if(user){
        return res.redirect("/login");
    }
    const hashedPassword = await bcrypt.hash(password,10); 
    user = await User.create({
        name, 
        email,
        password: hashedPassword,
    })
    const token = jwt.sign({_id:user._id}, "asdasd")
    res.cookie("token",token, user._id,{
        httpOnly: true,
        expires: new Date(Date.now() +60*1000 ),
    });
    res.redirect("/")
})
app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.redirect("/")
})
// app.get("/add", async (req,res)=>{
//     await Messge.create({name:"Shiva", email:"ballu22@gmail.com"})
//         res.send("Nice");
//         console.log("NOOj")
    
// })

// app.get("/success",(req,res)=>{
//     res.render("success")
// })

// app.post("/contact", async (req,res)=>{
//     // console.log(req.body)
//     //basically the answers are being posted in the console

//     const {name, email} = req.body;
//     await User.create({ name, email });
//     res.redirect("/success")
// })

// app.get("/users", (req,res)=>
// {
//     res.json({
//         users,//at first it will be empty, but when you enter some details in the site, the name and email will be shown in /users
//     })
// })

app.listen(5000,()=>{
    console.log("server is working")
})