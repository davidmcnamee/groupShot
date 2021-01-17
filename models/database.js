const mongoose = require('mongoose');
const { MONGODB_URI } = process.env;

mongoose.connect(
  MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (err) {
      console.error("Error connecting to Mongo:", err);
    } else {
      console.log("Mongo connection successful");
    }
  }
);
