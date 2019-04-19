var mongoose = require('mongoose');
var schema = mongoose.Schema;

var userSchema = new schema({

    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number },
    status: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'] },
    role: { type: String, enum: ['STUDENT', 'TEACHER'], required: true },
    createdAt: { type: Date, default: Date.now },
    point: {
        type: Number, default: function () {
            if (this.role == 'STUDENT') {
                return 25;
            }
            return 0;
        }
    },
    referralcode: { type: String },
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'classes' }]
});

module.exports = mongoose.model('user', userSchema);