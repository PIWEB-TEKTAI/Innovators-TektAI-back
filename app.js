const express = require('express');
const connectDB = require('./src/configs/db');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const app = express();
const server = require('http').createServer(app);

app.use(cors());
app.use(express.json());

const usersRouter = require('./src/routes/users');
app.use('/users', usersRouter);
app.use('/images', express.static(path.join(__dirname, 'images')));



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