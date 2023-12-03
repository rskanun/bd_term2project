const express = require("express");
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");

const accomController = require("./routers/accomController");
const rentalController = require("./routers/rentalController");
const guestController = require("./routers/guestController");
const reviewController = require("./routers/reviewController");

const hostname = "127.0.0.1";
const port = 3000;
const DB_URI = "mongodb://127.0.0.1:27017/bd_termproject";

const server = async () => {
    try {
        await mongoose.connect(DB_URI);
        app.use(express.json());
        app.use(cors());
        app.use("/accom", accomController);
        app.use("/rental", rentalController);
        app.use("/guest", guestController);
        app.use("/review", reviewController);
        app.listen(port, hostname, function () {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    } catch (e) {
        console.error(e);
    }
};

server();