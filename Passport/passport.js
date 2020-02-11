const passport = require("passport");
const FacebookToken = require("passport-facebook-token");
const { User } = require("../Models/User");

passport.use(
  "AuthenticateWithFacebook",
  new FacebookToken(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existedUser = await User.findOne({
          $or: [{ facebookId: profile.id }, { email: profile.emails[0].value }]
        });
        
        if (existedUser) {
          return done(null, existedUser);
        }

        const newUser = await new User({
          name: profile._json.name,
          email: profile._json.email,
          role: ["user"],
          avatar: profile.photos[0].value,
          facebookId: profile.id
        }).save();

        done(null, newUser);
        // => req.user = newUser;
        // => next()
      } catch (e) {
        done(e, false, e.message);
      }
    }
  )
);
