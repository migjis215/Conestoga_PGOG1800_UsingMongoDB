/*
    index.js
    Assignment 4

    Revision History
        Jisung Kim, 2021.04.15: Created 
*/
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/jkgames', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Order = mongoose.model('Order', {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    province: String,
    postCode: String,
    deliveryCost: Number,
    product1Name: String,
    product1Count: Number,
    product1Price: Number,
    product1Cost: Number,
    product2Name: String,
    product2Count: Number,
    product2Price: Number,
    product2Cost: Number,
    product3Name: String,
    product3Count: Number,
    product3Price: Number,
    product3Cost: Number,
    subTotal: Number,
    taxRate: Number,
    taxes: Number,
    total: Number
})

const { check, validationResult } = require('express-validator');

var myApp = express();

var isEntered = false;
var validation = "";
var products = [
    ["Game Station", 3, 629.96],
    ["Max Box", 3, 599.96],
    ["Do Switch", 1000, 399.96]
];
var allTaxRate = {
    'AB': 0.05, 'BC': 0.12, 'MB': 0.12, 'NB': 0.15, 'NL': 0.15,
    'NT': 0.05, 'NS': 0.15, 'NU': 0.05, 'ON': 0.13, 'PE': 0.15,
    'QC': 0.14975, 'SK': 0.11, 'YT': 0.05
}

function capitalize(_string) {
    var words = _string.toLowerCase().split(" ");
    var result = "";

    for (var i = 0; i < words.length; i++) {
        if (words[i] != "") {
            result += " " + words[i].substring(0, 1).toUpperCase();
            result += words[i].substring(1);
        }
    }

    return result.trim();
}

myApp.set('views', path.join(__dirname, 'views'));
myApp.set('view engine', 'ejs');

myApp.use(express.static(__dirname + '/public'));
myApp.use(express.urlencoded({ extended: false }));
myApp.use(express.json());

myApp.get('/', function (req, res) {
    res.render('form');
});

myApp.get('/form', function (req, res) {
    res.render('form');
});

myApp.get('/orders', function (req, res) {
    Order.find({}).exec(function (err, orders) {
        res.render('orders', { orders: orders });
    });
});

