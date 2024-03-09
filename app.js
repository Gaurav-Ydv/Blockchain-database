const express = require("express");
const expressSession = require("express-session");
const { connectMongoose , User } = require("./conn.js");
const { UserWallet } = require("./conn.js");
const { UserTransaction } = require("./conn.js");
const {CryptoBlockchain , CryptoBlock} = require("./bc.js")
const SHA256 = require("crypto-js/sha256");
const crypto = require('crypto');
const flash = require("express-flash");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(expressSession({ secret: "secret", resave:false, saveUninitialized:false, cookie:{maxAge:600000}}
));
app.use(express.static("public"));
app.use(flash());


app.set("view engine","ejs");
connectMongoose();

app.get("/",(req,res)=>{
    res.render("index",{messages:req.flash()});
})

app.get("/about",(req,res)=>{
    res.render("about");
})

app.get("/service",(req,res)=>{
    res.render("service");
})

app.get("/team",(req,res)=>{
    res.render("team");
})

app.get("/why",(req,res)=>{
    res.render("why");
})

app.get("/login",(req,res)=>{
    res.render("login",{messages:req.flash()});
})

app.get("/register",(req,res)=>{
    res.render("register",{messages:req.flash()});
})

app.get("/vault",(req,res)=>{
    res.render("vault",{messages:req.flash()});
})

app.get("/mywallet",(req,res)=>{
    res.render("mywallet",{messages:req.flash()});
})

app.get("/mywalletopened",(req,res)=>{
    res.render("mywallet",{userid});

})

app.get("/transactions",(req,res)=>{
    res.render("transactions",{messages:req.flash()});
})


app.post("/register",async (req,res)=>{
    const user = await User.findOne({username : req.body.username});  
    if(!req.body.username || !req.body.password){
        req.flash("error","Email and Password are required");
        return res.redirect("/register");
    }
    else if(req.body.password.length<8){
        req.flash("error","Password must be of atleast 8 characters");
        return res.redirect("/register");
    }
    else{
    if(user!=null){
        req.flash("error","User already exists");
         return res.redirect("/register");
    }
    else{
        const newUser = await User.create(req.body);
        req.flash("success","Registered succesfully");
    res.redirect("/login");
    }
    }
   
})

app.post("/login",async (req,res)=>{  

    if(!req.body.username || !req.body.password){
        req.flash("invalid","Email and Password are required");
        return res.redirect("/login");
    }
    else if(req.body.password.length<8){
        req.flash("invalid","Password must be of atleast 8 characters");
        return res.redirect("/login");
    }
    else{
        const user = await User.findOne({username : req.body.username}); 
        if(user!=null){
            if(user.password == req.body.password){
                req.flash("success",`welcome `+` ${user.firstName}`);
                return res.redirect("/login");
            }
            else{
                req.flash("error","password does'nt matched");
            return res.redirect("/login");}
        }
        else{
            req.flash("error","user not found");
        return res.redirect("/login");}

    }
})

app.post("/vault",async (req,res)=>{
    const user = await req.body.username;
    const userRegister = await User.findOne({username : user});  
    const userRepeat = await UserWallet.findOne({username : user});  
    if(userRegister!=null){
        if(userRepeat==null){
              const newWalltet = await UserWallet.create(req.body);
        req.flash("success",`Wallet created successfully`);
        res.redirect("/vault");
        }
        else{
            req.flash("error",`Wallet already created`);
        res.redirect("/vault");
        }
    }
    else{
        req.flash("error",`User not registered`);
        res.redirect("/vault");
    }
})

app.post("/mywallet",async (req,res)=>{
     const user = await UserWallet.findOne({username : req.body.username});  
        if(user!=null){
           if(req.body.pin == user.pin){
            res.render("mywalletopened",{name:user.firstName , balance: user.balance});
           }
           else{
            req.flash("error",`Incorrect PIN`);
            res.redirect("/mywallet");
           }
        }
        else{
            req.flash("error",`!Wallet not found!`);
            res.redirect("/mywallet");
        }
})

app.post("/mywalletopened",(req,res)=>{
    res.render("transactions",{messages:req.flash()});
})

app.post("/transactions",async (req,res)=>{

            //credit and debit in the user's wallets
            const user1 = await UserWallet.findOne({username : req.body.ud1});  
            const user2 = await UserWallet.findOne({username : req.body.ud2});   
    
            if(user1!=null && user2!=null){
                if(user1.pin == req.body.pin){

                    const obj = await new CryptoBlockchain();
                    await obj.addNewBlock( new CryptoBlock(`${req.body.date}`,{
                        sender : `${req.body.sendername}`,
                        recepient : `${req.body.recepientname}`,
                        amount : req.body.amount,
                       }));
                    user1.balance =  parseFloat(user1.balance) - parseFloat(req.body.amount);
                    await user1.save();
                    user2.balance =  parseFloat(user2.balance) + parseFloat(req.body.amount);
                    await user2.save();
                    // const newTransact = await UserTransaction.create(req.body);
                    req.flash("success",`Transaction to ${user2.firstName} completed`);
                    res.redirect("/transactions");
                    // console.log(obj.blockchain);
                }
                else{
                    req.flash("error",`Wrong PIN entered`);
                    res.redirect("/transactions");
                }
            }
            else{
                req.flash("error",`Transaction to ${req.body.recepientname} failed`);
                res.redirect("/transactions");
            }

})

// const obj = new CryptoBlockchain();
// console.log("the blockchain mining in process");
//  obj.addNewBlock(
//     new CryptoBlock("17/01/2024",{
//         sender : `krishan`,
//         recepient : `shivam`,
//         amount : 200,
//     })
// )
// obj.addNewBlock(
//     new CryptoBlock("17/01/2024",{
//         sender : `krishan`,
//         recepient : `shivam`,
//         amount : 100,
//     })
// )
// console.log(obj.blockchain);

const port = process.env.PORT || 5500;
app.listen(port, () => {
  console.log(`App is running on port http://localhost:5500`);
});