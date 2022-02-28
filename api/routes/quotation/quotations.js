const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')

const nodemailer = require('nodemailer')

const PDFDocument = require('pdfkit')

const Schema = require('../../models/Quotation')

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
    newQuotation.save().then(result => {
        res.status(201).json()
    }).catch(err => {
        res.status(500).json({
            error: err
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
    newQuotation.save().then(result => {
        res.status(201).json(
            {quotation:result}
        )
    }).catch(err => {
        let failedProp = ''
        if (err.errors.hasOwnProperty('customerInfo')) {
            failedProp = 'customerInfo'
        }
        res.status(500).json({
            error: err.errors.customerInfo.message
        })
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
            const pdfDoc = new PDFDocument()
            // todo finish the quotation pdf
            pdfDoc.text(doc?.quotationValues.productName)
            pdfDoc.end()
            const sendEmail = async options =>{
                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'hottub.centrale.test@gmail.com',
                        pass: 'Vistaline123;'
                    }
                })
                const mailOptions = {
                    from: 'hottub.centrale.test@gmail.com',
                    to: options.email,
                    subject: options.subject,
                    text: options.message,
                    attachments: options.attachments
                }
                await transporter.sendMail(mailOptions).catch(err=>{
                    console.log(err)
                })
                Schema.quotationModel.updateOne({_id:quotationId},{status:'verstuurd'})
            }

            sendEmail({email:'ph.29@hotmail.com',
                subject:'offerte sauna',
                message:'graag uw goedkeuring of nieuw voorstel...',
                attachments: [
                    {
                        filename:'offerte-hottub-centrale.pdf',
                        content: pdfDoc
                    }
                ]}).then(()=>{
                console.log('email send')
                res.status(201).json()

            }).catch(err=>{
                console.log('no email send',err)
            })

        }).catch(err=>{
            console.log('global error',err)
        })
    } else if(action==='invoice'){
// todo finish this
    }
})



router.get('/', (req, res, next) => {
    Schema.quotationModel.find({}, {__v: 0}).then(result => {
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

module.exports = router
