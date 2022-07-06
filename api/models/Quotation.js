const mongoose = require('mongoose')

/************************************************************   schema's  *************************************************************************************/
const productSchemas = require('./Product')

const quotationSchema = new mongoose.Schema({
    groupId: mongoose.Schema.Types.ObjectId,
    // the previousVersionId is the quotationId (_id) of the previous version of the same quotation
    previousVersionId: mongoose.Schema.Types.ObjectId,
    version: {type:Number, min:1},
    productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
    selectedOptions: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Option'}]},
    selectedQuotationSpecifications: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'QuotationSpecification'}]},
    status: {type: String,enum:['aangemaakt','aangepast','verstuurd','goedgekeurd','aan te passen','geannuleerd']},
    customerInfo: {type:new mongoose.Schema({
            email:String,
            firstName:{
                type: String,
                required: true,
                minLength: [2, 'Een voornaam moet minimaal 2 letters hebben.'],
                trim: true
            },
            lastName:{
                type: String,
                required: true,
                minLength: [2, 'Een achternaam moet minimaal 2 letters hebben.'],
                trim: true
            }}),required:true},
    quotationValues: {
        type: {
            productName: {
                type: String,
                required: true,
                lowercase: true,
                minLength: [2, 'Een offerte specificatie dient minimaal 2 karakters lang te zijn.'],
                trim: true
            },
            productCat: {type: String, required: true, enum: ['hottub', 'sauna', 'tiny house']},
            productPrice: {type: Number, required: true, min: 100, alias: 'basePrice'},
            optionValues: {
                type: [{
                    _id:mongoose.Schema.Types.ObjectId,
                    name: {
                        type: String,
                        required: true,
                        minLength: [2, 'Een optie dient minimaal 2 karakters lang te zijn.'],
                        trim: true,
                        alias: 'productOption'
                    },
                    price: {type: Number, required: true, min: 100}
                }]
            },
            productSpecifications: {
                type: [{
                    _id:mongoose.Schema.Types.ObjectId,
                    name: {
                        type: String,
                        required: true,
                        minLength: [2, 'Een specificatie dient minimaal 2 karakters lang te zijn.'],
                        trim: true,
                        alias: 'productSpecification'
                    }
                }],
                required:true
            },
            quotationSpecificationValues: {
                type: [{
                    _id:mongoose.Schema.Types.ObjectId,
                    name: {
                        type: String,
                        required: true,
                        minLength: [2, 'Een offerte specificatie dient minimaal 2 karakters lang te zijn.'],
                        trim: true,
                        alias: 'quotationSpecification'
                    },
                    price: {type: Number, min: 0}
                }]
            },
        }
    },
    VAT: {type: Number, required: true, min: 0, default: 21},
    discount: {type: Number, required: true, min: 0, max:100, default: 0},
    creationDate: {type:Date},
    sendDate: {type:[Date]}
}, {})

const quotationSpecificationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: [2, 'Een offerte specificatie dient minimaal 2 karakters lang te zijn.'],
        trim: true,
        alias: 'quotationSpecification'
    },
    price: {type: Number,required:[true,'Voer een prijs in van minimaal 0 euro'], min: [0,'U moet een bedrag invoeren van minimaal 0 euro.']}
}, {})

/************************************************************   validation functions   **************************************************************************/

// nodige validaties voor beveiliging van de data
quotationSchema.path('productId').validate(async function (propValue) {
    const arr = await productSchemas.productModel.find({},{_id:1}).exec()
    let valid = false
    arr.forEach(obj=>{
        if(obj._id.toString()===propValue.toString()) valid = true
    })
    return valid
},'Geen geldig productId')

quotationSchema.path('selectedOptions').validate(function (propValue) {
    let ok = true
    propValue.forEach(id=>{
        let count = 0
        propValue.forEach(id2=>{
            if(id.toString()===id2.toString()) count++
        })
        if(count>1 && ok) ok = false
    })
    return ok
},'Ids opties niet uniek.')

