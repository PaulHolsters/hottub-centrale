const express = require('express')
const router = express.Router()

const Schema = require('../../models/Product')
const mongoose = require("mongoose");

router.post('/', (req, res, next) => {
    const newProductOption = new Schema.optionModel({
        name:req.body.name,
        price:req.body.price
    })
    newProductOption.save().then(result=>{
        const optCopy = {}
        optCopy['_id'] = result._id
        optCopy['name'] = result['name']
        optCopy['price'] = result['price']
        res.status(201).json(
            {
                option: optCopy
            }
        )
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
    Schema.optionModel.find({},{__v:0}).then(result=>{
        res.status(200).json(
            {
                options:result
            }
        )
    }).catch(err=>{
        res.status(500).json({
            error: 'something went wrong'
        })
    })
})

router.put('/:id', (req, res, next) => {
    Schema.optionModel.findByIdAndUpdate({_id:req.params.id},{
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

router.delete('/:id', async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        await Schema.optionModel.deleteOne({_id: req.params.id}, {}).exec()
        await Schema.productModel.find({},{options:1},{},(err,doc)=>{
            // todo fix bug
            if(doc?.options?.includes(req.params.id)){
                doc?.options.splice(doc?.options.indexOf(req.params.id),1)
                doc?.save()
            }
        })
        await session.commitTransaction()
        session.endSession()
        res.status(200).json()
    } catch (err) {
        await session.abortTransaction()
        res.status(500).json({
            error: err
        })
    }
})

module.exports = router
