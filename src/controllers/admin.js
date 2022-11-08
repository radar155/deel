const { Op } = require('sequelize');


exports.getBestProfessionController = async (req, res, next) => {

    try {

        const start_date = new Date(req.query.start)
        const end_date = new Date(req.query.end)
        const sequelize = req.app.get('sequelize')
        const {Job, Contract, Profile} = req.app.get('models')


        const result = await Profile.findAll({
            include: {
                model: Contract,
                as: 'Contractor',
                attributes: [],
                include: {
                    model: Job,
                    where: {
                        paid: true,
                        paymentDate: {[Op.between]: [start_date, end_date]}
                    },
                    attributes: [],
                }
            },
            where: {type: 'contractor'},
            attributes: [
                'Profile.profession',
                [sequelize.fn('sum', sequelize.col('Contractor.Jobs.price')), 'total_amount'],
            ],
            group: ['Profile.profession'],
            order: sequelize.literal('total_amount DESC'),
            limit: 1,
            subQuery: false,
            raw: true,
            
        })

        return res.status(200).json(result[0]?.profession || null)

    } catch (e) {
        console.error(e)
        return res.status(500).end()
    }
    
}


exports.getBestClientsController = async (req, res, next) => {

    try {

        const start_date = new Date(req.query.start)
        const end_date = new Date(req.query.end)
        const limit = req.query.limit || 2
        const sequelize = req.app.get('sequelize')
        const {Job, Contract, Profile} = req.app.get('models')


        const result = await Profile.findAll({
            include: {
                model: Contract,
                as: 'Client',
                attributes: [],
                include: {
                    model: Job,
                    where: {
                        paid: true,
                        paymentDate: {[Op.between]: [start_date, end_date]}
                    },
                    attributes: [],
                }
            },
            where: {type: 'client'},
            attributes: [
                'Profile.*',
                [sequelize.fn('sum', sequelize.col('Client.Jobs.price')), 'total_amount'],
            ],
            group: ['Profile.id'],
            order: sequelize.literal('total_amount DESC'),
            limit,
            subQuery: false,
            raw: true,
            
        })
        return res.status(200).json(result)

    } catch (e) {
        console.error(e)
        return res.status(500).end()
    }
    
}