quotationSchema.path('selectedOptions').validate(async function (propValue) {
    const arr = await productSchemas.optionModel.find({},{_id:1}).exec()
    let ok = true
    propValue.forEach(id=>{
        let includes = false
        arr.forEach(obj=>{
            if(obj._id.toString()===id.toString()) includes = true
        })
        if(!includes) ok = false
    })
    return ok
},'Ongeldige optie ids')

quotationSchema.path('selectedQuotationSpecifications').validate(function (propValue) {
    let ok = true
    propValue.forEach(id=>{
        let count = 0
        propValue.forEach(id2=>{
            if(id.toString()===id2.toString()) count++
        })
        if(count>1 && ok) ok = false
    })
    return ok
},'Ids offerte specs niet uniek.')

quotationSchema.path('selectedQuotationSpecifications').validate(async function (propValue) {
    const arr = await quotationSpecificationModel.find({},{_id:1}).exec()
    let mapping
    if(this.previousVersionId){
        const quotationId = this.previousVersionId.toString()
        const quotValues = await quotationModel.findById({_id:quotationId}, {quotationValues: 1})
        mapping = quotValues.quotationValues.quotationSpecificationValues.map(val=>{
            return val._id.toString()
        })
    }
    let ok = true
    for (const id of propValue) {
        let includes = false
        arr.forEach(obj=>{
            if(obj._id.toString()===id.toString()){
                includes = true
            }
        })
        if(!includes && (mapping && !(mapping.includes(id.toString()))||!mapping)){
            // de id is niet gekend in de database
            // het is nog mogelijk dat het om een oud id gaat
            ok = false
        }
    }
    return ok
},'Ongeldige offerte specificatie Id"s')

quotationSchema.path('customerInfo').validate(function(propValue){
    return propValue.firstName.substr(0,1).toUpperCase()===propValue.firstName.substr(0,1)
}, 'Een voornaam moet beginnen met een hoofdletter')

// valid prices
quotationSchema.path('quotationValues.price').validate(function (propValue) {
    return Math.trunc(propValue) === propValue
})

quotationSchema.path('quotationValues.optionsValues.price').validate(function (propValue) {
    return Math.trunc(propValue) === propValue
})

quotationSchema.path('quotationValues.quotationSpecificationsValues.price').validate(function (propValue) {
    return Math.trunc(propValue) === propValue
})

quotationSpecificationSchema.path('price').validate(function (propValue) {
    return Math.trunc(propValue) === propValue
})
// name must be unique, you may assume propValue is different from its original value
quotationSpecificationSchema.path('name').validate(async function (propValue) {
    const arr = await quotationSpecificationModel.find({}, {name: 1}).exec()
    return !arr.includes(propValue)
})


/*******************************************************************   methods  *********************************************************************************/


/********************************************************************   hooks  **********************************************************************************/

