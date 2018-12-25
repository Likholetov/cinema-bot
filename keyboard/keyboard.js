const kb = require('./keyboard-buttons')

module.exports = {
    main: [
        [kb.main.films, kb.main.cinemas],
        [kb.main.favourite],
        [kb.main.recommend]   
    ],
    cinemas: [
        [
            {
                text: 'Отправить местоположение',
                request_location: true
            }
        ],
        [kb.back]
    ]
}