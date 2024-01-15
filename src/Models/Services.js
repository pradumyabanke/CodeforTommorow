const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    service_name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Normal', 'VIP'],
        required: true,
    },
    priceOptions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServicesPrice',
        },
    ],
}, { timestamps: true });



module.exports = mongoose.model('Services', serviceSchema);
