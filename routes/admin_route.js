var express = require('express');
var exe = require('./../connection')
var router = express.Router();

router.get("/",function(req,res){
    res.render("admin/home.ejs")
})

router.get("/product_brands",async function(req,res)
{
    var sql = "select * from product_brands"
    var brands = await exe(sql)
    res.render("admin/product_brands.ejs",{brands})
});

router.post("/save_product_brand",async function(req,res)
{
    var product_brand_name = req.body.product_brand_name;
    var sql = "insert into product_brands (product_brand_name) values (?)";
    var result = await exe(sql,[product_brand_name])
    res.redirect("/admin/product_brands")
});




router.get("/product_styles",async function(req,res){
    var sql = `SELECT * FROM product_styles`;
    var styles = await exe(sql);
    res.render("admin/product_styles.ejs",{styles});

})
router.post("/save_product_style",async function(req,res)
{
    var file_name = '';
    if(req.files)
    {
        var file_name = new Date().getTime()+req.files.product_style_image.name;
        req.files.product_style_image.mv("public/styles/"+file_name)
    }

    try{
    var sql = `INSERT INTO product_styles (product_style_name, product_style_image)VALUES (?, ?)`;
    var result = await exe (sql,[req.body.product_style_name, file_name]);
    }catch(err){}
    // res.send(req.body);
    res.redirect("/admin/product_styles")
})




router.get("/product_types",async function(req,res){
    var sql = `SELECT * FROM product_types`;
    var types = await exe(sql);
    res.render("admin/product_types.ejs",{types});

})
router.post("/save_product_type",async function(req,res)
{
    var file_name = '';
    if(req.files)
    {
        var file_name = new Date().getTime()+req.files.product_type_image.name;
        req.files.product_type_image.mv("public/types/"+file_name)
    }

    try{
    var sql = `INSERT INTO product_types (product_type_name, product_type_image)VALUES (?, ?)`;
    var result = await exe (sql,[req.body.product_type_name, file_name]);
    }catch(err){}
    // res.send(req.body);
    res.redirect("/admin/product_types")
})





router.get("/add_product", async function(req, res)
{
        var brands = await exe(`SELECT * FROM product_brands`);
        var styles = await exe(`SELECT * FROM product_styles`);
        var types = await exe(`SELECT * FROM product_types`);
        res.render("admin/add_product.ejs", { brands, styles, types });

    })

    router.post("/save_product",async function(req,res)
    {
        try{
        var file_name = '';
        var d = req.body;
        if(req.files)
        {
             var file_name = new Date().getTime()+req.files.product_main_image.name;
             req.files.product_main_image.mv("public/products/"+file_name)
    
        }

        var apply_discount_percent = 100 - Number(d.product_price) * 100 / Number(d.product_market_price);
            console.log(apply_discount_percent);


        var sql = `INSERT INTO products(product_name, product_market_price, product_price, product_is_trending, product_style_id, product_brand_id, product_for, product_stock, product_color, product_description, product_main_image, apply_discount_percent, product_type_id)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`;


        var result = await exe(sql,[
        d.product_name,
        d.product_market_price,
        d.product_price,
        d.product_is_trending,
        d.product_style_id,
        d.product_brand_id,
        d.product_for,
        d.product_stock,
        d.product_color,
        d.product_description,
        file_name,
        d.apply_discount_percent,
        d.product_type_id
    ]);
}catch(err){}

    // res.send(req.body);
    res.redirect("/admin/add_product")

    })




    router.get("/product_list",async function(req,res){

var sql = `SELECT * FROM products, product_brands, product_types, product_styles WHERE
    products.product_brand_id = product_brands.product_brand_id AND
    products.product_type_id = product_types.product_type_id AND
    products.product_style_id = product_styles.product_style_id 
`;
var products = await exe(sql);
// res.send(products);
    res.render("/admin/product_list.ejs",{products})
})


router.get("/slider_images",function(req,res){
    res.render("admin/slider_images.ejs");
})

router.post("/save_slider",async function(req,res){
    console.log(req.files);
    var file_name = "";
    if(req.files)
    {
        var file_name = new Date().getTime()+req.files.slider_image.name;
        req.files.slider_image.mv("public/"+file_name);
    }
   var d = req.body;
    var sql = `INSERT INTO slider VALUES (?,?,?,?,?,?)`;
    var result = await exe(sql,[null, file_name, d.slider_title, d.slider_description, d.slider_button_text, d.slider_button_link]);
    res.send(result);
    res.redirect("/admin/slider_image")
})






module.exports = router;