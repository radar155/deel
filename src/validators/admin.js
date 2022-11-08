const { query, validationResult,  } = require('express-validator');


exports.getBestProfessionValidator = [
    query('start').isISO8601(),
    query('end').isISO8601(),
    (req, res, next) => {
        try {
            validationResult(req).throw()
            next()
        } catch (e) {
            return res.status(422).json(e)
        }
    }
]

exports.getBestClientValidator = [
    query('start').isISO8601(),
    query('end').isISO8601(),
    query('limit').isInt({min: 1}).toInt().optional(),
    (req, res, next) => {
        try {
            validationResult(req).throw()
            next()
        } catch (e) {
            return res.status(422).json(e)
        }
    }
]