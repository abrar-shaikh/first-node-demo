var mongoose = require('mongoose');
var schema = mongoose.Schema;
var historySchema = new schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
    dateTime: { type: Date, required: true },
    operation: { type: String, enum: ['SIGNUP', 'LOGIN'] }
})
module.exports = mongoose.model('history', historySchema)