const { param, body, validationResult } = require('express-validator');


exports.payJobValidator = [
    param('job_id').isInt().toInt(),
    (req, res, next) => {
        try {
            validationResult(req).throw()
            next()
        } catch (e) {
            return res.status(422).json(e)
        }
    }
]