quotationSchema.pre('save',async function (next) {
    this.creationDate = Date.now()
    // the save method usually is only used for post requests where a new item is being created
    // in case of quotations however a new quotation is created with its own ObjectId
    // but also with a groupId and a version number to have a way to make different versions of the same quotation
    // we have made sure through validations that every quotation has a version number and a groupId
    // this points to the document not the schema!
    if(!this.groupId){
        // this is a new quotation which needs a fresh groupId and a version number of 1 - which is the default
        this.groupId = new mongoose.Types.ObjectId()
    } else{
        // the request concerns a new version of an existing quotation
        // which means a correct version number has to be set
        // an extra check has to be performed first namely - since quotations cannot be deleted -
        // check that the quotationId given has the correct groupId and version number ( the last version number for the given groupId )
        // since only the last version of a quotation is allowed to be updated with a new version
        const prevId = this.previousVersionId
        const quotation = await quotationModel.findById({_id:prevId.toString()}, {__v: 0}).exec()
        if(quotation && quotation.version!==undefined && quotation.groupId.toString()===this.groupId.toString()){
            const quots = await quotationModel.find({},{version:1}).where({groupId:this.groupId}).exec()
            quots.forEach(quot=>{
                if(quot.version > quotation.version) next(Error)
            })
            const newVersion = quotation.version + 1
            this.version = newVersion
        } else{
            next(Error)
        }
    }
    // this hook creates and assigns a value to the quotationValues property of the document to be saved
    const product = await productSchemas.productModel.findById({_id: this.productId}, {__v: 0}).populate('specifications', {__v: 0})
        .populate('options', {__v: 0}).exec()
    this.quotationValues = {}
    this.quotationValues.productName = product?.name
    this.quotationValues.productCat = product?.cat
    this.quotationValues.productPrice = product?.price
    this.quotationValues.optionValues = []
    product?.options.forEach(option => {
        if (this.selectedOptions.includes(option._id)) {
            this.quotationValues.optionValues.push({...option})
        }
    })
    this.quotationValues.productSpecifications = []
    product?.specifications.forEach(spec=>{
        this.quotationValues.productSpecifications.push({...spec})
    })
    this.quotationValues.quotationSpecificationValues = []
    const quotSpecs = await quotationSpecificationModel.find({}, {__v:0}).exec()
    quotSpecs.forEach(quotSpec => {
        if (this.selectedQuotationSpecifications.includes(quotSpec._id)) {
            this.quotationValues.quotationSpecificationValues.push({...quotSpec})
        }
    })
    if(this.previousVersionId){
        // wanneer je hier bent zijn alle id's van een offerte spec ok
        // het kan echter zijn dat er nog een id in zit van een vorige versie
        // dit moet bij het bewaren nu dan ook blijven
        // als je de vorige versie ophaalt zou previousValues deze moeten bevatten
        // bij hte bewaren echter wordt momenteel = bug een spec die niet langer in de db zit verwijderd uit de offerte wat niet mag
        // this.quotationValues.quotationSpecificationValues => dit bevat de textuele waarden van dit onderdeel voor de vorige versie
        const quotationId = this.previousVersionId.toString()
        const quotValues = await quotationModel.findById({_id:quotationId}, {quotationValues: 1})
        const previousValues = quotValues.quotationValues.quotationSpecificationValues
        // this.quotationValues.quotationSpecificationValues bevat blijkbaar enkel 1 en 2 en
        // dat is logisch enkel diegene die in de db zitten zit er momenteel in
        // en dan is values leeg, dit komt omdat selected ook de id's bevat die niet langer bestaan
        const mapping = this.quotationValues.quotationSpecificationValues.map(val=>{
            return val._doc._id
        })
        // mapping bevat de id's die ook in de db zitten en die ook in selected zitten
        this.selectedQuotationSpecifications.filter(id=>{
            return !(mapping.find(v=>{
                return v.toString()===id.toString()
            }))
        }).forEach(val=>{
            // val is een id dat niet in de db zit
            // get the raw values from previousVersion

            const value = previousValues.find(val2=>{
                return val2._id.toString()===val.toString()
            })
            if(value) this.quotationValues.quotationSpecificationValues.push({...value})
        })
    }
})

