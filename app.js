require('dotenv').config();
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.connect(process.env.MONGODB_URI).then((res) => {
    console.log('connected to database');
}).catch((err) => {
    console.log(err);
})

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));
app.use("/api/user",userRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/payment",paymentRoutes);

app.get("/", (req, res) => {
    res.send('hello world');
})
app.listen(3001, () => {
    console.log('listening on port 3001');
})