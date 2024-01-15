const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({

    userId: { type: String, require: true},
    category_name: { type: String, require: true},


}, {timestamps:true});


module.exports = mongoose.model('category', CategorySchema);