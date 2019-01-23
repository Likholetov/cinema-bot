const mongoose = require('mongoose')

require('../models/user.model')

const User = mongoose.model('users')

class UserController {
    // поиск пользователя в базе
    findUserById(query){
        return User.findOne({telegramId: query})
    }
}

module.exports = new UserController()