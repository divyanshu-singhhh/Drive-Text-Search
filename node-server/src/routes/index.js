const express = require('express');
const loginRouter = require('./login');
const searchRouter = require('./search');
const syncRouter = require('./sync');
const userRouter = require('./user');
const router = express.Router();

router.use('/login', loginRouter);
router.use('/search', searchRouter);
router.use('/sync', syncRouter);
router.use('/user', userRouter);

module.exports = router; 