const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/transactionsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Database connected'))
  .catch((error) => console.log('Database connection error:', error));

module.exports = mongoose;
