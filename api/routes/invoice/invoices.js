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
