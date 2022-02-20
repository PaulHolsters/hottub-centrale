const express = require('express')
const router = express.Router()

const Schema = require('../../models/Quotation')

router.post('/', (req, res, next) => {
    const newQuotationSpecification= new Schema.quotationSpecificationModel({
        name:req.body.name,
        price:req.body.price
    })
    newQuotationSpecification.save().then(result=>{
        const responseObj = Object.assign({},result._doc)
        delete responseObj['__v']
        res.status(201).json(            {
            quotationSpecification:responseObj
        })
    }).catch(err=>{
        let failedProp = ''
        if(err.errors.hasOwnProperty('name')){
            failedProp = 'name'
        } else if(err.errors.hasOwnProperty('price')){
            failedProp = 'price'
        }
        res.status(500).json({
            error: err.errors[failedProp].properties.message
        })
    })
})

router.get('/', (req, res, next) => {
    Schema.quotationSpecificationModel.find({},{__v:0}).then(result=>{
        res.status(200).json(
            {
                quotationSpecifications:result
            }
        )
    }).catch(err=>{
        res.status(500).json({
            error: 'something went wrong'
        })
    })
})

router.put('/:id', (req, res, next) => {
    Schema.quotationSpecificationModel.findByIdAndUpdate({_id:req.params.id},{
        name:req.body.name,
        price:req.body.price
    },{runValidators:true}).then(result=>{
        res.status(200).json()
    }).catch(err=>{
        let failedProp = ''
        if(err.errors.hasOwnProperty('name')){
            failedProp = 'name'
        } else if(err.errors.hasOwnProperty('price')){
            failedProp = 'price'
        }
        res.status(500).json({
            error: err.errors[failedProp].properties.message
        })
    })
})

router.delete('/:id', (req, res, next) => {
    Schema.quotationSpecificationModel.deleteOne({_id:req.params.id},{}).then(result=>{
        res.status(200).json()
    }).catch(err=>{
        res.status(500).json({
            error: err
        })
    })

})

module.exports = router
