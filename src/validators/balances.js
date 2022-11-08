const { param, body, validationResult } = require('express-validator');


exports.depositBalanceValidator = [
    param('userId').isInt().toInt(),
    body('amount').isInt({min: 1}).toInt(),
    (req, res, next) => {
        try {
            validationResult(req).throw()
            next()
        } catch (e) {
            return res.status(422).json(e)
        }
    }
]

