import express from 'express'
import bodyParser from 'body-parser'
import axios from 'axios'
import pg from "pg"
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;
const API = `https://covers.openlibrary.org/b/isbn/`;
const db = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "bookNotes",
  password: process.env.DB_PASS,
  port: 5432,
});
const bookList = [
  {
    title: `No Longer Human`,
    Author: `Osamu Dazai`,
    ISBN: `1`,
    note:`No Longer Human by Osamu Dazai is the second best-selling novel in Japan of all time. I read he killed himself shortly after publishing the book which is essentially an autobiography, but with fictional characters. The author had also inspired horror manga artist Junji Ito. Of course, curiosity got the best of me; I had to read this book. It fucked me up, friends. It is a really short read that took me just a few days, and let me tell you, it’s a page turner. The protagonist is a very troubled individual, but the raw look into his psyche helped me sympathize and oftentimes relate to his behavior. After finishing it, I feel a little empty. I can’t stop thinking about it. I recommend reading this if you want a book that really analyzes the complexities of the human mind, but I would avoid it if you are struggling with deep depression. Additionally, there are themes of sexual assault, suicide, and child abuse, as well as quite a lot of misogynistic statements throughout the book.`,
    rating: 10
  },
  {
    title:`Diary of a Whimpy Kid`,
    Author:`Jeff Kinney`,
    ISBN:`2`,
    note:`goated booky wooky!`,
    rating: 7
  }
];
const message =``;
const user = process.env.USERNAME;
const pass = process.env.PASSWORD;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get(`/`, async (req,res) =>{
  // const result = await axios.get(`https://covers.openlibrary.org/b/isbn/9780811204811-M.jpg`);
    res.render('home.ejs',
    {
      bookList : bookList,
    }
  );
});
app.post('/check',async (req,res) =>{
  console.log(req.body);
  res.redirect('/');
});

app.post('/edit', async (req,res) =>{
  console.log(req.body);
});

app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`);
});