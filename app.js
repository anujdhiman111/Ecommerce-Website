const express = require('express')
const session = require('express-session')
const app = express()
const multer = require('multer');
let ejs = require('ejs');
let fs = require('fs');
const mongoose = require("mongoose");
const {MongoClient} = require('mongodb')
const upload = multer({dest:'uploads/'})
key = 0;

const port = 3001
let flag,loginFlag = false
let loginUser = "";

app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(express.static("uploads"))
app.use(express.static("public"));
app.set('view engine','ejs');
let myName;

app.use(session({
	secret:'Pro Programmer',
	resave:false,
	saveUninitialized:true,
	logged:false,
	admin:false,
	clickAdmin:false
}))

let admin = {
	name:"Anuj",
	user:"anuj@gmail.com",
	password:"anujdhiman"
}

mongoose.connect('mongodb://localhost:27017/test').
  catch(error => handleError(error));

  const ap = mongoose.model('user',{
	name : String,
	username:String,
	password:String
});

  const dp = mongoose.model('product',{
	inputText : String,
	inputPrice:Number,
	picName : String,
	// id:Number,
	desc:String
});

const hp = mongoose.model('cart',{
	userName : String,
	userProduct:Array
});

const mp = mongoose.model('cartSchema',{
	name:String,
	price:String,
	img:String,
	id1:String,
	quantity:Number
})

app.get('/', (req, res) => {
	req.session.clickAdmin = undefined;
	let page = "Home";
	dp.find({},function(err,data){
		let user = data
		res.render("index.ejs",{name:req.session.userName,openPage:page,logged:req.session.logged,data1:user});
	})
})

app.get('/admin',(req,res)=>{
	if(req.session.logged === undefined){
		req.session.clickAdmin = true;
		res.redirect('/login');
	}
	else{
		if(req.session.user == admin.user){
			res.render("admin.ejs")
		}
		else{
			res.send("You are not a admin please don't try to open Admin Panel otherwise your account will block");
			return;
		}
	}
})
app.post('/admin',upload.single('productImg'),(req,res)=>{
	let obj2 = {
		inputText : req.body.product,
		inputPrice : req.body.price,
		picName : req.file.filename,
		desc : req.body.description
	}
	let newDp = new dp(obj2);
	newDp.save()
res.send("Done");
return;
});

app.route('/signUp').get(function(req, res){
	if(req.session.logged != true){
		let page = "SignUp";
		res.render("index.ejs",{openPage:page});
	}
	else{
		res.redirect("/")
	}
})
.post(function(req,res){
	flag = false;
	ap.find({},function(err,data){
		let users = data;
		if(users.length === 0){
			users = []
			users.push(req.body);
			let asd  = new ap(req.body);
			asd.save();
			res.sendFile(__dirname+"/thanks.html")
			return;
		}
		else{
			users.forEach(function(user){
				if(user.username == req.body.username){
					flag = true;
					res.sendFile(__dirname+"/sameUser.html");
					return;
				}
			})
			if(flag == false){
				let asd = new ap(req.body)
				asd.save();
				res.sendFile(__dirname+"/thanks.html")
				return;
			}
		}
	})
})

app.route('/login').get(function(req, res){
	if(!req.session.logged){

		let page = "Login";
		// res.redirect("/login");
		res.render("index.ejs",{openPage:page,logged:"false"});
		return;
	}
	else{
		// console.log("gghbbj");
		res.redirect("/")
	}
})
.post(function(req,res){
	loginFlag = false
	let loginData = req.body;
	if(req.session.logged === undefined && req.session.clickAdmin === true){
		if(loginData.username === admin.user && loginData.password === admin.password){
			req.session.logged = true;
			req.session.userName = admin.name;
			req.session.user = admin.user;
			res.render("admin.ejs");
		}
		else{
			res.send("Wrong Creditinal");
		}
		return;
	}
	ap.find({},function(err,data){
		let newData = data;
		newData.forEach(function(user){
			if(user.username == loginData.username && user.password == loginData.password){
				req.session.logged = true;
				req.session.userName = user.name;
				req.session.user = user.username;
				loginFlag = true;
				loginUser = user.name
				let page = "Home"
				res.redirect("/")
				return;
			}
		})
		if(loginFlag == false){
			res.sendFile(__dirname+"/wrongCred.html");
			return;
		}
	})
})

app.get("/logout",function(req,res){
	loginFlag = false
	req.session.destroy();
	res.redirect("/")
})

