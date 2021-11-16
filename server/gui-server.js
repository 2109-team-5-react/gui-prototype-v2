const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./routes/api");
const {mongourl} = require("./config/db.config")

const mongoose = require('mongoose');

require("dotenv").config();



mongoose.connect("mongodb+srv://team5admin:neeshykins@cluster0.pcknm.mongodb.net/synapse?retryWrites=true&w=majority")
  .then((res) => console.log('MONGO DB CONNECTED :)'))
  .catch((err) => console.log(err));



app.use(express.json());
app.use(cors());

const path = __dirname + "/build/";
app.use(express.static(path));
app.get('/monitoring', (req, res) => {
  res.sendFile(path + 'index.html');
})

app.get('/signin', (req, res) => {
  res.sendFile(path + 'index.html');
})

app.get("/signup", (req, res) => {
  res.sendFile(path + 'index.html');
})

app.get('/datasources', (req, res) => {
  res.sendFile(path + 'index.html');
})

app.get('/', (req, res) => {
  res.sendFile(path + 'index.html');
})

app.use("/api", routes);

const PORT = 4005;
app.listen(PORT, () => {
  console.log(`server is listening on port: ${4005}`);
})
