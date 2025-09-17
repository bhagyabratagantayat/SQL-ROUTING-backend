const express = require("express");
const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2");
const { faker } = require("@faker-js/faker");
const path = require("path");
const { count } = require("console");
const methodOverride = require("method-override");

const app = express();
const port = 3000;

app.use(methodOverride("_method"));
app.use(express.static("public"));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

let data = [];

// Create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "MYSERVER",
  password: "Pilu@143",
});

let getRandomUser = () => {
  return [
    faker.string.uuid(), // id
    faker.internet.username(), // username
    faker.internet.email(), // email
    faker.internet.password(), // password
  ];
};

app.get("/", (req, res) => {
  let q = `SELECT COUNT(*) FROM users`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["COUNT(*)"];
      //   res.send("success");
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("some error in database");
  }
});

app.get("/users", (req, res) => {
  let q = `SELECT * FROM users ORDER BY username ASC;`;
  let q2 = `SELECT COUNT(*) AS total FROM users;`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;

      connection.query(q2, (err, result) => {
        if (err) throw err;

        let count = result[0].total;
        res.render("alluser.ejs", { users, count });
      });
    });
  } catch (err) {
    console.log(err);
    res.send("some error in database");
  }
});

// Edit route
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM users WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("some Error");
  }
});

// Update route
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { username: newuser, password: formpass } = req.body;
  let q = `SELECT * FROM users WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (user.password != formpass) {
        res.send("wrong password");
      } else {
        let q2 = `UPDATE users SET username='${newuser}' WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          // res.send("update successful");
          // res.send(result);
          // console.log(result);
          res.redirect("/users");
        });
      }
      // res.send("ok");
    });
  } catch (err) {
    console.log(err);
    res.send("some Error");
  }
});


//ADD NEW USER
app.get("/user/newuser", (req, res) => {
  res.render("newuser.ejs");
});

// Create User route  and send data to database
app.post("/users", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();

  let q = `INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)`;
  let values = [id, username, email, password];

  try {
    connection.query(q, values, (err, result) => {
      if (err) {
        console.log("❌ Database Error:", err.sqlMessage);
        res.send("Database Error: " + err.sqlMessage);
      } else {
        console.log("✅ User Added:", result);
        res.redirect("/users");
      }
    });
  } catch (err) {
    console.log("🔥 Unexpected Error:", err.message);
    res.send("Some Error: " + err.message);
  }
});

// Show delete confirmation page
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;

  let q = `SELECT * FROM users WHERE id='${id}'`;
  connection.query(q, (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.send("User not found");
    }
    let user = result[0];
    res.render("dlt.ejs", { user });
  });
});

// Handle delete (form submit from dlt.ejs)
app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formpass } = req.body;

  let q = `SELECT * FROM users WHERE id='${id}'`;
  connection.query(q, (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      return res.send("User not found");
    }

    let user = result[0];
    if (user.password !== formpass) {
      return res.send("Wrong password ❌");
    }

    let q2 = `DELETE FROM users WHERE id='${id}'`;
    connection.query(q2, (err, result) => {
      if (err) throw err;
      res.redirect("/users");
    });
  });
});


app.listen(port, (req, res) => {
  console.log(`server is running at ${port}`);
});

// #FOR DATA ENTRY ------

// let q = "INSERT INTO users (id, username, email, password) VALUES ?";
// for (let i = 1; i <= 90; i++) {
//  // add 100 user data
//   console.log(getRandomUser());
//   data.push(getRandomUser());
// }

// try {
//   connection.query(q, [data], (err, result) => {
//     if (err) throw err;
//     console.log(result);
//   });
// } catch (err) {
//   console.log(err);
// }

// connection.end();
