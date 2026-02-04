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
app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`);
});