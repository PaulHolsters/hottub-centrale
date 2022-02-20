const mongoose = require('mongoose')

/************************************************************   schema's  *************************************************************************************/

const productSchema = new mongoose.Schema({
    name: {
        type: String, required: true, lowercase: true, trim: true,
        minlength: [2, 'Een productnaam dient minimaal 2 karakters lang te zijn.'], alias: 'productName'
    },
    cat: {type: String, enum: ['hottub', 'sauna', 'tiny house'], required: true, alias: 'category', default: 'hottub'},
    price: {type: Number, required: true, min: 100, alias: 'basePrice'},
    specifications: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: 'ProductSpecification'}]
    },
    options: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'ProductOption'}]}
}, {})

const productSpecificationSchema = new mongoose.Schema({
    name: {type: String, required: true, lowercase: true, minlength:[2,'Een specificatie dient minimaal 2 karakters lang te zijn.'],
        trim: true, alias: 'productSpecification'}
},{})

const productOptionSchema = new mongoose.Schema({
    name: {type: String, required: true, lowercase: true, minlength:[2,'Een optie dient minimaal 2 karakters lang te zijn.'],
        trim: true, alias: 'productOption'},
    price: {type: Number, required: true, min: 100}
},{})

/************************************************************   validation functions   **************************************************************************/

productSchema.path('name').validate(async function (propValue) {
    if(this._update){
        // a name always gets inserted in lowercase after trimming
        return (await productModel.find().where('name').equals(propValue).countDocuments()) === 1
    } else{
        // a name always gets inserted in lowercase after trimming
        return (await productModel.find().where('name').equals(propValue).countDocuments()) === 0
    }
}, 'Er bestaat al een product met deze naam.')

productSchema.path('price').validate(function (propValue) {
    return Math.trunc(propValue) === propValue
})

productSchema.path('specifications').validate(function (propValue) {
    let ok = true
    propValue.forEach(id=>{
        let count = 0
        propValue.forEach(id2=>{
            if(id.toString()===id2.toString()) count++
        })
        if(count>1 && ok) ok = false
    })
    return ok
},'Id niet uniek.')

productSchema.path('specifications').validate(async function (propValue) {
    console.log('running spec val')
    if(this._update){
        return (await productModel.find().where('specifications').all(propValue).size(propValue.length)).length === 1
    } else{
        return (await productModel.find().where('specifications').all(propValue).size(propValue.length)).length === 0
    }
}, 'Lijst met specificaties is niet uniek.')

productSchema.path('specifications').validate(function (propValue) {
    return propValue.length > 0
},'Minimaal 1 specificatie mee te geven.')

productSchema.path('specifications').validate(async function (propValue) {
    const arr = await specificationModel.find({},{_id:1}).exec()
    let ok = true
    propValue.forEach(id=>{
        let includes = false
        arr.forEach(obj=>{
            if(obj._id.toString()===id.toString()) includes = true
        })
        if(!includes) ok = false
    })
    return ok
},'Geen geldig id')

productSchema.path('options').validate(function (propValue) {
    let ok = true
    propValue.forEach(id=>{
        let count = 0
        propValue.forEach(id2=>{
            if(id.toString()===id2.toString()) count++
        })
        if(count>1 && ok) ok = false
    })
    return ok
},'Id niet uniek.')

productSchema.path('options').validate(async function (propValue) {
    const arr = await optionModel.find({},{_id:1}).exec()
    let ok = true
    propValue.forEach(id=>{
        let includes = false
        arr.forEach(obj=>{
            if(obj._id.toString()===id.toString()) includes = true
        })
        if(!includes) ok = false
    })
    return ok
},'Geen geldig id')
// todo ook hier ga je een onderschied moeten maken tussen create en update
productSpecificationSchema.path('name').validate(async function (propValue) {
    return (await specificationModel.find().where('name').equals(propValue).countDocuments()) === 0
}, 'Er bestaat al een specificatie met deze naam.')


productOptionSchema.path('name').validate(async function (propValue) {
    return (await optionModel.find().where('name').equals(propValue).countDocuments()) === 0
}, 'Er bestaat al een optie met deze naam.')

productOptionSchema.path('price').validate(function (propValue) {
    return Math.trunc(propValue) === propValue
})


/*******************************************************************   methods  *********************************************************************************/
const listsAreUnique = function (list) {
    for (let i = 0; i < list.length; i++) {
        for (let j=0;j<list.length;j++){
            if(i!==j){
                // mathematical definition of equality of lists
                if(list[j].every(x=>list[i].includes(x))&&list[i].every(x=>list[j].includes(x))){
                    return false
                }
            }
        }
    }
    return true
}
productSpecificationSchema.query.listOfSpecsIsUnique = listsAreUnique
productSpecificationSchema.query.noEmptySpecList = function (list) {
    for (let i = 0; i < list.length; i++) {
        if(list[i].length===0) return false
    }
    return true
}


/********************************************************************   hooks  **********************************************************************************/

productSpecificationSchema.pre('deleteOne',function (next) {
    const id = this._conditions._id.toString()
    productModel.find().select({specifications:1,_id:0}).exec().then(async specsArray => {
        specsArray.forEach(specsList => {
            // specList is an object
            const index = specsList.specifications.findIndex(spec => {
                return spec.toString() === id
            })
            if(index!==-1){
                specsList.specifications.splice(index, 1)
            }
        })
        const arr =  specsArray.map(list => {
            return list.specifications
        })
        let ok = this.listOfSpecsIsUnique(arr)
        if (!ok) {
            next('Het verwijderen van deze specificatie heeft tot gevolg dat er producten ontstaan die dezelfde eigenschappen hebben.')
        } else {
            ok = this.noEmptySpecList(arr)
            if(ok){
                next()
            } else{
                next('Het verwijderen van deze specificatie heeft tot gevolg dat er producten ontstaan zonder eigenschappen.')
            }
        }
    }).catch(err=>{
        console.log(err)
    })
})


/*****************************************************************   models  ************************************************************************************/

const specificationModel = mongoose.model('ProductSpecification', productSpecificationSchema)
const optionModel = mongoose.model('ProductOption', productOptionSchema)
const productModel = mongoose.model('Product', productSchema)
module.exports = {specificationModel,productModel,optionModel,listsAreUnique}
