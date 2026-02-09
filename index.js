import express from 'express'
import bodyParser from 'body-parser'
import axios from 'axios'
import pg from "pg"
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;
const coverAPI = `https://covers.openlibrary.org/b/isbn/`;
const isbnAPI = "https://openlibrary.org/isbn/";
const MAX_CACHE = 3;              // <- set N here
const isbnCache = new Map();       // key: isbn, value: { success, title, coverURL, ... }

const db = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "bookNotes",
  password: process.env.DB_PASS,
  port: 5432,
});
db.connect();




async function bookListCheck(){
  const result = await db.query("select * from notes");
  // console.log(result.rows);
  bookList = [];
  result.rows.forEach((note) => {
    bookList.push(note);
  }) 
}

let bookList = [
  
];
const message =``;
const user = process.env.USERNAME;
const pass = process.env.PASSWORD;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

app.get(`/`, async (req,res) =>{
  // const result = await axios.get(`https://covers.openlibrary.org/b/isbn/9780811204811-M.jpg`);
  await bookListCheck()
    res.render('home.ejs',
    {
      bookList : bookList,
    }
  );
});

app.post('/check',async (req,res) =>{
  console.log(req.body);
  console.log(`correct cred: { user: ${process.env.USERNAME}, password: ${process.env.PASSWORD} }`)
  const user = req.body.user;
  const pass = req.body.password;
  const action = req.body.action;
  const ISBN = req.body.ISBN;

  if(user.localeCompare(process.env.USERNAME) == 0 && pass.localeCompare(process.env.PASSWORD) == 0)
  {
    if(action.localeCompare('add') == 0){
      res.json({
      success: true,
      redirect: '/admin'
      });
    }
    else{
      res.json({
      success: true,
      });
    }
  }
  else
  {
    res.json({
    success: false,
    message: 'Invalid username or password'
    });
  }
});

app.post('/delete',async (req,res) =>{
  const ISBN = req.body.ISBN;

  try {
    await db.query("DELETE FROM notes WHERE ISBN = $1",[ISBN])
  } catch (error) {
    
  }
  console.log(`deleteing ${ISBN}...`)
  res.json({
    success: true,
    message: `Rating for ISBN ${ISBN} deleted successfully.`
  });
  // res.redirect('/');
});

app.post('/edit', async (req,res) =>{
  console.log(req.body);
  const ISBN = req.body.ISBN;
  const note = req.body.updatedNote;
  const updatedRating = req.body.updatedRating;
  const rating = Number(req.body.updatedRating);
  console.log(`new values are: {ISBN : ${ISBN} , Note : ${note} , Rating : ${rating}}`);

  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    return res.json({
      success: false,
      message: 'Rating must be an integer between 1 and 10'
    });
}
  try {
    const result = await db.query("UPDATE notes SET note = $1, rating = $2 WHERE isbn = $3",[note,rating,ISBN]);

    if (result.rowCount === 0) {
      return res.json({
        success: false,
        message: `No record found for ISBN ${ISBN}`
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success:false,
      message:`Database error: ${error}` 
    })
  }

  res.json({
    success : true,
  });
});

app.get('/admin', (req,res) =>{
  res.render('admin.ejs');
})
app.post("/isbnCheck", async (req, res) => {
  const isbn = req.body.isbn;
  let title;
  if (!isbn) {
    return res.json({ success: false, message: "ISBN is required" });
  }

  if (!isValidISBN(isbn)) {
    return res.json({ success: false, message: "Invalid ISBN format" });
  }

  console.log(`Valid ISBN received: ${isbn}`);

  const cached = lruGet(isbn);
  if (cached){
    console.log(cached);
    return res.json({ ...cached, cached: true });
  }

  try {
    const url = `https://openlibrary.org/isbn/${isbn}.json`;
    const response = await axios.get(url);

    const result = response.data; 
    // console.log(result);
    title = result.title;
    const data = {
      success: true,
      title: title ?? "Unknown title",
      coverURL: coverAPI + isbn + "-L.jpg"
    };
    lruSet(isbn, data);
    return res.json(data);
  } catch (error) {
    // Handle "not found" cleanly
    if (error.response && error.response.status === 404) {
      return res.json({
        success: false,
        message: "No book found for that ISBN (Open Library 404).",
      });
    }

    console.log(error);
    return res.json({
      success: false,
      message: "Open Library request failed. Try again later.",
    });
  }
});

app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`);
});




// #############################################

// Functions 

// #############################################


function isValidISBN10(isbn) {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const char = isbn[i];
    const value = char === 'X' ? 10 : Number(char);
    sum += value * (10 - i);
  }
  return sum % 11 === 0;
}

function isValidISBN13(isbn) {
  if (!/^\d{13}$/.test(isbn)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = Number(isbn[i]);
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === Number(isbn[12]);
}

function isValidISBN(isbn) {
  if (isbn.length === 10) return isValidISBN10(isbn);
  if (isbn.length === 13) return isValidISBN13(isbn);
  return false;
}

function lruGet(key) {
  if (!isbnCache.has(key)) return null;
  const val = isbnCache.get(key);
  // mark as recently used: move to end
  isbnCache.delete(key);
  isbnCache.set(key, val);
  return val;
}

function lruSet(key, val) {
  if (isbnCache.has(key)) isbnCache.delete(key); // overwrite + move to end
  isbnCache.set(key, val);

  // evict least-recently-used (first item in Map)
  if (isbnCache.size > MAX_CACHE) {
    const oldestKey = isbnCache.keys().next().value;
    isbnCache.delete(oldestKey);
  }
}