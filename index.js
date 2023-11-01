import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import axios from 'axios';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
    host: 'localhost',
    port: 5432,
    database: 'books',
    user: 'postgres',
    password: 'SkyLight'
});
db.connect();

app.get("/",async (req,res)=>{
    try{
        const result = await db.query("SELECT b.id,b.title,b.author,b.book_cover_isbn,r.review,CAST(r.date_read AS DATE) ,b.note FROM books AS b JOIN bookreview AS r ON r.book_id=b.id;");
        console.log(result.rows);
        res.render("index.ejs",{books:result.rows});
        const date = new Date("2020-07-24T14:00:00.000Z");
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
    console.log(formattedDate); // prints "March 24, 2021"
    }catch(err){
        console.error("Error: ",err.message);
    }
    
});

app.listen(port,()=>{
    console.log(`Server is running on Port: ${port}`);
});