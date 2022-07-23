const mongoose = require('mongoose')
// todo mongoose virtual model
const invoiceSchema = new mongoose.Schema({
    // dit moet overschrijfbaar zijn
    invoiceNumber: {
        type: Number
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Quotation'
    },
    invoiceType: {type: String, enum: ['factuur', 'creditnota'], required: true, default: 'factuur'},
    history: {
        type: [{
            status: {
                type: String,
                enum: ['verstuurd op', 'aangemaakt op', 'creditnota aangemaakt op', 'voorschot betaald op', 'voldaan op'],
                required: true
            },
            timestamp: {type: Date, required: true}
        }
        ]
    }
}, {})

// virtual properties
invoiceSchema.virtual('customer').get(function () {
    console.log('virtual : whatss iside quotattion?' +this.quotation)
    return this.quotation.customerInfo.firstName + ' ' + this.quotation.customerInfo.lastName
}).set(function (v) {
    console.log(this.customer,'customer for invoice')
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