myApp.post('/form', [
    check('fullName', "Please enter a full name separated by spaces.")
        .trim()
        .contains(" "),
    check('email', "Invalid email address.")
        .trim()
        .isEmail()
        .toLowerCase(),
    check('phone', "Invalid phone number.")
        .trim()
        .matches(/^\(?(\d{3})[\)\-]?[\.\-\/\s]?(\d{3})[\.\-\/\s]?(\d{4})$/),
    check('address', "Please enter your address.")
        .trim()
        .not().isEmpty(),
    check('city', "Please enter the city.")
        .trim()
        .not().isEmpty(),
    check('province', "Please select your province.")
        .trim()
        .not().isEmpty(),
    check('postCode', "Invalid postal code.")
        .trim()
        .toUpperCase()
        .matches(/^[ABCEGHJKLMNPRSTVXY][0-9][ABCEGHJKLMNPRSTVWXYZ] ?[0-9][ABCEGHJKLMNPRSTVWXYZ][0-9]$/),
    check('product1')
        .trim()
        .custom(function (value) {
            isEntered = false;
            var regularInteger = /^[0-9]+$/;
            if (value != "") {
                if (!regularInteger.test(value) || value < 0) {
                    isEntered = true;
                    throw new Error(products[0][0] +
                        ": Please enter only a number greater than 0 for the order quantity.");
                }
                else if (parseInt(value) > products[0][1]) {
                    isEntered = true;
                    throw new Error(products[0][0] +
                        ": Currently, only " + products[0][1] + " or less are available for purchase.");
                }
                isEntered = true;
            }
            return true;
        }),
    check('product2')
        .trim()
        .custom(function (value) {
            var regularInteger = /^[0-9]+$/;
            if (value != "") {
                if (!regularInteger.test(value) || value < 0) {
                    isEntered = true;
                    throw new Error(products[1][0] +
                        ": Please enter only a number greater than 0 for the order quantity.");
                }
                else if (parseInt(value) > products[1][1]) {
                    isEntered = true;
                    throw new Error(products[1][0] +
                        ": Currently, only " + products[1][1] + " or less are available for purchase.");
                }
                isEntered = true;
            }
            return true;
        }),
    check('product3')
        .trim()
        .custom(function (value) {
            var regularInteger = /^[0-9]+$/;
            if (value != "") {
                if (!regularInteger.test(value) || value < 0) {
                    isEntered = true;
                    throw new Error(products[2][0] +
                        ": Please enter only a number greater than 0 for the order quantity.");
                }
                else if (parseInt(value) > products[2][1]) {
                    isEntered = true;
                    throw new Error(products[2][0] +
                        ": Currently, only " + products[2][1] + " or less are available for purchase.");
                }
                isEntered = true;
            }
            if (!isEntered) {
                throw new Error("Please enter the number you want to purchase for at least one product.")
            }
            return true;
        }),
    check('deliveryTime', "Please select the delivery time.")
        .trim()
        .not().isEmpty()
],
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('form', {
                errors: errors.array(),
                fullName: req.body.fullName,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                city: req.body.city,
                province: req.body.province,
                postCode: req.body.postCode,
                product1: req.body.product1,
                product2: req.body.product2,
                product3: req.body.product3,
                deliveryTime: req.body.deliveryTime,
                validation: ""
            });
        }
        else {
            validation = "complete";
            var fullName = capitalize(req.body.fullName);
            var email = req.body.email;
            var phone = req.body.phone;
            var address = capitalize(req.body.address);
            var city = capitalize(req.body.city);
            var province = req.body.province;
            var postCode = req.body.postCode;
            var product1 = req.body.product1;
            if (product1 == "") {
                product1 = 0;
            }
            var product2 = req.body.product2;
            if (product2 == "") {
                product2 = 0;
            }
            var product3 = req.body.product3;
            if (product3 == "") {
                product3 = 0;
            }
            var deliveryTime = parseFloat(req.body.deliveryTime).toFixed(2);
            var product1Name = products[0][0];
            var product2Name = products[1][0];
            var product3Name = products[2][0];
            var product1Price = parseFloat(products[0][2]).toFixed(2);
            var product2Price = parseFloat(products[1][2]).toFixed(2);
            var product3Price = parseFloat(products[2][2]).toFixed(2);
            var product1Cost = parseFloat(product1 * product1Price).toFixed(2);
            var product2Cost = parseFloat(product2 * product2Price).toFixed(2);
            var product3Cost = parseFloat(product3 * product3Price).toFixed(2);
            var subTotal = (parseFloat(product1Cost) + parseFloat(product2Cost) + parseFloat(product3Cost) + parseFloat(deliveryTime)).toFixed(2);
            var taxRate = parseFloat(allTaxRate[province]);
            var taxes = parseFloat(subTotal * taxRate).toFixed(2);
            var total = (parseFloat(subTotal) + parseFloat(taxes)).toFixed(2);

            var formattedPhone = "";
            for (var i = 0; i < phone.length; i++) {
                if (!isNaN(phone[i]) && phone[i] != " ") {
                    formattedPhone += phone[i];
                }
            }
            formattedPhone =
                "(" + formattedPhone.substring(0, 3) + ") " +
                formattedPhone.substring(3, 6) + "-" +
                formattedPhone.substring(6);
            phone = formattedPhone;

            var newOrder = new Order({
                fullName: fullName,
                email: email,
                phone: phone,
                address: address,
                city: city,
                province: province,
                postCode: postCode,
                deliveryCost: deliveryTime,
                product1Name: product1Name,
                product1Count: product1,
                product1Price: product1Price,
                product1Cost: product1Cost,
                product2Name: product2Name,
                product2Count: product2,
                product2Price: product2Price,
                product2Cost: product2Cost,
                product3Name: product3Name,
                product3Count: product3,
                product3Price: product3Price,
                product3Cost: product3Cost,
                subTotal: subTotal,
                taxRate: taxRate,
                taxes: taxes,
                total: total
            });
            newOrder.save().then(() => console.log('New order information saved'));

            res.render('invoice', {
                fullName: fullName,
                email: email,
                phone: phone,
                address: address,
                city: city,
                province: province,
                postCode: postCode,
                product1: product1,
                product2: product2,
                product3: product3,
                deliveryTime: deliveryTime,
                validation: validation,
                product1Name: product1Name,
                product2Name: product2Name,
                product3Name: product3Name,
                product1Price: product1Price,
                product2Price: product2Price,
                product3Price: product3Price,
                product1Cost: product1Cost,
                product2Cost: product2Cost,
                product3Cost: product3Cost,
                subTotal: subTotal,
                taxRate: taxRate,
                taxes: taxes,
                total: total
            });
        }
    }
);

myApp.listen(8080);
console.log('My site is running at http://localhost:8080');