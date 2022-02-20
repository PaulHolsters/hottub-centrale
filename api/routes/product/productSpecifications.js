const express = require('express')
const router = express.Router()

const Schema = require('../../models/Product')
const mongoose = require("mongoose");

router.post('/', (req, res, next) => {
    const newProductSpecification = new Schema.specificationModel({
        name: req.body.name
    })
    newProductSpecification.save().then(result => {
        const specCopy = {}
        specCopy['_id'] = result._id
        specCopy['name'] = result['name']
        res.status(201).json(
            {
                specification: specCopy
            }
        )
    }).catch(err => {
        let failedProp = ''
        if (err.errors.hasOwnProperty('name')) {
            failedProp = 'name'
        }
        res.status(500).json({
            error: err.errors[failedProp].properties.message
        })
    })
})

router.get('/', (req, res, next) => {
    Schema.specificationModel.find({}, {__v: 0}).then(result => {
        res.status(200).json(
            {
                specifications: result
            }
        )
    }).catch(err => {
        res.status(500).json({
            error: 'something went wrong'
        })
    })
})

router.patch('/:id', (req, res, next) => {
    Schema.specificationModel.updateOne({_id: req.params.id}, {$set: {name: req.body.name}}, {runValidators: true}).then(result => {
        res.status(200).json()
    }).catch(err => {
        let failedProp = ''
        if (err.errors.hasOwnProperty('name')) {
            failedProp = 'name'
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
        await Schema.specificationModel.deleteOne({_id: req.params.id}, {}).exec()
        await Schema.productModel.find({}, {specifications: 1}, {}, (err, doc) => {
            // todo fix bug
            console.log(doc)
            if (doc?.specifications?.includes(req.params.id)) {
                console.log('before',doc?.specifications)
                doc?.specifications.splice(doc?.specifications.indexOf(req.params.id), 1)
                console.log('after',doc?.specifications)
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
