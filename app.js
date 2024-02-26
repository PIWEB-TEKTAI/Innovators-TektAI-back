const express = require('express');

const connectDB = require('./src/configs/db');
const cors = require('cors')
const userRouter = require('./src/routes/user');

const dotenv = require('dotenv')
dotenv.config()
const app = express();
const server = require('http').createServer(app)

app.use(cors());


app.use(express.json());

app.use('/user' , userRouter);



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