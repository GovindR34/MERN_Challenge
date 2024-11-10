const axios = require('axios');
const Transaction = require('../models/Transaction');

// Initialize Database
exports.initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    await Transaction.insertMany(response.data);
    res.send('Database initialized with seed data.');
  } catch (error) {
    res.status(500).send('Error initializing database');
  }
};

// List Transactions with Pagination and Search
exports.listTransactions = async (req, res) => {
  const { month, page = 1, perPage = 10, search = '' } = req.query;
  const monthNum = new Date(Date.parse(month + " 1, 2023")).getMonth() + 1;

  let query = {
    $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] },
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { price: { $regex: search, $options: 'i' } },
    ],
  };

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.json(transactions);
  } catch (error) {
    res.status(500).send('Error fetching transactions');
  }
};

// Statistics API
exports.getStatistics = async (req, res) => {
  const { month } = req.query;
  const monthNum = new Date(Date.parse(month + " 1, 2023")).getMonth() + 1;

  try {
    const totalSaleAmount = await Transaction.aggregate([
      { $match: { $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] } } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const totalSoldItems = await Transaction.countDocuments({
      sold: true,
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] }
    });

    const totalNotSoldItems = await Transaction.countDocuments({
      sold: false,
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] }
    });

    res.json({
      totalSaleAmount: totalSaleAmount[0]?.total || 0,
      totalSoldItems,
      totalNotSoldItems
    });
  } catch (error) {
    res.status(500).send('Error fetching statistics');
  }
};

// Bar Chart Data API
exports.getBarChartData = async (req, res) => {
  const { month } = req.query;
  const monthNum = new Date(Date.parse(month + " 1, 2023")).getMonth() + 1;

  const priceRanges = [
    { range: '0-100', min: 0, max: 100 },
    { range: '101-200', min: 101, max: 200 },
    { range: '201-300', min: 201, max: 300 },
    { range: '301-400', min: 301, max: 400 },
    { range: '401-500', min: 401, max: 500 },
    { range: '501-600', min: 501, max: 600 },
    { range: '601-700', min: 601, max: 700 },
    { range: '701-800', min: 701, max: 800 },
    { range: '801-900', min: 801, max: 900 },
    { range: '901-above', min: 901, max: Infinity },
  ];

  try {
    const data = await Promise.all(
      priceRanges.map(async ({ range, min, max }) => {
        const count = await Transaction.countDocuments({
          price: { $gte: min, $lte: max },
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] }
        });
        return { range, count };
      })
    );
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching bar chart data');
  }
};

// Pie Chart Data API
exports.getPieChartData = async (req, res) => {
  const { month } = req.query;
  const monthNum = new Date(Date.parse(month + " 1, 2023")).getMonth() + 1;

  try {
    const data = await Transaction.aggregate([
      { $match: { $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching pie chart data');
  }
};
