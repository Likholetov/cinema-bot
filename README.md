# cinema-bot
Telegram bot for advicing movies and cinemas according to your preferences and location.

Platform: Node.js 

Thanks to: [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) 

## How to use the bot

* Clone/Download/Fork the repository
* ```npm install```
* Create a Bot Account 
    * Get the associated token (https://core.telegram.org/bots/#botfather)
* Remove part "-example" in config-example.js
* Edit config.js
    * Set ```YOUR_TELEGRAM_BOT_TOKEN``` with the auth token of your bot
    * Set ```MONGODB_URL``` with your MongoDB url
* Run the bot
    * ```npm run start``` 
    * Stop it at any time with CTRL+C

## How to use test-data for DB

* If you want to test functions of bot, you can use test data
* ```npm run test``` 


# cinema-bot
Telegram бот предназанченный для рекомендации фильмов и кинотеатров, в зависиомти от ваших предпочтений и местонахождения.

Платформа разработки: Node.js 

Благодарность: [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) 

## Как использовать бота

* Clone/Скачайте/Fork данный репозиторий
* ```npm install```
* Создайте аккаунт бота 
    * Получите токен (https://core.telegram.org/bots/#botfather)
* Удалите часть "-example" в названии config-example.js
* Заполните config.js
    * Укажите в ```YOUR_TELEGRAM_BOT_TOKEN``` токен вашего бота
    * Укажите в ```MONGODB_URL``` url вашей MongoDB
* Запустите бота с помощью команды:
    * ```npm run start``` 
    * Бот может быть остановлен в любое время нажатием CTRL+C

## Как использовать тестовые данные

* Если вы хотите проверить функции бота, вы можете использовать тестовые данные для БД. Запустите команду:
* ```npm run test``` 