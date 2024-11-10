const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/initialize', transactionController.initializeDatabase);
router.get('/transactions', transactionController.listTransactions);
router.get('/statistics', transactionController.getStatistics);
router.get('/bar-chart', transactionController.getBarChartData);
router.get('/pie-chart', transactionController.getPieChartData);

module.exports = router;
