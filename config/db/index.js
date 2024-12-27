const mongoose = require("mongoose");
require("dotenv").config();

const dbUri = process.env.DB_URI;

const dbConnect = async () => {
    try {
        await mongoose.connect(dbUri).then(() => {
            console.log(`Db Connected Successfully...`);
        })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = dbConnect;