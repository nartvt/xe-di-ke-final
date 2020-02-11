const mongoose = require("mongoose");
//import thư viện joi
const Joi = require("joi");

//remove validator

const UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  avatar: {
    type: String
  },
  role: [String],
  facebookId: String
});

UserSchema.methods.toJSON = function(){
    const user = this.toObject();
    delete user.password;
    return user;
}

//tạo ra schema để validate
const createUserSchema = Joi.object({
  //name phải là string, required, min la 7, max length là 20, mình đảo lại xíu nhé, cho check required trước
  name: Joi.string()
    .required()
    .min(7)
    .max(20),
  email: Joi.string()
    .required()
    .email(),
  password: Joi.string().required(),
  //yêu cầu avatar truyền xuống phải là một đường dẫn url
  avatar: Joi.string().uri(),
  role: Joi.array().required()
});

const updateUserSchema = Joi.object({
  //name phải là string, required, min la 7, max length là 20, mình đảo lại xíu nhé, cho check required trước
  name: Joi.string()
    .min(7)
    .max(20),
  //yêu cầu avatar truyền xuống phải là một đường dẫn url
  avatar: Joi.string()
});

const User = mongoose.model("User", UserSchema);

// export cả User model lẫn UserSchema
module.exports = { User, createUserSchema, updateUserSchema };
