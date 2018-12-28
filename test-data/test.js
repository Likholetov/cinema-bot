const mongoose = require('mongoose')
const config = require('../config')

// test database json file
const database = require('./database.json')

require('../models/film.model')
require('../models/cinema.model')

const Film = mongoose.model('films')
const Cinema = mongoose.model('cinemas')

// connecting to DB
mongoose.connect(config.DB_URL, {
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err))

// filling DB with test data
database.films.forEach(f => new Film(f).save().catch(e => console.log(e)))
database.cinemas.forEach(c => new Cinema(c).save().catch(e => console.log(e)))