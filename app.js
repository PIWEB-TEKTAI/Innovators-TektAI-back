const express = require('express');
const connectDB = require('./src/configs/db');
const cookieParser = require('cookie-parser');

const cors = require("cors");
const cookieSession = require("cookie-session");
const path = require('path');
const axios = require('axios')

//routes 
var authRouter = require('./src/routes/auth.route');
const userRouter = require('./src/routes/user');
const admin = require('./src/routes/SuperAdmin');
const adminRouter = require('./src/routes/admin.route');

const dotenv = require('dotenv');
const authMiddleware = require('./src/middlewares/authMiddleware');

dotenv.config();

const app = express();
const server = require('http').createServer(app);



app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});
// parse requests of content-type - application/json
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173' , 
  credentials: true
  
}));


// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

/*app.use(
  cookieSession({
    name: "bezkoder-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true
  })
);
*/


app.use(cookieParser());


app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
//image
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use("/Admin", admin);
app.use("/admin2", authMiddleware,adminRouter);



//recaptcha 
app.post("/verify-captcha", async (req, res) => {
  const { token } = req.body;
  console.log(token)

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
    );

    if (response.data.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'CAPTCHA verification failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error verifying reCAPTCHA");
   }
});




// Default route
app.use('', async function (req, res) {
  res.json({ message: "la réponse du serveur" });
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
