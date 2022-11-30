const express = require('express')
const session = require('express-session')
const app = express()
const multer = require('multer');
let ejs = require('ejs');
let fs = require('fs');
const mongoose = require("mongoose");
const {MongoClient} = require('mongodb')
const upload = multer({dest:'uploads/'})
const sendEmail = require('./methods/sendEmail');
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
}))

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
	id:Number,
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
	let page = "Home";
	if(req.session.logged){
	dp.find({},function(err,data){
		let user = data
		res.render("index.ejs",{name:req.session.userName,openPage:page,logged:req.session.logged,data1:user});
	})
	}
	else{
		res.redirect("/login")
	}
})

app.route('/signUp').get(function(req, res){
	if(req.session.logged != true){
		let page = "SignUp";
		res.render("index.ejs",{name:myName,openPage:page});
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
				console.log(data);
				asd.save();
				res.sendFile(__dirname+"/thanks.html")
				return;
			}
		}
	})
})

app.route('/login').get(function(req, res){
	if(req.session.logged != true){
		let page = "Login";
		res.render("index.ejs",{name:myName,openPage:page,logged:"false"});
	}
	else{
		res.redirect("/")
	}
})
.post(function(req,res){
	loginFlag = false
	let loginData = req.body;
	ap.find({},function(err,data){
		let newData = data;
		newData.forEach(function(user){
			if(user.username == loginData.username && user.password == loginData.password){
				req.session.logged = true;
				req.session.userName = user.name;
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


app.get("/getData",function(req,res){
	dp.find({},function(err,data){
		res.end(data);
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

		// newData.forEach(function(datas){
		// 	if(datas.userName == email){
		// 		datas.password = password;
		// 		ap.updateOne({username:datas.userName},{password:datas.password},function(err,result){
		// 			console.log(result)
		// 		})
		// 	}
		// })

	})
	res.send("Successfull");
})

app.post("/addData",function(req,res){
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
	res.end();
})

app.get("/myCart",function(req,res){
	 hp.findOne({userName:req.session.userName},function(err,data){
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