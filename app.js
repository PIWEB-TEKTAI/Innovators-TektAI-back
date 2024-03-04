const express = require('express');
const connectDB = require('./src/configs/db');
const admin = require('./src/routes/SuperAdmin');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = require('http').createServer(app);

// Enable CORS for all routes
app.use(cors());

app.use(express.json());
app.use("/Admin", admin);

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
