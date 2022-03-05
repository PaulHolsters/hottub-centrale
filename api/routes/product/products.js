const express = require('express')
const router = express.Router()

const Schema = require('../../models/Product')

router.post('/', (req, res, next) => {
    const newProduct = new Schema.productModel({
        name: req.body.name,
        cat: req.body.cat,
        price: req.body.price,
        specifications: req.body.specifications,
        options: req.body.options
    })
    newProduct.save().then(result => {
        res.status(201).json()
    }).catch(err => {
        let failedProp = ''
        if (err.errors.hasOwnProperty('name')) {
            failedProp = 'name'
        } else if (err.errors.hasOwnProperty('cat')) {
            failedProp = 'cat'
        } else if (err.errors.hasOwnProperty('price')) {
            failedProp = 'price'
        } else if (err.errors.hasOwnProperty('specifications')) {
            failedProp = 'specifications'
        } else if (err.errors.hasOwnProperty('options')) {
            failedProp = 'options'
        }
        res.status(500).json({
            error: err.errors[failedProp].properties.message
        })
    })
})

router.get('/', (req, res, next) => {
    if (req.query.hasOwnProperty('limited')) {
        Schema.productModel.find({}, {__v: 0, specifications: 0, cat: 0})
            .populate('options', {__v: 0}).then(result => {
            res.status(200).json(
                {
                    products: result
                }
            )
        }).catch(err => {
            res.status(500).json({
                error: 'something went wrong'
            })
        })
    } else {
        Schema.productModel.find({}, {__v: 0}).populate('specifications', {__v: 0})
            .populate('options', {__v: 0}).then(result => {
            res.status(200).json(
                {
                    products: result
                }
            )
        }).catch(err => {
            res.status(500).json({
                error: 'something went wrong'
            })
        })
    }
})

router.get('/:id', (req, res, next) => {
    Schema.productModel.findById({_id: req.params.id}, {__v: 0}).populate('specifications', {__v: 0})
        .populate('options', {__v: 0}).then(result => {
        //result.name = result.name.substr(0,1).toUpperCase()+result.name.substr(1)
        res.status(200).json(
            {
                product: result
            }
        )
    }).catch(err => {
        res.status(500).json({
            error: 'something went wrong'
        })
    })
})

router.put('/:id', async (req, res, next) => {
    const update = {}
    await Schema.productModel.findById({_id: req.params.id},{_id:0,__v:0}).then(product=>{
        if(product.name!==req.body.name.trim().toLowerCase()) update['name']=req.body.name
        if(product.cat!==req.body.cat.trim().toLowerCase()) update['cat']=req.body.cat
        if(product.price!==req.body.price) update['price']=req.body.price
        if(Schema.listsAreUnique([product.specifications,req.body.specifications])) update['specifications']=req.body.specifications
        if(Schema.listsAreUnique([product.options,req.body.options])) update['options']=req.body.options
    })
    Schema.productModel.findByIdAndUpdate({_id: req.params.id}, update, {runValidators: true,context:'query'}).then(result => {
        res.status(200).json()
    }).catch(err => {
        let failedProp = ''
        if (err.errors.hasOwnProperty('name')) {
            failedProp = 'name'
        } else if (err.errors.hasOwnProperty('cat')) {
            failedProp = 'cat'
        } else if (err.errors.hasOwnProperty('price')) {
            failedProp = 'price'
        } else if (err.errors.hasOwnProperty('specifications')) {
            failedProp = 'specifications'
        } else if (err.errors.hasOwnProperty('options')) {
            failedProp = 'options'
        }
        res.status(500).json({
            error: err.errors[failedProp].properties.message
        })
    })
})

router.delete('/:id', (req, res, next) => {
    Schema.productModel.deleteOne({_id: req.params.id}, {}).then(result => {
        res.status(200).json()
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router
