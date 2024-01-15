const express = require("express");
const Router = express.Router();
const bodyParser = require("body-parser");
const Controller = require("../Controllers/user");
const Middleware = require("../Middleware/auth")



Router.post("/createUser", Controller.createUser)
Router.post("/userLogin", Controller.userLogin)





Router.use(bodyParser.json());
Router.use(bodyParser.urlencoded({ extended: true }));



//=================== [ Checking your end point valid or not ]======================/

Router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        message: "Make sure Your Endpoint is correct or not"
    })
});


module.exports = Router;