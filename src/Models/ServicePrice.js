const mongoose = require('mongoose');

const servicePriceSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Services',
        require: true,
    },
    Duration: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
        require: true,
    },
    type: [
        {
            type: String,
            enum:['Hourly', 'Weekly', 'Monthly'],
            require:true,
        },
    ],
}, { timestamps: true });



module.exports = mongoose.model('ServicesPrice', servicePriceSchema);
