const { Op, Transaction } = require('sequelize');


exports.depositBalanceController = async (req, res, next) => {

    try {
        if (req.profile.type !== 'client')
            return res.status(403).end() // this endpoint should be called only by clients
        
        const {userId} = req.params

        if (req.profile.id !== userId) // a client can deposit money in only in his personal account with this method (?)
            return res.status(403).end()
        
        const sequelize = req.app.get('sequelize')
        const t = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        })

        try {
            const {Job, Contract, Profile} = req.app.get('models')

            const jobs = await Job.findAll({
                include: {
                    model: Contract,
                    attributes: [], // avoid including contract data in final results
                    where: { ClientId: req.profile.id },
                },
                where: {
                    [Op.or]: [
                        { paid: null },
                        { paid: false }
                    ]
                },
                attributes: [
                    [sequelize.fn('sum', sequelize.col('price')), 'total_amount_to_pay'],
                ],
                raw : true,
                transaction: t
            })
            
            const amount = req.body.amount / 100
            if (amount > jobs[0].total_amount_to_pay * .25) {
                await t.rollback()
                return res.status(403).end('a client can\'t deposit more than 25% his total of jobs to pay')
            }
            
            const client = await Profile.findOne({
                where: {id: req.profile.id},
                transaction: t
            })

            await client.update({
                balance: client.balance + amount
            }, {transaction: t})
            
            await t.commit()
            return res.status(200).end()
        } catch (e) {
            console.error(e)
            await t.rollback();

        }
    } catch (e) {
        console.error(e)
        return res.status(500).end()
    }
    
}