const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')

const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')

const PDFDocument = require('pdfkit')

const Schema = require('../../models/Quotation')
const mongoose = require("mongoose");

router.post('/', check('customerInfo.email').isEmail(), async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
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
        console.log('err', err)
        res.status(500).json({
            error: err.toString().substr(err.toString().lastIndexOf(':') + 2)
        })
    })
})

router.put('/:groupId/:previous', check('customerInfo.email').isEmail(), async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
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
            {quotation: result}
        )
    }).catch(err => {
        let failedProp = ''
        if (err.errors && err.errors.hasOwnProperty('customerInfo')) {
            failedProp = 'customerInfo'
            res.status(500).json({
                error: err.errors.customerInfo.message
            })
        } else {
            console.log('error!!!', err, 'error')
            res.status(500).json({
                error: err.toString().substr(err.toString().lastIndexOf(':') + 1)
            })
        }
        /*        res.status(500).json({
                    error: err
                })*/
    })
})

router.patch('/:id', async (req, res, next) => {
    Schema.quotationModel.updateOne({_id: req.params.id}, {status: req.body.status}, {runValidators: true}).exec().then(result => {
        console.log(result)
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
    if (action === 'pdf') {
        const quotationId = req.params.id
        Schema.quotationModel.findById({_id: quotationId}, {__v: 0}).exec().then(async doc => {
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', 'attachment; filename = "offerte_"' + doc?.quotationValues.productName + '"')
            const pdfDoc = new PDFDocument({size: 'A4', autoFirstPage: false, bufferPages: true})
            pdfDoc.pipe(res)
            const background = function () {
                let grad = pdfDoc.linearGradient(1, 840, 594, 1)
                grad.stop(0, 'white').stop(1, '#4c8145')
                pdfDoc.rect(1, 1, 594, 840).lineWidth(2).fillOpacity(0.5).fillAndStroke(grad, "#4c8145")
            }
            const heading = function () {
                pdfDoc.fontSize(36)
                pdfDoc.fillOpacity(1).fillColor('#3a5835').text('BESTELBON', 25, 25, {width: 400, align: 'left'})
                pdfDoc.fontSize(9)
                pdfDoc.fillOpacity(1).fillColor('black').text('Datum: '
                    + Intl.DateTimeFormat('en-GB').format(new Date()), 400, 25, {width: 150, align: 'left'})
                    .text('Vistaline BV', 25, 90, {width: 400, align: 'left'})
                    .text('Lozenhoek 8', 25, 105, {width: 400, align: 'left'})
                    .text('2860 Sint-Katelijne-Waver', 25, 120, {width: 400, align: 'left'})
                    .text('0470/41.11.07', 25, 135, {width: 400, align: 'left'})
                pdfDoc.fillOpacity(1).fillColor('#85823a').text('info@hottub-centrale.be', 25, 150)
                let width = pdfDoc.widthOfString('info@hottub-centrale.be')
                let height = pdfDoc.currentLineHeight()
                pdfDoc.underline(25, 151, width, height, {color: '#85823a'})
                pdfDoc.link(25, 150, width, height, 'mailto:info@hottub-centrale.be')
                pdfDoc.fillOpacity(1).fillColor('black').text('FACTUUR NAAR:', 310, 90)
                    .text(doc?.customerInfo.firstName + ' ' + doc?.customerInfo.lastName, 400, 90)
                    .text(doc?.customerInfo.street + ' ' + doc?.customerInfo.houseNumber, 400, 105)
                    .text(doc?.customerInfo.postalCode + ' ' + doc?.customerInfo.city, 400, 120)
                    .text(doc?.customerInfo.phoneNumber, 400, 135)
                pdfDoc.fillOpacity(1).fillColor('#85823a').text(doc?.customerInfo.email, 400, 150, {
                    width: 200,
                    align: 'left'
                })
                width = pdfDoc.widthOfString(doc?.customerInfo.email)
                height = pdfDoc.currentLineHeight()
                pdfDoc.underline(400, 151, width, height, {color: '#85823a'})
                pdfDoc.link(400, 150, width, height, 'mailto:' + doc?.customerInfo.email)
            }
            const header = function () {
                pdfDoc.rect(25, 190, 180, 26).lineWidth(1).fillOpacity(1).fillAndStroke('#4c8145', 'grey')
                    .rect(205, 190, 180, 26).lineWidth(1).fillOpacity(1).fillAndStroke()
                    .rect(385, 190, 180, 26).lineWidth(1).fillOpacity(1).fillAndStroke()
                pdfDoc.rect(25, 216, 180, 20).lineWidth(1).fillOpacity(1).stroke('grey')
                    .rect(205, 216, 180, 20).lineWidth(1).fillOpacity(1).stroke()
                    .rect(385, 216, 180, 20).lineWidth(1).fillOpacity(1).stroke()
                pdfDoc.fontSize(9)
                pdfDoc.fillOpacity(1).fillColor('black').text('ORDERDATUM', 35, 200, {width: 170, align: 'left'})
                    .text('ORDERNUMMER', 215, 200, {width: 170, align: 'left'})
                    .text('CONTACT', 395, 200, {width: 170, align: 'left'})
                const strDate = Intl.DateTimeFormat('en-GB').format(doc?.creationDate)
                pdfDoc.text(strDate, 35, 224, {width: 170, align: 'left'})
                    .text(doc?.quotationNumber, 215, 224, {width: 170, align: 'left'})
                    .text(`${process.env.contact}`, 395, 224, {width: 170, align: 'left'})
            }
            const footer = function () {
                pdfDoc.image('./assets/logo_hottub_centrale.PNG', 35, 720, {width: 120})
                pdfDoc.lineGap(4)
                    .text('Neem contact op met de klantenservice via telefoon als u vragen of opmerkingen heeft.', 300, 725,
                        {width: 260, align: 'right'}).lineGap(0).moveDown(0.4)
                    .text('BEDANKT VOOR UW BESTELLING.', {width: 260, align: 'right'})
            }
            const contentHeader = function () {
                pdfDoc.rect(25, 255, 90, 26).lineWidth(1).fillOpacity(1).fillAndStroke('#4c8145', 'grey')
                    .rect(115, 255, 360, 26).lineWidth(1).fillOpacity(1).fillAndStroke()
                    .rect(475, 255, 90, 26).lineWidth(1).fillOpacity(1).fillAndStroke()
                pdfDoc.fillOpacity(1).fillColor('black').text('ARTIKELNR.', 35, 265, {width: 80, align: 'left'})
                    .text('OMSCHRIJVING', 125, 265, {width: 340, align: 'left'})
                    .text('PRIJS', 485, 265, {width: 80, align: 'left'})
            }
            // berekening van het aantal benodigde pagina's en records
            let numberOfLines = (doc?.quotationValues.productSpecifications.length + 1 + doc?.quotationValues.optionValues.length
                + doc?.quotationValues.quotationSpecificationValues.length + 1 + (doc?.discount > 0 ? 6 : 5))
            const numberOfPages = Math.ceil(numberOfLines / 20)
            numberOfLines += (numberOfPages > 1 ? (numberOfPages - 1) * 2 : 0)
            // berekenen of de lege lijn tussen opties en offspecs nodig is of niet
            if(doc?.quotationValues.productSpecifications.length + 1 + doc?.quotationValues.optionValues.length===18) numberOfLines--
            // aanmaken van de pagina's zonder records
            for (let i = 0; i < numberOfPages; i++) {
                pdfDoc.addPage()
                background()
                heading()
                header()
                contentHeader()
                footer()
            }
            let currentPage = 0
            let reset = 0
            pdfDoc.switchToPage(0)
            // kostprijsberekening
            let priceVATexcl = doc?.quotationValues.productPrice
            priceVATexcl += doc?.quotationValues.optionValues.map(option=>option.price).reduce((val1, val2) => val1 + val2,0)
            priceVATexcl += doc?.quotationValues.quotationSpecificationValues.map(spec=>spec.price).reduce((val1, val2) => val1 + val2,0)
            const discount = (doc?.discount / 100) * priceVATexcl
            const tax = (priceVATexcl - discount) * (doc?.VAT / 100)
            const totalPrice = (priceVATexcl - discount) + tax
            const deposit = totalPrice * (doc?.deposit / 100)
            const minimalI = doc?.quotationValues.optionValues.length +
                doc?.quotationValues.productSpecifications.length + 2 + doc?.quotationValues.quotationSpecificationValues.length + 1
            // content
            for (let i = 0; i < numberOfLines; i++) {
                pdfDoc.rect(25, 281 + (i - reset) * 20, 90, 20).lineWidth(1).fillOpacity(1).stroke('grey')
                    .rect(115, 281 + (i - reset) * 20, 360, 20).lineWidth(1).fillOpacity(1).stroke()
                    .rect(475, 281 + (i - reset) * 20, 90, 20).lineWidth(1).fillOpacity(1).stroke()
                if (i === 0) {
                    pdfDoc.fillOpacity(1).fillColor('black').text(doc?.quotationValues.productName, 125, 288, {
                        width: 340,
                        align: 'left'
                    }).text(doc?.quotationValues.productPrice + ' €', 485, 288, {
                        width: 340,
                        align: 'left'
                    })
                } else if (i <= doc?.quotationValues.productSpecifications.length) {
                    pdfDoc.fillOpacity(1).fillColor('black').text(doc?.quotationValues.productSpecifications[i - 1].name, 125, 288 + (i - reset) * 20, {
                        width: 340,
                        align: 'left'
                    })
                } else if (i <= doc?.quotationValues.optionValues.length + doc?.quotationValues.productSpecifications.length) {
                    pdfDoc.fillOpacity(1).fillColor('black')
                        .text(doc?.quotationValues.optionValues[i - (doc?.quotationValues.productSpecifications.length) - 1].name, 125, 288 + (i - reset) * 20, {
                            width: 340,
                            align: 'left'
                        })
                    const zero = doc?.quotationValues.optionValues[i - (doc?.quotationValues.productSpecifications.length) - 1].price === 0
                    pdfDoc.text(zero ? 'inbegrepen' : doc?.quotationValues.optionValues[i - (doc?.quotationValues.productSpecifications.length) - 1].price + ' €',
                        485, 288 + (i - reset) * 20, {
                            width: 340,
                            align: 'left'
                        })
                } else if (i <= doc?.quotationValues.optionValues.length +
                    doc?.quotationValues.productSpecifications.length + 2 + doc?.quotationValues.quotationSpecificationValues.length) {
                    if (i % 19 === 0) {
                        pdfDoc.fillOpacity(1).fillColor('black')
                            .text('Het vervolg van deze bestelling vindt u op de volgende pagina.', 125, 288 + (i - reset) * 20, {
                                width: 340,
                                align: 'left'
                            })
                    } else if (i % 18 > 0 && doc?.quotationValues.quotationSpecificationValues.length>0) {
                        const index = i - (doc?.quotationValues.productSpecifications.length) - 1 - doc?.quotationValues.optionValues.length
                        if (index !== 0) {
                            pdfDoc.fillOpacity(1).fillColor('black')
                                .text(doc?.quotationValues.quotationSpecificationValues[index - 2].name, 125, 288 + (i - reset) * 20, {
                                    width: 340,
                                    align: 'left'
                                })
                            const zero = doc?.quotationValues.quotationSpecificationValues[index - 2].price === 0
                            pdfDoc.text(zero ? 'inbegrepen' : doc?.quotationValues.quotationSpecificationValues[index - 2].price + ' €',
                                485, 288 + (i - reset) * 20, {
                                    width: 340,
                                    align: 'left'
                                })
                        } else if (i % 20 === 0) {
                            pdfDoc.fillOpacity(1).fillColor('black')
                                .text(doc?.quotationValues.quotationSpecificationValues[index - 1].name, 125, 288 + (i - reset) * 20, {
                                    width: 340,
                                    align: 'left'
                                })
                            const zero = doc?.quotationValues.quotationSpecificationValues[index - 1].price === 0
                            pdfDoc.text(zero ? 'inbegrepen' : doc?.quotationValues.quotationSpecificationValues[index - 1].price + ' €',
                                485, 288 + (i - reset) * 20, {
                                    width: 340,
                                    align: 'left'
                                })
                        }
                    }
                } else {
                    // de prijsberekening komt hier
                    // ook hier is het mogelijk dat er overgang moet worden voorzien
                    // of als er geen offerte specs tenminste een lijn voorzien
                    let name = ''
                    let price = ''
                    let deliveryTime = ''
                    if (discount > 0) {
                        switch (i-minimalI) {
                            case 0:
                                name = 'Totaal excl. BTW'
                                price = priceVATexcl
                                break
                            case 1:
                                name = 'Korting'
                                price = discount
                                break
                            case 2:
                                name = 'BTW (' + doc?.VAT + '%)'
                                price = tax
                                break
                            case 3:
                                name = 'Totaal incl. BTW'
                                price = totalPrice
                                break
                            case 4:
                                name = 'Voorschot te betalen bij bestelling (' + doc?.deposit + '%)'
                                price = deposit
                                break
                            case 5:
                                name = doc?.deliveryTime + 'na bestelling'
                                deliveryTime = 'Leveringstermijn'
                                break
                        }
                    } else {
                        switch (i-minimalI) {
                            case 0:
                                console.log('i=',i,'numberoflines',numberOfLines)
                                name = 'Totaal excl. BTW'
                                price = priceVATexcl
                                break
                            case 1:
                                name = 'BTW (' + doc?.VAT + '%)'
                                price = tax
                                console.log(name,price,'2')
                                break
                            case 2:
                                name = 'Totaal incl. BTW'
                                price = totalPrice
                                console.log(name,price,'3')
                                break
                            case 3:
                                name = 'Voorschot te betalen bij bestelling (' + doc?.deposit + '%)'
                                price = deposit
                                console.log(name,price,'4')
                                break
                            case 4:
                                name = doc?.deliveryTime + ' na bestelling'
                                deliveryTime = 'Leveringstermijn'
                                break
                        }
                    }
                    pdfDoc.fillOpacity(1).fillColor('black')
                        .text(name, 125, 288 + (i - reset) * 20, {
                            width: 340,
                            align: 'left'
                        })
                    if(price.length!==0){
                        pdfDoc.text(price + ' €',
                            485, 288 + (i - reset) * 20, {
                                width: 340,
                                align: 'left'
                            })
                    }
                    if(deliveryTime.length!==0){
                        pdfDoc.text(deliveryTime,
                            35, 288 + (i - reset) * 20, {
                                width: 340,
                                align: 'left'
                            })
                    }
                }
                // todo header met pagina hoofding voorzien
                // todo paginanummers onderaan vermelden
                // todo rekening houden met de mogelijkheid dat kostprijs er maar half opkan zodat die op het volgend blad
                //  moet komen in zijn geheel
                if ((i + 1) % 20 === 0 && currentPage + 1 < numberOfPages) {
                    pdfDoc.switchToPage((i + 1) / 20)
                    reset += 20
                    currentPage++
                }
            }
            pdfDoc.end()
        })
    } else if (action === 'mail') {
        const quotationId = req.params.id
        Schema.quotationModel.findById({_id: quotationId}, {__v: 0}).exec().then(doc => {
            if (doc?.status !== 'aangemaakt' && doc?.status !== 'aangepast' && doc?.status !== 'aan te passen') {
                throw new Error('Enkel offertes met status \'aangemaakt\', \'aangepast\' of \'aan te passen\' kunnen verstuurd worden.')
            }
            const pdfDoc = new PDFDocument({size: 'A4'})
            // todo finish the quotation pdf
            // achtergrond + omkadering
            let grad = pdfDoc.linearGradient(1, 840, 594, 1)
            grad.stop(0, 'white').stop(1, '#4c8145')
            pdfDoc.rect(1, 1, 594, 840).lineWidth(2).fillOpacity(0.5).fillAndStroke(grad, "#4c8145")
            // hoofding
            pdfDoc.fontSize(36)
            pdfDoc.fillOpacity(1).fillColor('#3a5835').text('BESTELBON', 25, 25, {width: 400, align: 'left'})
            pdfDoc.fontSize(9)
            pdfDoc.fillOpacity(1).fillColor('black').text('Datum: '
                + Intl.DateTimeFormat('en-GB').format(new Date()), 425, 25, {width: 150, align: 'left'})
                .text('Vistaline BV', 25, 90, {width: 400, align: 'left'})
                .text('Lozenhoek 8', 25, 105, {width: 400, align: 'left'})
                .text('2860 Sint-Katelijne-Waver', 25, 120, {width: 400, align: 'left'})
                .text('0470/41.11.07', 25, 135, {width: 400, align: 'left'})
            pdfDoc.fillOpacity(1).fillColor('#85823a').text('tom.sempels@gmail.com', 25, 150)
            const width = pdfDoc.widthOfString('tom.sempels@gmail.com')
            const height = pdfDoc.currentLineHeight()
            pdfDoc.underline(25, 150, width, height, {color: '#85823a'})
            pdfDoc.link(25, 150, width, height, 'mailto:tom.sempels@gmail.com')
            pdfDoc.end()
            const sendEmail = async options => {
                /*                const transporter = nodemailer.createTransport({
                                    service: `${process.env.emailProvider}`,
                                    auth: {
                                        user: `${process.env.emailUser}`,
                                        pass: `${process.env.emailPassword}`
                                    }
                                })*/
                const transporter = nodemailer.createTransport(sendgridTransport({
                    auth: {
                        api_key: `${process.env.apiKey}`
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
                    () => {
                        Schema.quotationModel.findOne({_id: quotationId}).then(quot => {
                            Schema.quotationModel.updateOne({_id: quotationId},
                                {
                                    $set: {status: 'verstuurd'},
                                    $push: {sendDate: 'verstuurd op ' + new Date() + ' naar ' + quot.customerInfo.email}
                                }, {runValidators: true}).exec().then(result => {
                                res.status(201).json(
                                )
                            })
                        }).catch(err => {
                            res.status(500).json({
                                error: err.error
                            })
                        })

                    }
                ).catch(err => {
                    res.status(500).json({
                        error: `email verzenden mislukt`
                    })
                })
            }
            sendEmail({
                email: doc?.customerInfo.email,
                subject: 'offerte sauna',
                message: 'graag uw goedkeuring of nieuw voorstel...',
                attachments: [
                    {
                        filename: 'offerte-hottub-centrale.pdf',
                        content: pdfDoc
                    }
                ]
            }).then(() => {
                res.status(201).json()
            }).catch(err => {
                res.status(500).json({
                    error: 'email verzenden mislukt'
                })
            })
        }).catch(err => {
            res.status(500).json({
                error: err.toString().substr(err.toString().indexOf(':') + 1)
            })
        })
    } else if (action === 'invoice') {
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

router.delete('/:id', async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        await Schema.quotationModel.findById({_id: req.params.id}).then(async quotation => {
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
