const express = require('express')
const router = express.Router()
const {getProfile} = require('../middleware/getProfile')
const {
    getBestProfessionController,
    getBestClientsController
} = require('../controllers/admin')

const { 
    getBestProfessionValidator,
    getBestClientValidator 
} = require('../validators/admin')

router.get(
    '/best-profession',
    // getProfile, // admin auth ???
    getBestProfessionValidator,
    getBestProfessionController
)

router.get(
    '/best-clients',
    // getProfile, // admin auth ???
    getBestClientValidator,
    getBestClientsController
)
module.exports = router