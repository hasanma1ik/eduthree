const mongoose = require('mongoose')

const StudentSchema = new mongoose.Schema({
    name: String, 
    classId: String,
    email: String, 
})

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;

