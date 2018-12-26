const TelegramBot = require('node-telegram-bot-api')
const mongoose = require('mongoose')

const config = require('./config')
const keyboard = require('./keyboard/keyboard')

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

// создание бота
const bot = new TelegramBot(config.TOKEN, {polling: true})

// обработка команды /start
bot.onText(/\/start/, msg => {
  const text = `Здравствуйте, ${msg.from.first_name}\nВыберите команду для начала работы.`
  bot.sendMessage(msg.chat.id, text, {
      reply_markup: {
          resize_keyboard: true,
          keyboard: keyboard.main
      }
  })
})

// обработка входящих сообщений
bot.on('message', async (msg) => {

  console.log('Working', msg.from.first_name)

  const chatId = msg.chat.id

  switch(msg.text){
        case kb.main.films:

            break
        case kb.main.cinemas:
            
            break
        case kb.main.favourite:
            
            break
        case kb.main.recommend:

            break
        case kb.back:
            bot.sendMessage(chatId, {
                reply_markup: {
                  resize_keyboard: true,
                  keyboard: keyboard.main
                }
            })
            break       
    }
})