/* LOGICA omtrent offertes

Offertes kunnen gewijzigd worden in principe à volonté. Bij elke wijziging wordt een nieuwe versie aangemaakt zodat oudere versies steeds beschikbaar blijven.

Als je een product van een lopende offerte aanpast dan heeft dit geen effect op
de offerte zolang je de offerte niet aanpast. Concreet wil dat zeggen dat zolang je geen nieuwe versie maakt van een bestaande
offerte, de gegevens van het product worden gebruikt voor de pdf van de offerte én voor de factuur die je ervan zou maken, zoals het product was
op het moment van aanmaak van de offerte (of de versie, indien er al andere versies van zouden zijn). Van zodra je een nieuwe versie maakt en bewaard hebt
dan is het het product bij aanmaak van deze versie dat zal dienen als basis voor het maken van een pdf van de offerte en de factuur.
Je kan dus geen nieuwe versie van een offerte maken met het oude product als basis.

Het mechanisme hierachter is als volgt: bij het laden van de offerte wordt het product genomen uit de database. De opties die aangevinkt waren
én die voorkomen in de lijst van het ingelade product worden ook nu aangevinkt getoond. De volledige lijst van beschikbare opties
is de lijst van het ingelade product, niet per se de lijst van het product zoals het was op het moment van aanmaak van de offerte, of aanmaak van de versie
die je thans wenst te wijzigen. Opties die niet langer
aanwezig zijn in het ingelade product worden dus ook niet meer getoond en worden dus niet bewaard als je de nieuwe versie van de offerte zou bewaren.
Gevolg hiervan is dat niet alleen de selectie minder opties kan bevatten maar ook dat de prijs van deze opties ondertussen gewijzigd is.
Als je dus op bewaren zou klikken zal deze nieuwe prijs gebruikt worden voor de offerte, niet de oude prijs van de vorige versie!
Er zal wel een mededeling op het scherm getoond worden indien er prijsafwijkingen zouden zijn door deze situatie, alsook wanneer niet alle opties
op het nieuwe product aanwezig zouden zijn. Deze mededelingen zijn mogelijk doordat naast het product zelf ook de gegevens van de bewaarde offerte worden ingeladen.

Indien het product van de offerte niet langer zou bestaan doordat het verwijderd is geweest door de gebruiker, dan moet je een ander product selecteren om
de aanpassing van de offerte te kunnen bewaren. Dat zal ook zo vermeld worden in een mededeling.

Om al deze redenen is het sterk afgeraden om producten te wijzigen waarvan er offertes lopende van zijn.

Je kan enkel de laatste versie van een offerte aanpassen. Oudere versies zijn enkel raadpleegbaar.
Enkel de laatste versie van een offerte kan de status 'goedgekeurd'
of 'geannuleerd' krijgen.

Een aangemaakte offerte of versie kan je niet verwijderen. Wat wel mogelijk is, is de offerte de status 'geannuleerd' mee te geven. Een andere status is
'goedgekeurd'. In dat geval kan je niet langer een nieuwe versie aanmaken van de offerte. Dat kan evenmin als het de status 'geannuleerd' heeft.
De status 'geannuleerd' en 'goedgekeurd' is dus definitief. Deze statussen worden telkens aan de laatste (bewaarde) versie van de offerte toegekend.

Enkel een offerte met de status 'goedgekeurd' kan gefactureerd worden. De status 'goedgekeurd' en de actie factureren kan in 1 beweging gebeuren.
Een offerte waarvan een factuur is gemaakt krijgt de status 'gefactureerd'.

Wanneer een offerte niet één van de hierboven vermelde statussen heeft, heeft de offerte de status 'lopend'.

#Offertespecificaties
Ook deze kan je aanpassen/verwijderen naar willekeur. Dezelfde regels gelden hier. Een nieuwe versie van een offerte kan maar gemaakt worden
(en kunnen maar getoond worden op het scherm)
met de specificaties zoals ze op dat moment bestaan in de database. Ook hier zal dan een vermelding van komen op het scherm zodat de gebruiker op de hoogte is
hiervan. Offertespecificaties kunnen een prijs hebben, maar dat is niet verplicht.

(Facturen kan je niet verwijderen, enkel creditnota's kunnen opgemaakt worden. Facturen worden opgemaakt op basis van de gegevens zoals ze waren
op het moment van het bewaren van de laaste versie van een offerte. Ongeacht wat er daarna aan wijzigingen is gedaan met offerte, offerte specificaties of producten,
specificaties en opties).

* */

/*****************************************************************   models  ************************************************************************************/

const quotationSpecificationModel = mongoose.model('QuotationSpecification', quotationSpecificationSchema)
const quotationModel = mongoose.model('Quotation', quotationSchema)


module.exports = {quotationSpecificationModel, quotationModel}
