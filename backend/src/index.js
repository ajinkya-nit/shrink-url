import connectDB from "./db/dbfile.js";
import app from "./app.js";

const port = process.env.PORT || 5000;

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`Server has started at ${port}`)
    })
})
.catch((error) => {
    console.log(`\n The error has been encountered while starting the server ${error} \n`)
})