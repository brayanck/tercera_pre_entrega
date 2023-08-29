const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const UserGit = require('../daos/mongodb/models/userGit.model')
const { createHash, isValidPassword } = require('../utils/bcrypts')
const { CLIENTID, CLIENTSECRET, ADMIN_EMAIL, ADMIN_PASSWORD } = require('./config')
const {cartServices,userServices} = require('../daos/repositorys/index')
const initializePassport = () => {
    passport.use(
        "local-register",
        new LocalStrategy(
            {
                usernameField: "email",
                passwordField: "password",
                passReqToCallback: true,
            },
            async (req, email, password, done) => {
                try {
                    const userData = req.body;
                    const user = await userServices.getUserByEmail(email)
                    if (user) {
                        console.log("el usuario ya existe")
                        return done(null, false)
                    }
                    const newCart = await cartServices.createCart()
                    userData.cartId = newCart._id;
                    userData.password = createHash(password);
                    const result = userServices.createUser(userData)
                    done(null, result);
                } catch (err) {
                    return done(null, false, { message: "Invalid credentials" });
                }
            }
        )
    );
    passport.use(
        "local-login",
        new LocalStrategy(
            {
                usernameField: "email",
                passwordField: "password",
                passReqToCallback: true,
            },
            async (req, email, password, done) => {
                try {
                    const user = await userServices.getUserByEmail(email)
                    if (email == ADMIN_EMAIL && password == ADMIN_PASSWORD) {
                        if (user) {
                            return done(null, {
                                email: user.email,
                                first_name: user.first_name,
                                age: user.age,
                                last_name: user.last_name,
                                role:"admin"
                            })
                        } else {
                            const newCart = await cartServices.createCart()
                            const newUser = await userServices.createUser({
                                first_name: "admin",
                                last_name: "admin",
                                email: ADMIN_EMAIL,
                                age: 1,
                                password: createHash(ADMIN_PASSWORD),
                                cartId:newCart._id
                            })
                            return done(null, {
                                email: newUser.email,
                                first_name: newUser.first_name,
                                age: newUser.age,
                                last_name: newUser.last_name,
                                role:"admin"
                            })
                        }
                    }
                    if (!user) {
                        console.log("usuario no existe");
                        return done(null, false, {
                            message: "Usuario o contraseña incorrecta",
                        });
                    }
                    if (!isValidPassword(user, password)) return done(null, false);
                    return done(null, {
                        email: user.email,
                        first_name: user.first_name,
                        age: user.age,
                        last_name: user.last_name,
                        role:"user"
                    });
                } catch (err) {
                    return done(err);
                }
            }
        )
    );
    passport.use(
        "github",
        new GitHubStrategy(
            {
                clientID: CLIENTID,
                clientSecret: CLIENTSECRET,
                callbackURL: "http://localhost:8080/auth/github/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                UserGit.findOne({ githubId: profile.id }).then((data, err) => {
                    if (!data)
                        return UserGit.create({
                            githubId: profile.id,
                            fullname: profile.displayName,
                            username: profile.username,
                            location: profile._json.location,
                            phone: profile._json.phone,
                            email: profile._json.email,
                            profilePhoto: profile._json.avatar_url,
                            password: null,
                        }).then((data, err) => {
                            return done(null, { email: data.fullname, name: data.username });
                        });
                    else return done(null, { email: data.fullname, name: data.username });
                });
            }
        )
    );

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });
}

module.exports = initializePassport;