app.get("/myAccount",function(req,res){
	if(loginFlag){
		res.render('index.ejs',{openPage:"myProfile",logged:"true",name:loginUser});
	}
	else{
		res.redirect("/login")
	}
})


app.post("/getData",function(req,res){
	dp.findOne({_id:req.body.key},function(err,data){
		res.json(data.desc)
	})
})

app.get("/countData",function(req,res){
	dp.find({},function(err,data){
		let newData = data
		res.end(JSON.stringify({length:newData.length}));
	})
})

app.post("/filterData",function(req,res){
	let id = parseInt(req.body.id1);
	dp.find({},function(err,data){
		let newData = data;
		let filteredData = []
		filteredData = newData.splice(5*(id-1),5)
		res.end(JSON.stringify(filteredData));
	})
})
app.get("/getForgotPage",function(req,res){
	res.render("forgotPass.ejs",{forgotFlag:false})
	return;
})

app.post("/forgotPassword",function(req,res){
	let email = req.body.username;

	ap.find({},function(err,data){
	 	let newData = data
	 	newData.forEach(function(datas){
	 		if(datas.username == email){
				res.render("forgotPass.ejs",{forgotFlag:true,content:"Email Found..."})
				return;
	 		}
	 	})
	})
})


app.post("/changePassword",function(req,res){
	let email = req.body.username;
	let password1 = req.body.password;
	ap.find({username : req.body.username},function(err,data){
		let newData = data[0];

		ap.updateOne({username:req.body.username},{password: password1},function(err,result){
						console.log(result)
					})
	})
	res.send("Successfull");
})

app.post("/addData",function(req,res){

	if(req.session.logged === true){
		let newHp = new hp();
		newHp.userName = req.session.userName;
		let newMp = new mp(req.body);
		hp.findOne({userName:req.session.userName},function(err,cart){
			if(!cart){
				newHp.userProduct.push(newMp);
				newHp.save();
			}
			else{
				let duplicateFlag = false;
				for(let i = 0;i<cart.userProduct.length;i++){
					if(cart.userProduct[i].id1 == req.body.id1){
						duplicateFlag = true;
					}
				}
				if(!duplicateFlag){
					newHp.userProduct.push(newMp);
					cart.userProduct.push(newMp);
					hp.updateOne({userName:req.session.userName},{userProduct:cart.userProduct},function(err,result){
					})
				}
			}
		})
	}
	else{
		res.redirect("/login")
	}
	res.end();
})

app.get("/myCart",function(req,res){
	 hp.findOne({userName:req.session.userName},function(err,data){
		if(data === null){
			res.render("cart.ejs",{data:null,cartFlag:false});
			return;
		}
		let finalData = data.userProduct.length;
		if(finalData){
			let Data = data.userProduct;
			res.render("cart.ejs",{data:Data,cartFlag:true});
		}
		else{
			res.render("cart.ejs",{data:null,cartFlag:false});
		}
	})
})

app.post("/changeContent",function(req,res){
	hp.findOne({userName:req.session.userName},function(err,data){
		let newData,Price;
		if(req.body.btn == "+"){
			newData = data.userProduct;
			newData.forEach(function(datas){
				if(datas.id1 === `cart${req.body.id1}`){
					let oneUnit = Math.floor((parseInt(datas.price.slice(1)))/datas.quantity)
					datas.quantity++;
					Price = (parseInt(datas.price.slice(1)))+oneUnit
					datas.price = `$${Price.toString()}`

				}
			})
			res.end(JSON.stringify({price:Price}))
		}
		else{
			newData = data.userProduct;
			newData.forEach(function(datas){
				if(datas.id1 === `cart${req.body.id1}`){
					let oneUnit = Math.floor((parseInt(datas.price.slice(1)))/datas.quantity)
					datas.quantity--;
					Price = (parseInt(datas.price.slice(1))) - oneUnit
					datas.price = `$${Price.toString()}`
				}
			})
			res.end(JSON.stringify({price:Price}))
		}
		hp.updateOne({userName:req.session.userName},{userProduct:newData},function(err,data){
		})
	})
})

app.post("/deleteProduct",function(req,res){
	hp.findOne({userName:req.session.userName},function(err,data){
		let newData = data.userProduct;
		newData.forEach(function(elem,idx){
			if(elem.id1 == req.body.id1){
				newData.splice(idx,1);
				return
			}
		})
		hp.updateOne({userName:req.session.userName},{userProduct:newData},function(err,data){
		})
		res.end();
	})
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

// a4c00d83a28e6907533cf786e1581a85   (secret key)
// c75f193a60e4988fcc38e3cf42364a06   (api key)
