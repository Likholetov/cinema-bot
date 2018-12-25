const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
const keyboard = require('./keyboard/keyboard')
const kb = require('./keyboard/keyboard-buttons')

//controllers
const movieController = require('./controllers/movieController')
const cinemaController = require('./controllers/cinemaController')

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(config.TOKEN, {polling: true})

//обработка команды /start
bot.onText(/\/start/, msg => {
  const text = `Здравствуйте, ${msg.from.first_name}\nВыберите команду для начала работы.`
  bot.sendMessage(msg.chat.id, text, {
      reply_markup: {
          resize_keyboard: true,
          keyboard: keyboard.main
      }
  })
})

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message')
})