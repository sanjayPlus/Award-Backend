require('dotenv').config();
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then((res) => {
    console.log('connected to database');
}).catch((err) => {
    console.log(err);
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user",userRoutes);


app.get("/", (req, res) => {
    res.send('hello world');
})
app.listen(3000, () => {
    console.log('listening on port 3000');
})