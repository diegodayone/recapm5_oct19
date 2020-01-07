const express = require("express")
const fs = require("fs-extra")
const path = require("path")

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


module.exports = bookRouter;

