const express = require('express')
const router = express.Router()
const {getProfile} = require('../middleware/getProfile')
const {
    depositBalanceController
} = require('../controllers/balances')


const {
    depositBalanceValidator
} = require('../validators/balances')

router.post(
    '/deposit/:userId',
    getProfile,
    depositBalanceValidator,
    depositBalanceController
)


module.exports = router