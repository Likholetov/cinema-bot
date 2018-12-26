const mongoose = require('mongoose')
const _ = require('lodash')

require('../models/film.model')
require('../models/user.model')

const Film = mongoose.model('films')
const User = mongoose.model('users')

class FilmController {

  //Обработка выбора фильма
  findFilmByUuid(filmUuid){
    return Film.findOne({uuid: filmUuid})
  }

  //Поиск фильмов по запросу
  async sendFilmsByQuery(query) {
    const films = await Film.find(query)
    const result = films.map((f, i) => {
      return `<b>${i + 1}</b> ${f.name} - /f${f.uuid}`
    }).join('\n')
    if(result){
      return result
    } else {
    return 'Фильмов с таким жанром не найдено'
    }
  }

  //Вывод избранного для пользователя
  async showFavouriteFilms(userId) {
    const user = await User.findOne({telegramId: userId})
    if(user) {
      const films = await Film.find({uuid: {'$in': user.films}})
      let result
      if(films.length) {
        result = films.map((f, i) => {
          return `<b>${i + 1}</b> ${f.name} (/f${f.uuid})`
        }).join('\n')
          } else {
            result = 'Список избранного пуст'
          }
        return result             
    } else {
      return 'Список избранного пуст'
    }
  }

  //Добавление и уаление фильма из избранного
  async toggleFavouriteFilm(userId, queryId, {filmUuid, isFav}) {
    let userPromise
    const user = await User.findOne({telegramId: userId})
    if(user){
      if(isFav){
        user.films = user.films.filter(fUuid => fUuid !== filmUuid)
      } else {
        user.films.push(filmUuid)
      }
      userPromise = user
    } else {
      userPromise = new User({
        telegramId: userId,
        films: [filmUuid]
      })
    }

    const answerText = isFav ? 'Фильм удален из избранного' : 'Фильм добавлен в избранное'
    userPromise.save()
    const result = {
      callback_query_id: queryId,
      text: answerText
    }
    return result
  }

//рекомендация основанная на избранном
async showRecommendation(userId){
  const user = await User.findOne({telegramId: userId})
  let result = 'Для получения рекомендации добавьте в избранное, по крайней мере, один фильм'
    if(user) {
      const films = await Film.find({uuid: {'$in': user.films}})  
        if(films.length) {
          let genre
          films.map(f => genre = _.union(genre, f.type))
          let chousen = await Film.find({type: {'$in': genre}})
          chousen = _.differenceBy(chousen, films, 'id')
          if (chousen.length){
            const result = chousen.map((c, i) => {
              return `<b>${i + 1}</b> ${c.name} (/f${c.uuid})`
            }).join('\n')
              return 'Обязательно посмотрите:\n' + result + '\nВам понравится!'
            } else {
              return 'Вы посмотрели все фильмы из базы, ожидайте обновлений!'
            }
          } else {
            return result
          }
        } else {
          return result
        }
  }

  //Получение фильма для инлайн клавиатуры
  async inlineQueryFilms(){
    const films = await Film.find({})
    const result = films.map(f => {
          return {
              id: f.uuid,
              type: 'photo',
              photo_url: f.picture,
              thumb_url: f.picture,
              caption: `Название: ${f.name}\nГод: ${f.year}\nРейтинг: ${f.rate}\nСтрана: ${f.country}`,
              reply_markup: {
                  inline_keyboard: [
                      [
                          {
                              text: `Кинопоиск: ${f.name}`,
                              url: f.link
                          }
                      ]
                  ]
              }
          }
      })
    return result     
  }

  //Создание клавиатуры с жанрами фильмов
  async inlineGenreKeyboard(){
    const films = await Film.find({})
    let genre
    films.map(f => genre = _.union(genre, f.type))
    
    genre = genre.map(g => [
      { text: g, 
        callback_data: JSON.stringify({
        genre: g 
      })}
    ])

    genre = {
      reply_markup: JSON.stringify({
        inline_keyboard: genre
      })
    }

    return genre
  }
}

module.exports = new FilmController()