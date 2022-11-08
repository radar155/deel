const { Op, Transaction } = require('sequelize');


exports.getUnpaidJobsController = async (req, res, next) => {

    try {
        const {Job, Contract} = req.app.get('models')
        const id = req.profile.id
    
        const jobs = await Job.findAll({
            include: {
                model: Contract,
                attributes: [], // avoid including contract data in final results
                where: {
                    [Op.or]: [
                        { ClientId: id },
                        { ContractorId: id }
                    ],
                    status: 'in_progress'
                },
            },
            where: {
                [Op.or]: [
                    { paid: null },
                    { paid: false }
                ]
            }
        })
    
    
        if (!jobs.length)
            return res.status(404).end()
        
    
        return res.json(jobs)
    } catch (e) {
        console.error(e)
        return res.status(500).end()
    }
    
}

exports.payJobController = async (req, res, next) => {

    try {
        if (req.profile.type !== 'client')
            return res.status(403).end() // this endpoint should be called only by clients
        
        const {job_id} = req.params
        
        const sequelize = req.app.get('sequelize')
        const t = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE // -> this is the default (and only) isolation level for SQLITE
        })

        try {
            const {Job, Contract, Profile} = req.app.get('models')

            const job = await Job.findOne({
                where: {id: job_id},
                include: {
                    model: Contract  
                },
                transaction: t
            })
            
            if (!job) {
                await t.rollback();
                return res.status(404).end()
            }

            if (job.paid === true) { // if the job was already paid, throw an error
                await t.rollback()
                return res.status(403).end('Job already paid')
            }

            if (job.Contract.ClientId !== req.profile.id) { // relation between job, contract and client it must be consistent for logical and security reasons
                await t.rollback()
                return res.status(403).end()
            }

            const client = await Profile.findOne({
                where: {id: job.Contract.ClientId},
                transaction: t
            })

            if (client.balance < job.price) {
                await t.rollback();
                return res.status(403).send('Low balance')
            }

            await client.update({
                balance: client.balance - job.price
            }, {transaction: t})

            const contractor = await Profile.findOne({
                where: {id: job.Contract.ClientId},
                transaction: t
            })

            await contractor.update({
                balance: contractor.balance + job.price
            }, {transaction: t})
            
            await job.update({
                paid: true
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