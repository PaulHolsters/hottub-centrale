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
            console.log('error!!!',err,'error')
            res.status(500).json({
                error: err.toString().substr(err.toString().lastIndexOf(':')+1)
            })
        }
/*        res.status(500).json({
            error: err
        })*/
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
        Schema.quotationModel.findById({_id:quotationId},{__v:0}).exec().then(async doc => {
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', 'attachment; filename = "offerte_"' + doc?.quotationValues.productName + '"')
            const pdfDoc = new PDFDocument()
            pdfDoc.pipe(res)
            let linecount = 0
            // achtergrond + omkadering
            pdfDoc.lineWidth(1).lineCap('butt').fillColor('green').rect(1, 1, (569+23+23-4-1), (745+46-1)).stroke()
            let grad = pdfDoc.linearGradient(1, (745+46-1), (569+23+23-4-1), 1)
            grad.stop(0, 'white').stop(1, 'green')
            pdfDoc.rect(1, 1, (569+23+23-4-1), (745+46-1)).lineWidth(2).fillOpacity(0.5).fillAndStroke(grad, "green")
            const moveUp = 10
            // header-tabel
            pdfDoc.rect(40, 230-moveUp, 180, 26).lineWidth(1).fillOpacity(1).fillAndStroke('green', 'grey')
                .rect(220, 230-moveUp, 180, 26).lineWidth(1).fillOpacity(1).fillAndStroke()
                .rect(400, 230-moveUp, 180, 26).lineWidth(1).fillOpacity(1).fillAndStroke()
            pdfDoc.rect(40, 256-moveUp, 180, 20).lineWidth(1).fillOpacity(1).stroke('grey')
                .rect(220, 256-moveUp, 180, 20).lineWidth(1).fillOpacity(1).stroke()
                .rect(400, 256-moveUp, 180, 20).lineWidth(1).fillOpacity(1).stroke()
            pdfDoc.fontSize(9)
            pdfDoc.fillOpacity(1).fillColor('black').text('ORDERDATUM', 50, 240-moveUp, {width: 170, align: 'left'})
                .text('ORDERNUMMER', 230, 240-moveUp, {width: 170, align: 'left'})
                .text('CONTACT', 410, 240-moveUp, {width: 170, align: 'left'})
            const strDate = Intl.DateTimeFormat('en-GB').format(doc?.creationDate)
            pdfDoc.text(strDate, 50, 264-moveUp, {width: 170, align: 'left'})
                .text(doc?.quotationNumber, 230, 264-moveUp, {width: 170, align: 'left'})
                .text(`${process.env.contact}`, 410, 264-moveUp, {width: 170, align: 'left'})

            // content-tabel
            //header
            pdfDoc.rect(40, 290-moveUp, 90, 26).lineWidth(1).fillOpacity(1).fillAndStroke('green', 'grey')
                .rect(130, 290-moveUp, 360, 26).lineWidth(1).fillOpacity(1).fillAndStroke()
                .rect(490, 290-moveUp, 90, 26).lineWidth(1).fillOpacity(1).fillAndStroke()
            pdfDoc.fillOpacity(1).fillColor('black').text('ARTIKELNR.', 50, 300-moveUp, {width: 80, align: 'left'})
                .text('OMSCHRIJVING', 140, 300-moveUp, {width: 340, align: 'left'})
                .text('PRIJS', 500, 300-moveUp, {width: 80, align: 'left'})
            //content
            let k = 0
            // product eigenschappen
            for (let i = -1; i < doc?.quotationValues.productSpecifications.length; i++) {
                if (i === -1) {
                    // product
                    pdfDoc.rect(40, 316-moveUp, 90, 20).lineWidth(1).fillOpacity(1).stroke('grey')
                        .rect(130, 316-moveUp, 360, 20).lineWidth(1).fillOpacity(1).stroke()
                        .rect(490, 316-moveUp, 90, 20).lineWidth(1).fillOpacity(1).stroke()
                    pdfDoc.fillOpacity(1).fillColor('black').text(doc?.quotationValues.productName, 140, 323-moveUp, {
                        width: 340,
                        align: 'left'
                    })
                        .text(doc?.quotationValues.productPrice + ' €', 500, 323-moveUp, {width: 70, align: 'left'})
                    linecount++
                }
                pdfDoc.rect(40, 336-moveUp + i * 20, 90, 20).lineWidth(1).fillOpacity(1).stroke('grey')
                    .rect(130, 336-moveUp + i * 20, 360, 20).lineWidth(1).fillOpacity(1).stroke()
                    .rect(490, 336-moveUp + i * 20, 90, 20).lineWidth(1).fillOpacity(1).stroke()
                pdfDoc.fillOpacity(1).fillColor('black').text(doc?.quotationValues.productSpecifications[i]?.name, 140, 343-moveUp + i * 20, {
                    width: 340,
                    align: 'left'
                })
                k = i
                linecount++
                if(linecount===15) break
            }
            // gekozen product opties
            let l = k
            for (let j = 0; j < doc?.quotationValues.optionValues.length; j++) {
                if(linecount===15) break
                pdfDoc.rect(40, 336-moveUp + (j + k + 1) * 20, 90, 20).lineWidth(1).fillOpacity(1).stroke('grey')
                    .rect(130, 336-moveUp + (j + k + 1) * 20, 360, 20).lineWidth(1).fillOpacity(1).stroke()
                    .rect(490, 336-moveUp + (j + k + 1) * 20, 90, 20).lineWidth(1).fillOpacity(1).stroke()
                pdfDoc.fillOpacity(1).fillColor('black').text(doc?.quotationValues.optionValues[j]?.name, 140, 343-moveUp + (j + k + 1) * 20, {
                    width: 340,
                    align: 'left'
                })
                if (doc?.quotationValues.optionValues[j]?.price === 0) {
                    pdfDoc.fillOpacity(1).fillColor('black').text('inbegrepen', 500, 343-moveUp + (j + k + 1) * 20, {
                        width: 70,
                        align: 'left'
                    })
                } else {
                    pdfDoc.fillOpacity(1).fillColor('black').text(doc?.quotationValues.optionValues[j]?.price + ' €', 500, 343-moveUp + (j + k + 1) * 20, {
                        width: 70,
                        align: 'left'
                    })
                }
                l = j + k + 1
                linecount++
            }
            // extra diensten
            let n = l
            for (let m = 0; m <= doc?.quotationValues.quotationSpecificationValues.length; m++) {
                if(linecount===15) break
                pdfDoc.rect(40, 336-moveUp + (m + l + 1) * 20, 90, 20).lineWidth(1).fillOpacity(1).stroke('grey')
                    .rect(130, 336-moveUp + (m + l + 1) * 20, 360, 20).lineWidth(1).fillOpacity(1).stroke()
                    .rect(490, 336-moveUp + (m + l + 1) * 20, 90, 20).lineWidth(1).fillOpacity(1).stroke()
                if (m !== 0) {
                    pdfDoc.fillOpacity(1).fillColor('black')
                        .text(doc?.quotationValues.quotationSpecificationValues[m - 1]?.name, 140, 343-moveUp + (m + l + 1) * 20, {
                            width: 340,
                            align: 'left'
                        })
                    if (doc?.quotationValues.quotationSpecificationValues[m - 1]?.price === 0) {
                        pdfDoc.fillOpacity(1).fillColor('black').text('inbegrepen', 500, 343-moveUp + (m + l + 1) * 20, {
                            width: 70,
                            align: 'left'
                        })
                    } else {
                        pdfDoc.fillOpacity(1).fillColor('black').text(doc?.quotationValues.quotationSpecificationValues[m - 1]?.price + ' €', 500,
                            343-moveUp + (m + l + 1) * 20, {
                            width: 70,
                            align: 'left'
                        })
                    }
                    l = m
                }
                n = m + l + k + 1
                linecount++
            }
            // kostprijs
            let priceVATexcl = doc?.quotationValues.productPrice
            priceVATexcl += doc?.quotationValues.optionValues.reduce((val1,val2)=>val1.price+val2.price)
            priceVATexcl += doc?.quotationValues.quotationSpecificationValues.reduce((val1,val2)=>val1.price+val2.price)
            const discount = (doc?.discount/100)*priceVATexcl
            const tax = (priceVATexcl - discount)*(doc?.VAT/100)
            const totalPrice = (priceVATexcl - discount) + tax
            const deposit = totalPrice*(doc?.deposit/100)
            let plength = 4
            if(discount>0) plength = 5
            for (let p = 0; p <=plength; p++){
                if(linecount===15) break
                pdfDoc.rect(40, 336-moveUp + (p + n + 1) * 20, 90, 20).lineWidth(1).fillOpacity(1).stroke('grey')
                    .rect(130, 336-moveUp + (p + n + 1) * 20, 360, 20).lineWidth(1).fillOpacity(1).stroke()
                    .rect(490, 336-moveUp + (p + n + 1) * 20, 90, 20).lineWidth(1).fillOpacity(1).stroke()
                linecount++
            }
            // leveringstermijn

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
            pdfDoc.lineWidth(1).lineCap('butt').fillColor('green').rect(23,23,569,745).stroke()
            let grad = pdfDoc.linearGradient(20,751,575,20)
            grad.stop(0, 'white').stop(1,'green')
            pdfDoc.rect(20,20,575,751).lineWidth(2).fillOpacity(0.5).fillAndStroke(grad,"green")
            // omkadering

            // tekst
            //pdfDoc.fillOpacity(1).fillColor('black').text(doc?.quotationValues.productName,100, 100)
            pdfDoc.fontSize(9)
            pdfDoc.fillOpacity(1).fillColor('black').text('ORDERDATUM',50,240,{width:170,align: 'left'})
                .text('ORDERNUMMER',220,240,{width:170,align: 'left'})
                .text('CONTACT',390,240,{width:170,align: 'left'})
            const strDate = Intl.DateTimeFormat('en-GB').format(doc?.creationDate)
            pdfDoc.text(strDate,50,260,{width:170,align: 'left'})
                .text(doc?.quotationNumber,220,260,{width:170,align: 'left'})
                .text(`${process.env.contact}`,390,260,{width:170,align: 'left'})
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
                // todo fix bug: sendDate is onterecht gewijzigd (moet terug string worden in frontend
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
