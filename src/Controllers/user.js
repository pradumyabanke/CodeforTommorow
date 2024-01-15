const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserRegister = require("../Models/userRegistered");
const userRegistered = require("../Models/userRegistered");


//=========================[ Create User ]===========================/

const createUser = async function (req, res) {
    try {
        let data = req.body;
        let { username, email, password } = data;

        if (await UserRegister.findOne({ username: username }))
            return res
                .status(400)
                .send({ status: false, message: "username already exist" });

        if (await UserRegister.findOne({ email: email }))
            return res
                .status(400)
                .send({ status: false, message: "Email already exist" });

        const encryptedpassword = bcrypt.hashSync(password, 12);
        req.body["password"] = encryptedpassword;

        var token = jwt.sign(
            {
                userId: userRegistered._id,

            },
            "project"
        );
        data.token = token;

        let saveData = await userRegistered.create(data);
        res.status(201).send({
            status: true,
            msg: "User Register successfully",
            data: {
                _id: saveData._id,
                username: saveData.username,
                email: saveData.email,
                password: saveData.password,
                token: saveData.token,
            },
        });
    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
};


//=========================[ User Login ]============================/

const userLogin = async function (req, res) {
    try {
        let data = req.body;
        let { email, password } = data;

        let userExists = await userRegistered.findOne({ email: email });

        if (!userExists) {
            return res.status(400).send({
                status: false,
                msg: "Email and Password are Invalid",
            });
        }

        let compared = await bcrypt.compare(password, userExists.password);
        if (!compared) {
            return res.status(400).send({
                status: false,
                msg: "Your Password is Invalid",
            });
        }

        var token = jwt.sign(
            {
                userId: userExists._id,
            },
            "project"
        );

        let updateToken = await userRegistered.findByIdAndUpdate(
            { _id: userExists._id },
            { token },
            { new: true }
        );

        userExists.token = updateToken.token;

        return res.status(200).send({
            status: true,
            msg: "User Login Successfully",
            data: userExists,
        });
    } catch (error) {
        return res.status(200).send({
            status: true,
            msg: error.message,
        });
    }
};





//=========================

module.exports = {
    createUser,
    userLogin,
}