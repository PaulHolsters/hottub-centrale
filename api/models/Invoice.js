const mongoose = require('mongoose')

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
