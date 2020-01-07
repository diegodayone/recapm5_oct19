const express = require("express")
const fs = require("fs-extra")
const path = require("path")
const { check, validationResult, sanitizeBody } = require('express-validator');
const multer = require("multer")
const multerConfig = multer()


const fileLocation = path.join(__dirname, "books.json")

const bookRouter = express.Router();

const readBooks = async () => {
    const fileContent = await fs.readFile(fileLocation);
    const stringFile = fileContent.toString();
    return JSON.parse(stringFile)
}

bookRouter.get("/", async (req, res)=>{
    let books = await readBooks();
    const total = books.length;
    
    //saving limit and start
    const limit = req.query.limit || 100;
    const start = req.query.start || 0;

    //removing the from the req.query to avoid the filtering
    delete req.query.limit
    delete req.query.start
    
    //filter stuff based on the query string
    for (let key in req.query) { //hey, I'm using the query string, the one that come after the ? in the URL
        console.log("I'm taking only the elements with " + key + " equal to " + req.query[key])
        books = books.filter(b => b[key] == req.query[key])
    }

    res.send({ 
        result: books.splice(start, limit),
        total: total,
        next: `http://localhost:4000/books?category=scifi&limit=${limit}&start=${parseInt(start)+parseInt(limit)}` 
    })
})

bookRouter.get("/:id", async (req, res)=>{
    const books = await readBooks();
    //hey I'm using the params, the ones that came after the last / and before the ?
    const book = books.find(b => b.asin === req.params.id)
    if (book)
        res.send(book)
    else
        res.status(404).send("NOT FOUND")
})

bookRouter.post("/",
    [   check("asin").isLength({min: 10, max:10}).withMessage("Hey man, the ASIN should have 10 chars"),
        check("name").isString({ min: 3}).withMessage("The name should have at least 3 chars"), 
        check("price").isNumeric().withMessage("Only numeric values are accepted"),
        check("category").isString(),
        sanitizeBody("price").toFloat()],
     async(req,res)=>{
    //req.body = undefined? you should use server.use(express.json()) in your server file
    //req.body = {}? check the content type of your request (should be application/json)    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const books = await readBooks();
    books.push(req.body)
    // usually you need to generate fields as:
    // id
    // creation date
    // update... etc
    // user that created the entry
    await fs.writeFile(fileLocation, JSON.stringify(books))
    res.send(req.body)
})

bookRouter.post("/:asin", multerConfig.single("bookCover"), async (req, res)=>{
    //But... do we have a book with that ASIN?
    const books = await readBooks(); //get the books
    const book = books.find(b => b.asin === req.params.asin) //find the book by ASIN
    if (!book) //if no book matches ==> not found
        return res.status(404).send("NOT FOUND")

    //else...
    const fileName = req.params.asin + path.extname(req.file.originalname) //create a new filename like ASIN.ext
    const newImageLocation = path.join(__dirname, "../../../images", fileName); //create the path to my images folder
    await fs.writeFile(newImageLocation, req.file.buffer) //write down the image on the folder

    book.img = req.protocol + '://' + req.get('host') + "/images/" + fileName; //update the book object
    //book.img = "http://localhost:4000/images/1231231230.jpg; 
    await fs.writeFile(fileLocation, JSON.stringify(books)) //write down the whole books array

    // How can we save the picture url now???
    res.send({
        result: "OK",
        url: book.img
    })
})


module.exports = bookRouter;

