const express = require('express')
const router = express.Router()
const {getProfile} = require('../middleware/getProfile')
const {
    getUnpaidJobsController,
    payJobController
} = require('../controllers/jobs')

const {
    payJobValidator
} = require('../validators/jobs')

router.get(
    '/unpaid',
    getProfile,
    getUnpaidJobsController
)

router.post(
    '/:job_id/pay',
    getProfile,
    payJobValidator,
    payJobController
)
module.exports = router