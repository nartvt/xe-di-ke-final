const jwt = require("jsonwebtoken");
const { User } = require("../Models/User");

const authenticate = async (req, res, next) => {
  //lấy token từ header của request
  const tokenStr = req.get("Authorization");
  if (!tokenStr) return res.status(400).send({ message: "No token provider!" });

  const token = tokenStr.split(" ")[1];
  // kiểm tra token (email, expiredIn)

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken);
    const existedUser = await User.findById(decodedToken.userId);

    if (!existedUser)
      return res.status(401).send({ message: "Permission Deny!" });

    req.userId = existedUser._id;
    req.userEmail = existedUser.email;
    req.userRole = existedUser.role;
    next();
  } catch (e) {
    res.status(401).send({ message: "Permission Deny!", data: e });
  }
};

const authorize = accessRoles => {
  return async (req, res, next) => {
    let canAccess = false;
    req.userRole.forEach(item => {
      if (accessRoles.includes(item)) {
        canAccess = true;
      }
    });
    if (!canAccess) return res.status(401).send({ message: "Permission Deny!" });
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
