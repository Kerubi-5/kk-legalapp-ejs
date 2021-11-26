if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const session = require("express-session");
const flash = require("express-flash");
const dbConnection = require("./config/db");
const methodOverride = require("method-override");
const fileUpload = require("express-fileupload");
const favicon = require('serve-favicon')
const path = require('path')

/**
 * -------------- DATABASE CONNECTION ----------------
 */

dbConnection();

/**
 * -------------- BODY PARSER ----------------
 */

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

/**
 * -------------- STATIC FILES ----------------
 */

app.use(express.static("public"));
app.use("./css", express.static(__dirname + "public/css"));

//FAVICON
app.use(favicon(path.join(__dirname, 'public/assets/icon', 'favicon.ico')))

/**
 * -------------- TEMPLATING ENGINE ----------------
 */

app.use(expressLayouts);
app.set("layout", "./layouts/full-width");
app.set("view engine", "ejs");

// Method Override
app.use(methodOverride("_method"));

/**
 * -------------- FILE EXPRESS ----------------
 */

app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 1024 * 1024 * 3 },
    uriDecodeFileNames: true,
    safeFileNames: true,
    preserveExtension: true,
  })
);

/**
 * -------------- SESSION SETUP ----------------
 */

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

// Need to require the entire Passport config module so app.js knows about it
require("./config/passport")(passport);

app.use(passport.initialize());
app.use(passport.session());
// FLASH MIDDLEWARE
app.use(flash());

// Save to Global Vars Logged In
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

/**
 * -------------- ROUTES ----------------
 */

const index = require("./routes/index");
const userRoutes = require("./routes/users");
const complaintRoutes = require("./routes/complaints");
const adviceRoutes = require("./routes/advice");
const adminRoutes = require("./routes/admin");

app.use("/", index);
app.use("/users", userRoutes);
app.use("/form", complaintRoutes);
app.use("/advice", adviceRoutes);
app.use("/admin", adminRoutes);

/**
 * -------------- ERROR ROUTE HANDLER ----------------
 */

// IF NO ROUTE IS FOUND
app.use((req, res, next) => {
  const err = new Error('The page you are looking for was not found.')
  err.status = 404
  next(err)
})

// HANDLE ALL ERRORS
app.use((err, req, res, next) => {
  console.log("*******************************************************************************")
  console.error(err.stack)
  console.log("*******************************************************************************")
  res.status(err.status || 500)
  res.render("../views/pages/error", { layout: false, err })
})

// Listening to port
app.listen(port, () => {
  console.log(`Legal counsel webapp is listening at http://localhost:${port}`);
});
