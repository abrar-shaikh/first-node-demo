var userModel = require('./user_model')
var classModel = require('./class_model');
var historyModel = require('./history_model')
var random = require('randomstring')
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
var config = require('./config.js')

module.exports = {

    "registerUser": (req, res) => {
        var referral = req.query.referral;
        if (req.body.firstName && req.body.email && req.body.role) {
            if (referral) {
                userModel.findOne({ email: req.body.email }, (err, data) => {
                    if (err) {
                        res.json({ code: 500, message: "Internal server error" })
                    }
                    else if (data) {
                        res.json({ code: 400, message: "User already registered" })
                    }
                    else {
                        userModel.findOneAndUpdate({ referralcode: referral }, { $inc: { point: 20 } }, (err, result) => {

                            if (err) {
                                res.json({ code: 500, message: "Internal server error" })
                            }
                            else if (!result) {
                                res.json({ code: 404, message: "referred user not found" })
                            }
                            else {
                                let Model = new userModel(req.body)
                                let history = new historyModel()
                                Model.point = Model.point + 100;
                                Model.referralcode = random.generate({ length: 15 })
                                Model.password = bcrypt.hashSync(req.body.password, 7)
                                Model.save((err, data) => {
                                    if (err) {
                                        res.json({ code: 500, message: "Internal server error" })
                                    }
                                    else {
                                        userModel.findOne({ firstName: req.body.firstName }, (err, result) => {
                                            console.log("result", result)
                                            if (err) {
                                                res.json({ code: 400, message: "failed to create sign up record" })
                                            }
                                            else if (!result) {
                                                res.json({ code: 404, message: "user details not found for creating signup record" })
                                            }
                                            else {
                                                history.userId = result._id
                                                history.dateTime = result.createdAt
                                                history.operation = "SIGNUP"
                                                history.save((err, success) => {
                                                    return (err) ? res.json({ code: 500, message: "Internal server error" }) : res.json({ code: 200, message: "registred", data: data })
                                                })
                                            }
                                        })
                                    }
                                })

                            }
                        })
                    }
                })
            }
            else {
                userModel.findOne({ email: req.body.email }, (err, data) => {
                    if (err) {
                        res.json({ code: 500, message: "Internal server error" })
                    }
                    else if (data) {
                        res.json({ code: 400, message: "User already registered" })
                    }
                    else {
                        let Model = new userModel(req.body);
                        let history = new historyModel()
                        Model.referralcode = random.generate({ length: 15 })
                        Model.password = bcrypt.hashSync(req.body.password, 7)
                        Model.save((err, data) => {
                            if (err) {
                                res.json({ code: 500, message: "Internal server error" })
                            }
                            else {
                                userModel.findOne({ firstName: req.body.firstName }, (err, result) => {
                                    console.log("result", result)
                                    if (err) {
                                        res.json({ code: 400, message: "failed to create sign up record" })
                                    }
                                    else if (!result) {
                                        res.json({ code: 404, message: "user details not found for creating signup record" })
                                    }
                                    else {
                                        history.userId = result._id
                                        history.dateTime = result.createdAt
                                        history.operation = "SIGNUP"
                                        history.save((err, success) => {
                                            return (err) ? res.json({ code: 500, message: "Internal server error" }) : res.json({ code: 200, message: "registred", data: data })
                                        })
                                    }
                                })
                            }
                        })

                    }
                })

            }
        }
        else {
            return res.json({ code: 400, messge: "Invalid request body. First name, Email and Role are required feilds." })
        }

    },

    "getUser": (req, res) => {
        var token = req.headers['authorization']
        if (!token) {
            res.json({ code: 401, message: "no token provided" })
        }
        jwt.verify(token, config.token_secret, (err, verify) => {
            if (verify) {
                userModel.findById(req.params.id).populate({ path: 'classes', select: 'name' }).exec((err, data) => {
                    return (err) ? res.json({ code: 500, message: "Internal server error" }) : res.json({ code: 200, message: "success", data: data })
                })
            }
            else{
                return res.json({code:403,message:"tokken expired"})
            }
        })
    },

    "login": (req, res) => {
        if (req.body.email && req.body.password) {
            userModel.findOne({ email: req.body.email }, (err, result) => {
                if (err) {
                    return res.json({ code: 500, message: "Internal server error" })
                }
                else if (!result) {
                    return res.json({ code: 400, message: "This email is not registered." })
                }
                else {
                    if (bcrypt.compareSync(req.body.password, result.password)) {
                        let history = new historyModel()
                        history.userId = result._id
                        history.dateTime = Date.now()
                        history.operation = "LOGIN"
                        history.save((err) => {
                            if (err) {
                                return res.json({ code: 500, message: "Error in add login record" })
                            }
                            var obj = {
                                id: result._id,
                                email_id: req.body.email
                            }
                            var token = jwt.sign(obj, config.token_secret, { expiresIn: '1hr' })
                            return res.json({ code: 201, message: "success", token: token })
                        })
                    }
                    else {
                        return res.json({ code: 401, message: "you entered wrong password" })
                    }
                }
            })
        }
        else {
            return res.json({ code: 400, message: "Invalid request body, Email and password are required" })
        }
    },

    "updateUser": (req, res) => {
        userModel.findById(req.params.id, (err, data) => {
            if (err) {
                return res.json({ code: 500, message: "Internal server error" })
            }
            else if (!data) {
                return res.json({ code: 404, message: "User not found" })
            }
            else {
                userModel.updateOne({ _id: req.params.id }, { $set: req.body }, (err, data) => {
                    return (err) ? res.json({ code: 500, message: "Internal server error" }) : res.json({ code: 200, message: "updated", data: data })
                })
            }
        })
    },

    "registerClass": (req, res) => {
        var Model = new classModel(req.body);
        if (Model.name && Model.price && Model.ownerId) {
            Model.save((err, data) => {
                console.log(err)
                return (err) ? res.json({ code: 500, message: "Internal server error" }) : res.json({ code: 201, message: "success", data: data })
            })
        }
        else {
            return res.json({ code: 400, message: "Invalid request body. Name,price and owner_id is  required" })
        }
    },

    "buyClass": (req, res) => {
        var user;
        var classData;
        userModel.findById(req.params.userId, (err, data) => {
            user = data
            classModel.findById(req.params.classId, (err, data) => {
                classData = data
                console.log(classData)
                if (user.role == "STUDENT") {
                    //if (!user.classes.includes(classData._id)) {
                    if (classData.status == "ACTIVE") {
                        if (classData.price < user.point) {
                            var newPoint = user.point - classData.price
                            userModel.updateOne({ _id: user.id }, { $set: { point: newPoint }, $addToSet: { classes: classData.id } }, (err, data) => {
                                console.log("err ", err)
                                return (err) ? res.json({ code: 500, message: "Internal server error" }) : res.json({ code: 200, message: "Successfully Buyed..", data: data })
                            })
                        }
                        else {
                            return res.json({ code: 400, message: "Not enough balance" })
                        }
                    }
                    else {
                        return res.json({ code: 400, message: "Class is not active" })
                    }
                    /*}
                    else {
                        return res.json({ code: 400, message: "Class is already buyed by this user" })
                    }*/
                }
                else {
                    return res.json({ code: 400, message: "Invalid user" })
                }
            })

        })

    }
}