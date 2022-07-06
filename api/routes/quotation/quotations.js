const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')

const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')

const PDFDocument = require('pdfkit')

const Schema = require('../../models/Quotation')
const mongoose = require("mongoose");

router.post('/', check('customerInfo.email').isEmail() ,async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()
        })
    }
    const newQuotation = new Schema.quotationModel({
        version: 1,
        status: 'aangemaakt',
        productId: req.body.productId,
        selectedOptions: req.body.selectedOptions,
        selectedQuotationSpecifications: req.body.selectedQuotationSpecifications,
        customerInfo: req.body.customerInfo,
        VAT: req.body.VAT,
        discount: req.body.discount
    })
    console.log(newQuotation)
    newQuotation.save().then(result => {
        res.status(201).json()
    }).catch(err => {
        console.log('err',err)
        res.status(500).json({
            error: err.toString().substr(err.toString().lastIndexOf(':')+2)
        })
    })
})

router.put('/:groupId/:previous', check('customerInfo.email').isEmail() ,async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()
        })
    }
    const newQuotation = new Schema.quotationModel({
        groupId: req.params.groupId,
        status: 'aangepast',
        previousVersionId: req.params.previous,
        productId: req.body.productId,
        selectedOptions: req.body.selectedOptions,
        selectedQuotationSpecifications: req.body.selectedQuotationSpecifications,
        customerInfo: req.body.customerInfo,
        VAT: req.body.VAT,
        discount: req.body.discount
    })
    console.log('selected ids',req.body.selectedQuotationSpecifications)
    newQuotation.save().then(result => {
        res.status(201).json(
            {quotation:result}
        )
    }).catch(err => {
        let failedProp = ''
        if (err.errors && err.errors.hasOwnProperty('customerInfo')) {
            failedProp = 'customerInfo'
            res.status(500).json({
                error: err.errors.customerInfo.message
            })
        } else{
            res.status(500).json({
                error: err.toString().substr(err.toString().lastIndexOf(':')+1)
            })
        }
    })
})

router.patch('/:id',async (req, res, next) => {
    Schema.quotationModel.updateOne({_id:req.params.id},{status:req.body.status},{runValidators:true}).exec().then(result => {
        res.status(201).json(
        )
    }).catch(err => {
        res.status(500).json({
            error: err.errors
        })
    })
})

router.get('/action/:id', async (req, res, next) => {
    const action = req.query.action
    if(action==='pdf'){
        const quotationId = req.params.id
        Schema.quotationModel.findById({_id:quotationId},{__v:0}).exec().then(doc=>{
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition','attachment; filename = "offerte_"'+ doc?.quotationValues.productName +'"')
            const pdfDoc = new PDFDocument()
            pdfDoc.pipe(res)
            // create pdf
            pdfDoc.text(doc?.quotationValues.productName)
            // todo finish the quotation pdf
            pdfDoc.end()

        })
    } else if(action==='mail'){
        const quotationId = req.params.id
        Schema.quotationModel.findById({_id:quotationId},{__v:0}).exec().then(doc=>{
            if(doc?.status!=='aangemaakt' && doc?.status!=='aangepast' && doc?.status!=='aan te passen' ){
                throw new Error('Enkel offertes met status \'aangemaakt\', \'aangepast\' of \'aan te passen\' kunnen verstuurd worden.')
            }
            const pdfDoc = new PDFDocument()
            // todo finish the quotation pdf
            pdfDoc.text(doc?.quotationValues.productName)
            pdfDoc.end()
            const sendEmail = async options =>{
/*                const transporter = nodemailer.createTransport({
                    service: `${process.env.emailProvider}`,
                    auth: {
                        user: `${process.env.emailUser}`,
                        pass: `${process.env.emailPassword}`
                    }
                })*/
                    const transporter = nodemailer.createTransport(sendgridTransport({
                        auth: {
                            api_key:  `${process.env.apiKey}`
                        }
                    }))
                const mailOptions = {
                    from: `${process.env.emailUser}`,
                    to: options.email,
                    subject: options.subject,
                    text: options.message,
                    attachments: options.attachments
                }
                await transporter.sendMail(mailOptions).then(
                    ()=>{
                        Schema.quotationModel.findOne({_id:quotationId}).then(quot=>{
                            Schema.quotationModel.updateOne({_id:quotationId},
                                {$set:{status:'verstuurd'},$push: {sendDate:'verstuurd op '+ new Date() +' naar '+quot.customerInfo.email}},{runValidators:true}).exec().then(result => {
                                res.status(201).json(
                                )
                            })
                        }).catch(err=>{
                            res.status(500).json({
                                error: err.error
                            })
                        })

                    }
                ).catch(err=>{
                    res.status(500).json({
                        error: `email verzenden mislukt`
                    })
                })
            }
            sendEmail({email:doc?.customerInfo.email,
                subject:'offerte sauna',
                message:'graag uw goedkeuring of nieuw voorstel...',
                attachments: [
                    {
                        filename:'offerte-hottub-centrale.pdf',
                        content: pdfDoc
                    }
                ]}).then(()=>{
                res.status(201).json()
            }).catch(err=>{
                res.status(500).json({
                    error: 'email verzenden mislukt'
                })
            })
        }).catch(err=>{
            res.status(500).json({
                error: err.toString().substr(err.toString().indexOf(':')+1)
            })
        })
    } else if(action==='invoice'){
// todo finish this
    }
})


router.get('/', (req, res, next) => {
    Schema.quotationModel.find({}, {__v: 0}).then(result => {
        console.log(result,'chache here or on client?')
        res.status(200).json(
            {
                quotations: result
            }
        )
    }).catch(err => {
        res.status(500).json({
            error: 'something went wrong'
        })
    })
})

router.get('/:id', (req, res, next) => {
    Schema.quotationModel.findById({_id: req.params.id}, {__v: 0}).then(result => {
        res.status(200).json(
            {
                quotation: result
            }
        )
    }).catch(err => {
        res.status(500).json({
            error: 'something went wrong'
        })
    })
})

router.delete('/:id',async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        await Schema.quotationModel.findById({_id:req.params.id}).then(async quotation => {
            await Schema.quotationModel.find({groupId: quotation.groupId}).then(async results => {
                for (const result of results) {
                    await Schema.quotationModel.findByIdAndDelete({_id: result._id}).then(res => {
                    })
                }
            })
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
