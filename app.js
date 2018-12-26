const TelegramBot = require('node-telegram-bot-api')
const mongoose = require('mongoose')

const config = require('./config')
const keyboard = require('./keyboard/keyboard')
const kb = require('./keyboard/keyboard-buttons')

// контроллеры
const filmController = require('./controllers/filmController')
const cinemaController = require('./controllers/cinemaController')
const userController = require('./controllers/userController')

//подключаем базу данных
mongoose.connect(config.DB_URL, {
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err))

const ACTION_TYPE = {
    TOGGLE_FAV_FILM: 'tff',
    SHOW_CINEMAS: 'sc',
    SHOW_CINEMAS_MAP: 'scm',
    SHOW_FILMS: 'sf'
}

//создаем объект бот
const bot = new TelegramBot(config.TOKEN, {
    polling: true
})

//получил сообщение от пользователя
bot.on('message', async msg => {
    console.log('Working', msg.from.first_name)

    const chatId = msg.chat.id

    switch(msg.text){
        case kb.main.favourite:
            const html = await filmController.showFavouriteFilms(msg.from.id)
            sendHTML(chatId, html, 'main')
            break
        case kb.main.films:
            bot.sendMessage(chatId, 'Выберите жанр:', await filmController.inlineGenreKeyboard());
            break
        case kb.main.cinemas:
            bot.sendMessage(chatId, `Отправить местоположение`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: keyboard.cinemas
                }
            })
            break
        case kb.main.recommend:
            const recommend = await filmController.showRecommendation(msg.from.id)
            sendHTML(chatId, recommend, 'main')
            break
        case kb.back:
            bot.sendMessage(chatId, 'Что хотите посмотреть?', {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: keyboard.main
                }
            })
            break      
    }

    if(msg.location){
        const html = await cinemaController.getCinemasInCoord(msg.location)
        sendHTML(chatId, html)
    }

})

//обработка команды /start
bot.onText(/\/start/, msg => {
    const text = `Здравствуйте, ${msg.from.first_name}\nВыберите команду для начала работы:`
    bot.sendMessage(msg.chat.id, text, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: keyboard.main
        }
    })
})

//обработка выбора из списка фильмов
bot.onText(/\/f(.+)/, async (msg, [source, match]) => {
    const filmUuid = match
    const chatId = msg.chat.id
    const film = await filmController.findFilmByUuid(filmUuid)
    const user = await userController.findUserById(msg.from.id)
    let isFav = false

    if (user) {
            isFav = user.films.indexOf(film.uuid) !== -1
    }

    const favText = isFav ? 'Удалить из избранного' : 'Добавить в избранное'
    const caption = `Название: ${film.name}\nГод: ${film.year}\nРейтинг: ${film.rate}\nСтрана: ${film.country}`
        
    bot.sendPhoto(chatId, film.picture, {
            caption: caption,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: favText,
                            callback_data: JSON.stringify({
                                type: ACTION_TYPE.TOGGLE_FAV_FILM,
                                filmUuid: film.uuid,
                                isFav: isFav
                            })
                        },
                        {
                            text: 'Кинотеатры',
                            callback_data: JSON.stringify({
                                type: ACTION_TYPE.SHOW_CINEMAS,
                                cinemaUuids: film.cinemas
                            })
                        }
                    ],
                    [
                        {
                            text: 'Кинопоиск',
                            url: film.link
                        }
                    ]
                ]
            }
    })

})

//обработка выбора из списка кинотеатров
bot.onText(/\/c(.+)/, async (msg, [source, match]) => {
    const cinemaUuid = match
    const chatId = msg.chat.id

    const cinema = await cinemaController.findOneCinema({uuid: cinemaUuid})
    bot.sendMessage(chatId, `Кинотеатр ${cinema.name}`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: cinema.name,
                            url: cinema.url
                        },
                        {
                            text: 'Показать на карте',
                            callback_data: JSON.stringify({
                                type: ACTION_TYPE.SHOW_CINEMAS_MAP,
                                lat: cinema.location.latitude,
                                lon: cinema.location.longitude
                            })
                        }
                    ],
                    [
                        {
                            text: 'Показать фильмы',
                            callback_data: JSON.stringify({
                                type: ACTION_TYPE.SHOW_FILMS,
                                filmUuids: cinema.films
                            })
                        }
                    ]
                ]
            }
    })
})

//обработка инлайн клавиатуры
bot.on('callback_query', async query => {
    const userId = query.from.id
    let data

    try {
        data = JSON.parse(query.data)
    } catch (e) {
        throw new Error('Data is not an object')
    }

    const { type } = data

    if (type === ACTION_TYPE.SHOW_CINEMAS_MAP) {
        const {lat, lon} = data
        bot.sendLocation(query.message.chat.id, lat, lon)
    } else if (type === ACTION_TYPE.SHOW_CINEMAS) {
        const html = await cinemaController.sendCinemasByQuery({uuid: {'$in': data.cinemaUuids}})
        sendHTML(userId, html)
    } else if (type === ACTION_TYPE.TOGGLE_FAV_FILM) {
        const result = await filmController.toggleFavouriteFilm(userId, query.id, data)
        bot.answerCallbackQuery(result)
    } else if (type === ACTION_TYPE.SHOW_FILMS) {
        const html = await filmController.sendFilmsByQuery({uuid: {'$in': data.filmUuids}})
        sendHTML(userId, html)
    } else {
        //вывод фильмов по жанру
        const html = await filmController.sendFilmsByQuery({type: data.genre})
        sendHTML(userId, html)
    }
})

bot.on('inline_query', async query => {
    const result = await filmController.inlineQueryFilms()
    bot.answerInlineQuery(query.id, result, {
        cache_time: 0
    })
})

//обработка вывода HTML разметки
function sendHTML(chatId, html, kbName = null) {
    const options = {
        parse_mode: 'HTML',
    }

    if (kbName) {
        options['reply_markup'] = {
            resize_keyboard: true,
            keyboard: keyboard[kbName]
        }
    }

    bot.sendMessage(chatId, html, options)
}