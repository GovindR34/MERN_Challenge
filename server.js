const express = require('express');
const mongoose = require('./config/db'); // Updated to use the db.js file
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', transactionRoutes);

const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
