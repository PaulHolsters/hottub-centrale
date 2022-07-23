const express = require('express')
const router = express.Router()

const sendgridTransport = require('nodemailer-sendgrid-transport')

const PDFDocument = require('pdfkit')

const Schema = require('../../models/Invoice')
const mongoose = require("mongoose");

router.post('/', async (req, res, next) => {
    const invoice = new Schema.invoiceModel({
        quotation: req.body.quotation,
        invoiceNumber: req.body.invoiceNumber
    })
    invoice.save().then(result => {
        res.status(201).json()
    }).catch(err => {
        res.status(500).json({
            error: err.toString().substr(err.toString().lastIndexOf(':') + 2)
        })
    })
})

router.get('/action/:id', async (req, res, next) => {
    const action = req.query.action
    if (action === 'pdf') {
        const invoiceId = req.params.id
        Schema.invoiceModel.findById({_id: invoiceId}, {__v: 0}).populate('quotation').exec().then(async doc => {
            console.log('gevodnen factuur',doc)
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', 'attachment; filename = "factuur_"' + doc?.invoiceNumber + '"')
            const pdfDoc = new PDFDocument({size: 'A4', autoFirstPage: false, bufferPages: true})
            pdfDoc.pipe(res)
            const background = function () {
                let grad = pdfDoc.linearGradient(1, 840, 594, 1)
                grad.stop(0, 'white').stop(1, '#4c8145')
                pdfDoc.rect(1, 1, 594, 840).lineWidth(2).fillOpacity(0.5).fillAndStroke(grad, "#4c8145")
            }
            const heading = function () {
                pdfDoc.fontSize(36)
                pdfDoc.fillOpacity(1).fillColor('#3a5835').text('FACTUUR '+doc?.invoiceNumber, 25, 25, {width: 400, align: 'left'})
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
                    .text(doc?.customer, 400, 90)
                    .text(doc?.quotation.customerInfo.street + ' ' + doc?.quotation.customerInfo.houseNumber, 400, 105)
                    .text(doc?.quotation.customerInfo.postalCode + ' ' + doc?.quotation.customerInfo.city, 400, 120)
                    .text(doc?.quotation.customerInfo.phoneNumber, 400, 135)
                pdfDoc.fillOpacity(1).fillColor('#85823a').text(doc?.quotation.customerInfo.email, 400, 150, {
                    width: 200,
                    align: 'left'
                })
                width = pdfDoc.widthOfString(doc?.quotation.customerInfo.email)
                height = pdfDoc.currentLineHeight()
                pdfDoc.underline(400, 151, width, height, {color: '#85823a'})
                pdfDoc.link(400, 150, width, height, 'mailto:' + doc?.quotation.customerInfo.email)
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
                const strDate = Intl.DateTimeFormat('en-GB').format(doc?.quotation.creationDate)
                pdfDoc.text(strDate, 35, 224, {width: 170, align: 'left'})
                    .text(doc?.quotation.quotationNumber, 215, 224, {width: 170, align: 'left'})
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
            let numberOfLines = (doc?.quotation.quotationValues.productSpecifications.length + 1 + doc?.quotation.quotationValues.optionValues.length
                + doc?.quotation.quotationValues.quotationSpecificationValues.length + 1 + (doc?.quotation.discount > 0 ? 6 : 5))
            const numberOfPages = Math.ceil(numberOfLines / 20)
            numberOfLines += (numberOfPages > 1 ? (numberOfPages - 1) * 2 : 0)
            // berekenen of de lege lijn tussen opties en offspecs nodig is of niet
            if(doc?.quotation.quotationValues.productSpecifications.length + 1 + doc?.quotation.quotationValues.optionValues.length===18) numberOfLines--
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
            let priceVATexcl = doc?.quotation.quotationValues.productPrice
            priceVATexcl += doc?.quotation.quotationValues.optionValues.map(option=>option.price).reduce((val1, val2) => val1 + val2,0)
            priceVATexcl += doc?.quotation.quotationValues.quotationSpecificationValues.map(spec=>spec.price).reduce((val1, val2) => val1 + val2,0)
            const discount = (doc?.quotation.discount / 100) * priceVATexcl
            const tax = (priceVATexcl - discount) * (doc?.quotation.VAT / 100)
            const totalPrice = (priceVATexcl - discount) + tax
            const deposit = totalPrice * (doc?.quotation.deposit / 100)
            const minimalI = doc?.quotation.quotationValues.optionValues.length +
                doc?.quotation.quotationValues.productSpecifications.length + 2 + doc?.quotation.quotationValues.quotationSpecificationValues.length + 1
            // content
            for (let i = 0; i < numberOfLines; i++) {
                pdfDoc.rect(25, 281 + (i - reset) * 20, 90, 20).lineWidth(1).fillOpacity(1).stroke('grey')
                    .rect(115, 281 + (i - reset) * 20, 360, 20).lineWidth(1).fillOpacity(1).stroke()
                    .rect(475, 281 + (i - reset) * 20, 90, 20).lineWidth(1).fillOpacity(1).stroke()
                if (i === 0) {
                    pdfDoc.fillOpacity(1).fillColor('black').text(doc?.quotation.quotationValues.productName, 125, 288, {
                        width: 340,
                        align: 'left'
                    }).text(doc?.quotation.quotationValues.productPrice + ' €', 485, 288, {
                        width: 340,
                        align: 'left'
                    })
                } else if (i <= doc?.quotation.quotationValues.productSpecifications.length) {
                    pdfDoc.fillOpacity(1).fillColor('black').text(doc?.quotation.quotationValues.productSpecifications[i - 1].name, 125, 288 + (i - reset) * 20, {
                        width: 340,
                        align: 'left'
                    })
                } else if (i <= doc?.quotation.quotationValues.optionValues.length + doc?.quotation.quotationValues.productSpecifications.length) {
                    pdfDoc.fillOpacity(1).fillColor('black')
                        .text(doc?.quotation.quotationValues.optionValues[i - (doc?.quotation.quotationValues.productSpecifications.length) - 1].name, 125, 288 + (i - reset) * 20, {
                            width: 340,
                            align: 'left'
                        })
                    const zero = doc?.quotation.quotationValues.optionValues[i - (doc?.quotation.quotationValues.productSpecifications.length) - 1].price === 0
                    pdfDoc.text(zero ? 'inbegrepen' : doc?.quotation.quotationValues.optionValues[i - (doc?.quotation.quotationValues.productSpecifications.length) - 1].price + ' €',
                        485, 288 + (i - reset) * 20, {
                            width: 340,
                            align: 'left'
                        })
                } else if (i <= doc?.quotation.quotationValues.optionValues.length +
                    doc?.quotation.quotationValues.productSpecifications.length + 2 + doc?.quotation.quotationValues.quotationSpecificationValues.length) {
                    if (i % 19 === 0) {
                        pdfDoc.fillOpacity(1).fillColor('black')
                            .text('Het vervolg van deze factuur vindt u op de volgende pagina.', 125, 288 + (i - reset) * 20, {
                                width: 340,
                                align: 'left'
                            })
                    } else if (i % 18 > 0 && doc?.quotation.quotationValues.quotationSpecificationValues.length>0) {
                        const index = i - (doc?.quotation.quotationValues.productSpecifications.length) - 1 - doc?.quotation.quotationValues.optionValues.length
                        if (index !== 0) {
                            pdfDoc.fillOpacity(1).fillColor('black')
                                .text(doc?.quotation.quotationValues.quotationSpecificationValues[index - 2].name, 125, 288 + (i - reset) * 20, {
                                    width: 340,
                                    align: 'left'
                                })
                            const zero = doc?.quotation.quotationValues.quotationSpecificationValues[index - 2].price === 0
                            pdfDoc.text(zero ? 'inbegrepen' : doc?.quotation.quotationValues.quotationSpecificationValues[index - 2].price + ' €',
                                485, 288 + (i - reset) * 20, {
                                    width: 340,
                                    align: 'left'
                                })
                        } else if (i % 20 === 0) {
                            pdfDoc.fillOpacity(1).fillColor('black')
                                .text(doc?.quotation.quotationValues.quotationSpecificationValues[index - 1].name, 125, 288 + (i - reset) * 20, {
                                    width: 340,
                                    align: 'left'
                                })
                            const zero = doc?.quotation.quotationValues.quotationSpecificationValues[index - 1].price === 0
                            pdfDoc.text(zero ? 'inbegrepen' : doc?.quotation.quotationValues.quotationSpecificationValues[index - 1].price + ' €',
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
                                name = 'BTW (' + doc?.quotation.VAT + '%)'
                                price = tax
                                break
                            case 3:
                                name = 'Totaal incl. BTW'
                                price = totalPrice
                                break
                            case 4:
                                name = 'Voorschot te betalen bij bestelling (' + doc?.quotation.deposit + '%)'
                                price = deposit
                                break
                            case 5:
                                name = doc?.quotation.deliveryTime + 'na bestelling'
                                deliveryTime = 'Leveringstermijn'
                                break
                        }
                    } else {
                        switch (i-minimalI) {
                            case 0:
                                name = 'Totaal excl. BTW'
                                price = priceVATexcl
                                break
                            case 1:
                                name = 'BTW (' + doc?.quotation.VAT + '%)'
                                price = tax
                                break
                            case 2:
                                name = 'Totaal incl. BTW'
                                price = totalPrice
                                break
                            case 3:
                                name = 'Voorschot te betalen bij bestelling (' + doc?.quotation.deposit + '%)'
                                price = deposit
                                break
                            case 4:
                                name = doc?.quotation.deliveryTime + ' na bestelling'
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
    }
})

router.get('/', (req, res, next) => {
    Schema.invoiceModel.find({}, {__v: 0}).populate('quotation', {__v: 0}).then(result => {
        const invoices = result.map(res=>{
            const invoice = Object.assign({},res._doc)
            invoice['customer'] = res.customer
            return invoice
        })
        res.status(200).json(
            {
                invoices: invoices
            }
        )
    }).catch(err => {
        res.status(500).json({
            error: 'something went wrong'
        })
    })
})

module.exports = router
