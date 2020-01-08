const express = require("express")
const fs = require("fs-extra")
const path = require("path")
const { check, validationResult, sanitizeBody } = require('express-validator');
const multer = require("multer")
const multerConfig = multer()
const Book = require("../../models/book")


const fileLocation = path.join(__dirname, "books.json")

const bookRouter = express.Router();

const readBooks = async () => {
    return await Book.find()
    // const fileContent = await fs.readFile(fileLocation);
    // const stringFile = fileContent.toString();
    // return JSON.parse(stringFile)
}

bookRouter.get("/", async (req, res)=>{
    if (req.query.category)
        return res.send(await Book.find({ category: req.query.category}))

    const books = await Book.find({}) //get all the elements in the collection books
    res.send(books)
    // let books = await readBooks();
    // const total = books.length;
    
    // //saving limit and start
    // const limit = req.query.limit || 100;
    // const start = req.query.start || 0;

    // //removing the from the req.query to avoid the filtering
    // delete req.query.limit
    // delete req.query.start
    
    // //filter stuff based on the query string
    // for (let key in req.query) { //hey, I'm using the query string, the one that come after the ? in the URL
    //     console.log("I'm taking only the elements with " + key + " equal to " + req.query[key])
    //     books = books.filter(b => b[key] == req.query[key])
    // }

    // res.send({ 
    //     result: books.splice(start, limit),
    //     total: total,
    //     next: `http://localhost:4000/books?category=scifi&limit=${limit}&start=${parseInt(start)+parseInt(limit)}` 
    // })
})

// bookRouter.get("/:id", async(req,res)=>{
//     const book = await Book.findById(req.params.id)
//     if (book)
//         res.send(book)
//     else
//         res.status(404).send("Not found")
// })

bookRouter.get("/:asin", async(req,res)=>{
    //find one will "cycle" through the collection and will break / return on the first element that match the condition
    const book = await Book.findOne({ asin: req.params.asin})
    if (book)
        res.send(book)
    else
        res.status(404).send("Not found")
})

// bookRouter.get("/:id", async (req, res)=>{
//     const books = await readBooks();
//     //hey I'm using the params, the ones that came after the last / and before the ?
//     const book = books.find(b => b.asin === req.params.id)
//     if (book)
//         res.send(book)
//     else
//         res.status(404).send("NOT FOUND")
// })

bookRouter.post("/", async (req, res)=>{
    try{
        const newBook = await Book.create(req.body)
        newBook.save()
        res.send(newBook)
    }
    catch(exx){
        res.status(500).send(exx)
    }
})

// const validCategories = ["High Fantasy", "scifi", "fantasy", "romance", "bio"]
// bookRouter.post("/",
//     [   check("asin").isLength({min: 10, max:10}).withMessage("Hey man, the ASIN should have 10 chars"),
//         check("name").isString({ min: 3}).withMessage("The name should have at least 3 chars"), 
//         check("price").isNumeric().withMessage("Only numeric values are accepted"),
//         check("category").custom(val => validCategories.includes(val)).withMessage("Only High Fantasy, scifi, fantasy, romance & bio are allowed" ),
//         check("img").custom(val => /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(val)),
//         sanitizeBody("price").toFloat()],
//      async(req,res)=>{
//     //req.body = undefined? you should use server.use(express.json()) in your server file
//     //req.body = {}? check the content type of your request (should be application/json)    
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(422).json({ errors: errors.array() });
//     }

//     const books = await readBooks();
//     books.push(req.body)
//     // usually you need to generate fields as:
//     // id
//     // creation date
//     // update... etc
//     // user that created the entry
//     await fs.writeFile(fileLocation, JSON.stringify(books))
//     res.send(req.body)
// })

bookRouter.post("/total", multerConfig.single("bookCover"), async (req, res)=> {
    //saving the file in the images folder
    const fileName = req.body.asin + path.extname(req.file.originalname) //create a new filename like ASIN.ext
    const newImageLocation = path.join(__dirname, "../../../images", fileName); //create the path to my images folder
    await fs.writeFile(newImageLocation, req.file.buffer) //write down the image on the folder

    req.body.img = req.protocol + '://' + req.get('host') + "/images/" + fileName; //update the book object
    //book.img = "http://localhost:4000/images/1231231230.jpg; 
    // const books = await readBooks(); //get the list of books
    // books.push(req.body) //adding the books
    // await fs.writeFile(fileLocation, JSON.stringify(books))
    try{
        const book = await Book.create(req.body)
        book.save()
        res.send(book)
    }
    catch(exx){
        res.status(500).send(exx)
    }
   
})

