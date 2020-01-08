const mongoose = require("mongoose")

const bookSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true
    },
    asin: { 
        type: String,
        required: true
        // ,        unique: true
    },
    category: { 
        type: String,
        required: true
    },
    price:{ 
        type: Number,
        required: true
    },
    img: { 
        type: String,
        required: false
    }
})

const bookCollection = mongoose.model("book", bookSchema)

module.exports = bookCollection