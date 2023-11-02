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

let sortBy = 'title';
let sort = 'ASC';

app.get("/",async (req,res)=>{
    try{
        const result = await db.query(`SELECT b.id,b.title,b.author,b.book_cover_isbn,r.review,CAST(r.date_read AS DATE) ,b.note FROM books AS b JOIN bookreview AS r ON r.book_id=b.id ORDER BY ${sortBy} ${sort}`);
        res.render("index.ejs",{books:result.rows,sortBy:sortBy,sort:sort});
    }catch(err){
        console.error("Error: ",err.message);
    }
    
});
app.post("/changeOrder",(req,res)=>{
    if(req.body.new){
        res.render("new.ejs");
    }else{
        sortBy = req.body.sortBy;
        sort = req.body.sort;
        res.redirect("/");
    }
    
});

app.post("/new_book",async(req,res)=>{
    try{
        const result = await db.query("INSERT INTO books(title,author,book_cover_isbn,note) VALUES ($1, $2, $3, $4) RETURNING id;",[req.body.bookTitle,req.body.author,req.body.isbn,req.body.note]);
        try{
            const result2 = await db.query("INSERT INTO bookreview(book_id,review,date_read) VALUES ($1, $2, $3) RETURNING *;",[result.rows[0].id,req.body.rating,req.body.dateRead]);
        }catch(err2){
            console.error("Error 2 : ",err2.message);
        }
        res.redirect("/");
    }catch(err){
        console.error("Error 1 : ",err.message);
    }
    
})

app.post("/editNote",async (req,res)=>{
    if(req.body.review&&(req.body.review<=10 && req.body.review>=1 )){
        try{
            await db.query("UPDATE bookreview SET review=$1 WHERE book_id=$2",[parseInt(req.body.review),req.body.bookId]);
        }catch(err){
            console.error("Error: ",err.message);
        }
        
    }else if(req.body.bookNote){
        try{
            await db.query("UPDATE books SET note=$1 WHERE id=$2",[req.body.bookNote,req.body.bookId]);
        }catch(err){
            console.error("Error: ",err.message);
        }
    }
    res.redirect("/");
});
app.post("/delete",async(req,res)=>{
    try{
        const result = await db.query("DELETE FROM bookreview WHERE book_id=$1",[req.body.bookId]);
        res.redirect("/");
    }catch(err){
        console.error("Error:",err.message);
    }
    
});

app.listen(port,()=>{
    console.log(`Server is running on Port: ${port}`);
});
