const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const jwt = require("jsonwebtoken");

const transport = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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"
    }
  })
);

const { User, createUserSchema, updateUserSchema } = require("../Models/User");

const createUser = isSendMail => {
  return async (req, res) => {
    //mình sẽ kiểm tra ngay đầu tiên luôn, nếu sai format data thì ko làm gì thêm, req.body chinh là object được gửi lên
    const validationResult = createUserSchema.validate(req.body);

    if (validationResult.error) {
      return res
        .status(422)
        .send({ message: "Validation fail!", data: validationResult.error });
    }
    // lấy data từ client gửi lên
    const { name, email, password, avatar = "", role } = req.body;

    try {
      const existedUser = await User.findOne({ email });
      if (existedUser)
        return res.status(400).send({ message: "Email already exists!" });

      //hash password
      const hashPassword = await bcrypt.hash(password, 12);

      //create đối tượng user mới từ data client gửi lên và lưu xuống db
      const user = new User({
        name,
        email,
        password: hashPassword,
        avatar,
        role
      });

      const newUser = await user.save();

      if (isSendMail) {
        //send email
        transport.sendMail({
          to: email,
          from: "noreply@xedike.com",
          subject: "Sign up successfully.",
          html: `
                <h1>Welcome to Xedike.vn</h1>
                
            `
        });
      }

      //4. trả res cho client user mới tạo
      res.status(201).send(newUser);
    } catch (error) {
      res.status(500).send(error);
    }
  };
};

//only authenticated users can read user lists
const getUsers = async (req, res) => {
  //return user list
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (e) {
    res.status(500).send();
  }
};

const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) return res.status(404).send();

    res.status(200).send(user);
  } catch (e) {
    res.status(500).send();
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).send();

    res.status(200).send(user);
  } catch (e) {
    res.status(500).send();
  }
};

const updateUserById = async (req, res) => {
  try {
    //validation data gửi lên để update, tuy nhiên cần tạo schema khác, vì mình sẽ ko có required nữa, muốn gửi gì thì gửi, hi hi
    //ở đây mình chỉ cho cập nhật name và avatar thôi nhé. đổi password sẽ có một api khác "reset-password"

    const validateResult = updateUserSchema.validate(req.body);
    if (validateResult.error)
      return res
        .status(422)
        .send({ message: "Validation fail!", data: validateResult.error });

    const userId = req.params.id;

    // {name: 'hieu',age: 12}  => ["name","age"]
    const updateFields = Object.keys(req.body);
    const allowedUpdateFields = ["name", "avatar"];

    const canUpdate = updateFields.every(item =>
      allowedUpdateFields.includes(item)
    );

    if (!canUpdate)
      //chỗ này mình muốn toàn bộ error message trả ra client phải thống nhật format
      return res
        .status(400)
        .send({ message: "Some fields are not allowed to update!" });
    // canUpdate = true || false

    const user = await User.findByIdAndUpdate(userId, req.body, {
      new: true
    });

    if (!user) return res.status(404).send();

    res.status(200).send(user);
  } catch (e) {
    res.status(500).send(e);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  // tìm trong db có user nào có email tương tự
  try {
    const existedUser = await User.findOne({ email });
    if (!existedUser)
      return res
        .status(401)
        .send({ message: "Email or password is incorrect." });

    // so sánh password
    const isCorrectPassword = await bcrypt.compare(
      password,
      existedUser.password
    );

    if (!isCorrectPassword)
      return res
        .status(401)
        .send({ message: "Email or password is incorrect." });

    // tạo ra token
    const token = signToken({
      userId: existedUser._id,
      email: existedUser.email,
      role: existedUser.role
    });
    //trả token về cho client
    res.status(200).send({ token });
  } catch (err) {
    res.status(500).send();
  }
};

const authenticateWithFacebook = (req, res, next) => {
  try {
    const token = signToken({
      userId: req.user._id,
      email: req.user.email,
      role: req.user.role
    });
    console.log("user login facebook", req.user);
    res.status(200).send({ token });
  } catch (e) {
    res.status(500).send();
  }
};
const uploadAvatar = async (req, res) => {
  if (!req.file)
    return res.status(400).send({ message: "Need an image for uploading.Í" });

  try {
    const user = await User.findById(req.userId);

    user.avatar = req.file.path;
    await user.save();

    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
};

const signToken = payload => {
  //sign token
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRED_IN
  });
  return token;
};

module.exports = {
  createUser: createUser,
  getUsers,
  deleteUserById,
  getUserById,
  updateUserById,
  login,
  authenticateWithFacebook,
  uploadAvatar
};
