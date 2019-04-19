var mongoose = require('mongoose')
var schema = mongoose.Schema;
var classSchema = new schema({

    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    ownerId: { type:mongoose.Schema.Types.ObjectId,required:true},
    createdAt: { type: Date, default: Date.now },   
    status: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'] }
});

module.exports = mongoose.model('classes', classSchema)