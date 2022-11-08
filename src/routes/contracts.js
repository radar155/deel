const express = require('express')
const router = express.Router()
const {getProfile} = require('../middleware/getProfile')
const {
    getContractByIdController,
    getContractsByUserId
} = require('../controllers/contracts')

const {
    getContractByIdvalidator
} = require('../validators/contracts')

router.get(
    '/:id',
    getProfile,
    getContractByIdvalidator,
    getContractByIdController
)

router.get(
    '/',
    getProfile,
    getContractsByUserId
)
module.exports = router