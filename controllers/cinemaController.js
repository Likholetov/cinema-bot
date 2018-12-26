const mongoose = require('mongoose')
const geolib = require('geolib')
const _ = require('lodash')

require('../models/cinema.model')

const Cinema = mongoose.model('cinemas')

class CinemaController {


    findOneCinema(query){
        return Cinema.findOne(query)
    }

    async sendCinemasByQuery(query) {
        const cinemas = await Cinema.find(query)
        const html = cinemas.map((c, i) => {
            return `<b>${i + 1}</b> ${c.name} - /c${c.uuid}`
    }).join('\n')
    return html
    }

    async getCinemasInCoord(location){
        let cinemas = await Cinema.find({})
        cinemas.forEach(c => { 
            c.distance = geolib.getDistance(location, c.location) / 1000
        })

        cinemas = _.sortBy(cinemas, 'distance')

        const html = cinemas.map((c, i) => {
            return `<b>${i + 1}</b> ${c.name}. <em>Расстояние</em> - <strong>${c.distance}</strong> км. /c${c.uuid}`
        }).join('\n')

        return html
    }
}

module.exports = new CinemaController()