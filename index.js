import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

const app = express();
const port = 3000;
// express middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// postgres dataBase connect
const db = new pg.Client({
    host: 'localhost',
    port: 5432,
    database: 'books',
    user: 'postgres',
    password: '12345'
});
// connect local database
db.connect();
// some declarations for home page query
let sortBy = 'title';
let sort = 'ASC';
let search =false;
let searchTitle ;
// home page routing and using bookList funtion to run query
app.get("/",async (req,res)=>{

    try{
        var result;
        if(search==true){
            search =false;
            result = await bookList(searchTitle);
        }else{
            result =  await bookList();
        }
        res.render("index.ejs",{books:result.rows,sortBy:sortBy,sort:sort,search:searchTitle});
    }catch(err){
        console.error("Error in get: ",err.message);
    }
});
// function for query
async function bookList(condition){

    if(condition){
        const result = await db.query(`SELECT b.id,b.title,b.author,b.book_cover_isbn,r.review,r.date_read ,b.note FROM books AS b JOIN bookreview AS r ON r.book_id=b.id WHERE LOWER(b.title) LIKE '%'|| '${condition.toLowerCase()}' ||'%' ORDER BY ${sortBy} ${sort}`);
        return result;
    }else{
        searchTitle = null;
        const result = await db.query(`SELECT b.id,b.title,b.author,b.book_cover_isbn,r.review,r.date_read ,b.note FROM books AS b JOIN bookreview AS r ON r.book_id=b.id ORDER BY ${sortBy} ${sort}`);
        return result;
    }
}
// search functionality
app.post("/search",(req,res)=>{

    search =true;
    searchTitle = req.body.search_title;
    res.redirect("/");

});
// sorting query and rendering add book page
app.post("/changeOrder",(req,res)=>{

    if(req.body.new){
        res.render("new.ejs");
    }else{
        sortBy = req.body.sortBy;
        sort = req.body.sort;
        res.redirect("/");
    }
});
// new book add into database
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
//Edit review note and rating of a book!
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
// delete book review from database!!
app.post("/delete",async(req,res)=>{

    try{
        const result = await db.query("DELETE FROM bookreview WHERE book_id=$1",[req.body.bookId]);
        res.redirect("/");
    }catch(err){
        console.error("Error:",err.message);
    }
});
// server connected to port using Express
app.listen(port,()=>{
    console.log(`Server is running on Port: ${port}`);
});
