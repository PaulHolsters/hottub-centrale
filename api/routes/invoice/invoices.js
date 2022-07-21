const express = require('express')
const router = express.Router()

const sendgridTransport = require('nodemailer-sendgrid-transport')

const PDFDocument = require('pdfkit')

const Schema = require('../../models/Invoice')
const mongoose = require("mongoose");

router.post('/', async (req, res, next) => {
    const invoice = new Schema.invoiceModel({
        quotationId: req.body.quotationId,
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

module.exports = router