// bookRouter.post("/total", multerConfig.single("bookCover"),
// [   check("asin").isLength({min: 10, max:10}).withMessage("Hey man, the ASIN should have 10 chars"),
// check("name").isString({ min: 3}).withMessage("The name should have at least 3 chars"), 
// check("price").isNumeric().withMessage("Only numeric values are accepted"),
// check("category").custom(val => validCategories.includes(val)).withMessage("Only High Fantasy, scifi, fantasy, romance & bio are allowed" ),
// sanitizeBody("price").toFloat()],
// async (req, res)=> {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) { //is there any validation error? if so, return the error message
//         return res.status(422).json({ errors: errors.array() });
//     }
//     //saving the file in the images folder
//     const fileName = req.body.asin + path.extname(req.file.originalname) //create a new filename like ASIN.ext
//     const newImageLocation = path.join(__dirname, "../../../images", fileName); //create the path to my images folder
//     await fs.writeFile(newImageLocation, req.file.buffer) //write down the image on the folder

//     req.body.img = req.protocol + '://' + req.get('host') + "/images/" + fileName; //update the book object
//     //book.img = "http://localhost:4000/images/1231231230.jpg; 
//     const books = await readBooks(); //get the list of books
//     books.push(req.body) //adding the books
//     await fs.writeFile(fileLocation, JSON.stringify(books))

//     res.send(req.body)
// })

// bookRouter.post("/:asin", multerConfig.single("bookCover"), async (req, res)=>{
//     //But... do we have a book with that ASIN?
//     const books = await readBooks(); //get the books
//     const book = books.find(b => b.asin === req.params.asin) //find the book by ASIN
//     if (!book) //if no book matches ==> not found
//         return res.status(404).send("NOT FOUND")

//     //else...
//     const fileName = req.params.asin + path.extname(req.file.originalname) //create a new filename like ASIN.ext
//     const newImageLocation = path.join(__dirname, "../../../images", fileName); //create the path to my images folder
//     await fs.writeFile(newImageLocation, req.file.buffer) //write down the image on the folder

//     book.img = req.protocol + '://' + req.get('host') + "/images/" + fileName; //update the book object
//     //book.img = "http://localhost:4000/images/1231231230.jpg; 
//     await fs.writeFile(fileLocation, JSON.stringify(books)) //write down the whole books array

//     // How can we save the picture url now???
//     res.send({
//         result: "OK",
//         url: book.img
//     })
// })

bookRouter.put("/:asin", async (req, res)=>{

   delete req.body.asin
   delete req.body._id

   const book = await Book.findOneAndUpdate(
       { asin: req.params.asin },  //query: what we are looking for. In this case, the first element with the ASIN = req.params.asin
       { $set: //$set: we want to change the object with the information that I'm passing. It's like the Object.assign(dbObject, newObject)
        { ...req.body } //using the spread operator, we are selecting all the properties that we want to change
       })
   if (book)
        res.send(book)
   else 
       res.status(404).send("Not found " +req.params.asin)
})

// bookRouter.put("/:asin", async (req, res)=>{
//     const books = await readBooks();
//     const book = books.find(b => b.asin === req.params.asin) //search for a book with a given asin
//     if (!book)
//         return res.status(404).send("NOT FOUND")

//     //=> prevents the user to modify the asin for a given book.
//     delete req.body.asin

//     for (let key in req.body) { //update every field we see into the req.body
//         console.log("I'm updating the property " + key + " and setting it to " + req.body[key])
//         book[key] = req.body[key]
//     }

//     await fs.writeFile(fileLocation, JSON.stringify(books));
//     res.send(book)
// })

bookRouter.delete("/:asin", async(req, res)=>{
    const result = await Book.findOneAndDelete({ asin: req.params.asin})
    if (result)
        res.send(result)
    else 
        res.status(404).send("not found")
})

// bookRouter.delete("/:asin", async (req, res)=>{
//     //read the books
//     const books = await readBooks()
//     //find all the others book
//     const notToDelete = books.filter(b => b.asin !== req.params.asin)
//     //if the number of found books == initial number ==> book is not there
//     if (notToDelete.length === books.length)
//         return res.status(404).send("Not found")
//     //else save the books in order to remove it
//     else{
//         await fs.writeFile(fileLocation, JSON.stringify(notToDelete))
//         res.send("DELETED")
//     }
// })

module.exports = bookRouter;

