const express = require("express") //load express from the package
const bookRouter = require("./src/services/books") //automatically goes to index.js
const path = require("path")
const cors = require("cors")

const server = express();

server.use(cors())
server.use(express.json())

//app.use('/static', express.static(path.join(__dirname, 'public')))
server.use("/images", express.static(path.join(__dirname, "images")))

server.get("/", (req, res) => {
    res.send("I'm listening.")
})

server.use("/books", bookRouter)

server.listen(process.env.PORT || 4000, ()=>{
    console.log("listening")
})

// iteration test on object properties
// let student = { 
//     name: "Diego",
//     email:"diego@strive.school",
//     location: "Berlin",
//     job: "Strive"
// }

// console.log("-----------------------------------------------")
// for (let key in student){ //we are gonna iterate on all the props in the object
//     console.log(key, " --->",  student[key])
// }
// console.log("-----------------------------------------------")