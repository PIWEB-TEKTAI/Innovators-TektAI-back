const express = require('express');
const connectDB = require('./src/configs/db');
const cors = require('cors'); // Import the cors package
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/user');

dotenv.config();

const app = express();
const server = require('http').createServer(app);

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173' , 
  credentials: true
}));
app.use('/api', userRoutes);



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
