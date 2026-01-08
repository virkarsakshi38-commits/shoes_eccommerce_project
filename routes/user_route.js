var express = require('express');
var exe = require('./../connection')
var url = require("url");
var sendMail = require("./send_mail");
var cookieParser = require('cookie-parser');

var router = express.Router();

router.get("/",async function(req,res)
{
     var sliders = await exe(`SELECT * FROM slider`);
     var trending_products = await exe(`SELECT * FROM products WHERE product_is_trending = 'yes'`);
     var product_types = await exe (`SELECT * FROM products product_types`);
     var product_styles = await exe (`SELECT * FROM products product_styles`);

     var high_discount_products = await exe (`SELECT * FROM  products ORDER BY apply_discount_percent DESC LIMIT 6 `)

     var packet = {sliders,trending_products,product_types,product_styles,high_discount_products};
    res.render("user/home.ejs",packet)
})


router.get("/product_list",async function(req,res){
var sql = `SELECT * FROM products `;
var url_data = url.parse(req.url,true).query;

if(url_data.cat)
{
    if(url_data.cat == 'Men')
    {
        var sql =`SELECT * FROM products WHERE product_for = 'Male'`;
    }
    if(url_data.cat == 'Women')
    {
        var sql =`SELECT * FROM products WHERE product_for = 'Female'`;
    }
    if(url_data.cat == 'Kids')
    {
        var sql =`SELECT * FROM products WHERE product_for = 'Kids'`;
    }
}

    // res.send(req.url);
    var sql = `SELECT * FROM products `;
    var products = await exe(sql);
    var packet = {products};
    res.render("user/product_list.ejs",packet);
})



router.get("/product_details/:id",async function(req, res)
{
    var id = req.params.id;
    var sql = `SELECT * FROM products WHERE product_id = '${id}'`;
    var info = await exe(sql);
var is_login = (req.session.user_id) ? true : false;
    var packet = {info,is_login};
    res.render("user/product_details.ejs",packet); 
})

router.get("/buy_now/:product_id",check_login,async function(req,res)
{

var url_data = url.parse(req.url,true).query;




    var id = req.params.product_id;
    var sql = `SELECT * FROM products WHERE product_id = ?`;
    var info = await exe(sql,[id]);
    var packet = {info,url_data};

    res.render("user/buy_now.ejs",packet);
})




router.post("/send_otp_mail",function(req,res)
{
    var otp = parseInt(Math.random()*9000+999);
    var subject = `PINK SOLE OTP VERIFICATION : ${otp}`;
   var message = `Your One Time Password (OTP) : ${otp}`;
     sendMail(req.body.email,subject,message);
    req.session.otp = otp;
    req.session.email = req.body.email;
    console.log(otp);
    res.send("OTP SEND");
})


router.post("/verify_otp",async function(req,res){

if(req.session.otp == req.body.otp)
{
    var email = req.session.email;
   var sql = `SELECT * FROM customers WHERE customer_email = '${email}'`;
    var check_customer = await exe(sql);
    if(check_customer.length > 0)
    { 
          req.session.user_id = check_customer[0].customer_id;
         res.send({"status":"success","new_user":false});
    }
    else
    {
        
       var sql2 = `INSERT INTO Customers(customer_email) VALUES ('${email}')`; 
       var result = await exe(sql2);
       req.session.user_id = result.insertId;
       res.send({"status":"success","new_user":true});

    }
}
else
{
    res.send({"status":"False"});
}

})

function check_login(req,res,next)
{
    //
    req.session.user_id = 3;
   if(req.session.user_id)
    next();
else
    res.redirect("/");
}



router.post("/checkout",check_login, async function(req,res)
{

    var d = req.body;
    var customer_id = req.session.user_id;
    var country = 'India';

    var product_info = await exe(`SELECT * FROM products WHERE product_id = '${d.product_id}'`);
    var total_amount = product_info[0].product_price * d.product_qty 
    var payment_method = "Online";
    var payment_status = "Pending";
    var order_date = new Date().toISOString().slice(0,10);
    var order_status = "placed";

    var sql = `INSERT INTO orders (customer_id, fullname, mobile, country, state, city, area, pincode, total_amount, payment_method, payment_status, order_date, order_status) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) `;
    var result = await exe(sql,[customer_id, d.fullname, d.mobile, country, d.State, d.city, d.address, d.pincode, total_amount, payment_method, payment_status, order_date, order_status]);



    var order_id = result.insertId;
    var product_id = d.product_id;
    var product_name = product_info[0].product_name;
    var product_size = d.product_size;
    var product_market_price = product_info[0].product_market_price;
    var product_discount = product_info[0].apply_discount_percent;
    var product_price = product_info[0].product_price;
    var product_qty = d.product_qty;
    var product_total = product_price * product_qty;


var sql2 = `INSERT INTO order_products (order_id, customer_id, product_id, product_name, product_size, product_market_price, product_discount, product_price, product_qty, product_total) 
VALUES (?,?,?,?,?,?,?,?,?,?)`;

var result2 = await exe(sql2,[order_id, customer_id, product_id, product_name, product_size, product_market_price, product_discount, product_price, product_qty, product_total]);


    // res.send(result2);
    res.redirect("/accept_payment/"+order_id);
})

 router.get("/accept_payment/:order_id",check_login,async function(req,res)
 {
    var id = req.params.order_id;
    var sql = `SELECT * FROM orders WHERE order_id = '${id}'`;
    var order_info = await exe(sql);
    var packet = {order_info};
    res.render("user/accept_payment.ejs",packet);
 })

 

 router.post("/payment_success/:order_id",check_login,async function(req,res){

    var id = req.params.order_id;
    var sql = `UPDATE orders SET payment_status = 'paid', transaction_id = '${req.body.
    razorpay_payment_id}' WHERE order_id = '${id}'`;
    var result = await exe(sql);
    // res.send(result);
    res.redirect("/my_orders");
 })

 router.get("/my_orders",check_login,async function(req,res){   
    res.render("user/my_orders.ejs");
 })

 router.get("/add_to_cart/:id",function(req,res){

    var product_id = req.params.id;
    var url_data = url.parse(req.url,true).query;

    if(req.session.user_id)
    {
        console.log('login');
    }
    else
        {
        //    var cart =  req.cookies.cart;
        //    console.log(cart);
        //    var obj = {"product_id":product_id,"qty":url_data.qty,"size":url_data.size};

        //       res.cookie("name","akash")

        //       console.log(req.cookies);
        //       console.log('not login');

        // }

        // res.send(url_data);


        var cart = req.cookies.cart;
    var cart = [];
        }
console.log(cart);
res.cookie("name", "akash");
console.log("Name:", req.cookies.name || "akash");
console.log("Size:", url_data.size);
console.log("not login");

res.send(url_data);

    })





module.exports = router;
