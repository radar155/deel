const { Op } = require("sequelize");


exports.getContractByIdController = async (req, res, next) => {
    try {
        const {Contract} = req.app.get('models')
        const {id} = req.params
        const contract = await Contract.findOne({where: {id}})
    
        if (!contract)
            return res.status(404).end()
        
        if (contract.ClientId !== req.profile.id)
            return res.status(403).end()
    
        return res.json(contract)
    } catch (e) {
        console.error(e)
        res.status(500).end()
    }
    
}

exports.getContractsByUserId = async (req, res, next) => {
    try {
        const {Contract} = req.app.get('models')
        const id = req.profile.id
        const contract = await Contract.findAll({where: {
            [Op.or]: [
              { ClientId: id },
              { ContractorId: id }
            ],
            status: {[Op.ne]:'terminated'}
          }})
    
        if (!contract.length)
            return res.status(404).end()
        
    
        return res.json(contract)
    } catch (e) {
        console.error(e)
        res.status(500).end()
    }
    
}