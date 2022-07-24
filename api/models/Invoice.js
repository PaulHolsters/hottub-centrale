const mongoose = require('mongoose')

const invoiceSchema = new mongoose.Schema({
    // todo dit moet overschrijfbaar zijn
    invoiceNumber: {
        type: Number
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Quotation'
    },
    invoiceType: {type: String, enum: ['factuur', 'creditnota'], required: true, default: 'factuur'},
    history: [
        {
            name: {type: String, required: true},
            status: {type: Boolean, required: true},
            time: {type: Date}
        }
        ]
}, {})

// virtual properties
invoiceSchema.virtual('customer').get(function () {
    return this.quotation.customerInfo.firstName + ' ' + this.quotation.customerInfo.lastName
}).set(function (v) {
    this.customer = v
})

// natural numbers
invoiceSchema.path('invoiceNumber').validate(function (propValue) {
    return Number.isInteger(propValue) && propValue > 2200
})

invoiceSchema.pre('save', async function (next) {
    const invoice = await invoiceModel.find().select('invoiceNumber').sort({invoiceNumber: -1}).limit(1).exec()
    this.invoiceNumber = invoice[0]?.invoiceNumber + 1 || 2201
})

const invoiceModel = mongoose.model('Invoice', invoiceSchema)

module.exports = {invoiceModel}
