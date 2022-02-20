'use strict'
const express = require('express')

const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')
const app = express()

mongoose.connect('mongodb+srv://ph:'+ process.env.MONGO_ATLAS_PW +'@administry-1.nnow2.mongodb.net/vitaline-db?retryWrites=true&w=majority',
{
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true, //this is the code I added that solved it all: should be false in production!!
    keepAlive: true,
    poolSize: 10,
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    useFindAndModify: false,
    useUnifiedTopology: true
}
,(err)=>{console.log(err)})

const fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, 'images')
    },
    filename:(req, file, cb)=>{
        // todo use a package that generates a truely unique hashcode
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb)=>{
    if(file.mimetype === 'image/png'){
        cb(null,true)
    } else{
        cb(null,false)
    }
}

// todo store the path to the image so it can be retreived to create the supplierorder

// logging middleware which will do it's thing and then forwards the request automatically to the next middleware
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'))

const productSpecificationsRoutes = require('./routes/product/productSpecifications')
const productOptionsRoutes = require('./routes/product/productOptions')
const productsRoutes = require('./routes/product/products')

const quotationSpecificationsRoutes = require('./routes/quotation/quotationSpecifications')
const quotationsRoutes = require('./routes/quotation/quotations')

app.use(((req, res, next) => {
    res.header('Access-Control-Allow-Origin','*')
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, PATCH, DELETE, POST, GET')
        return res.status(200).json({})
    }
    next()
}))

// setting up middlewares
app.use('/product-specifications',productSpecificationsRoutes)
app.use('/product-options',productOptionsRoutes)
app.use('/products',productsRoutes)

app.use('/quotation-specifications',quotationSpecificationsRoutes)
app.use('/quotations',quotationsRoutes)

// handle all non-defined requests
app.use((req,res,next)=>{
    const err = new Error('not found')
    err.status = 404
    next(err)
})

app.use(( req, res, next) =>{
    res.error()
})

module.exports = app

