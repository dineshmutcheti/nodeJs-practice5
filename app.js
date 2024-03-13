const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dpPath = path.join(__dirname, 'moviesData.db')
let db = null

const initialize = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initialize()

const convertMovieNametoPascalCase = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMovieQuery = `
          
          SELECT
              movie_name
            FROM
            movie;`
  const movieArray = await db.all(getMovieQuery)
  response.send(
    movieArray.map(moviename => convertMovieNametoPascalCase(moviename)),
  )
})

//2 create a new movie in the movie table .movie_idnis auto incremented

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
          
            INSERT INTO
            movie (director_id, movie_name, lead_actor)
            VALUES
            (
              ${directorId},
              '${movieName}',
              '${leadActor}'
            );`

  const dbResponse = await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})
// to convert to pascalcase
const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

//3 Returns a movie based on the movie ID

app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMovie = `
        SELECT 
          *
          FROM 
          movie
          WHERE
          movie_id = ${movieId};`
  const movie = await db.get(getMovie)
  console.log(movieId)
  response.send(convertDbObjectToResponseObject(movie))
})
//4 Updates the details of a movie in the movie table based on the movie ID

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `
        UPDATE
        movie
        SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
        WHERE
        movie_id = ${movieId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//5 Delete a movie from the movie table based on the movie ID

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM
    movie
      WHERE
      movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

const convertDirectorDetailsPascalCase = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

//6 Returns a list of all directors in the director table

app.get('/directors/', async (request, response) => {
  const getAllDirectorQuery = `
        SELECT
        *
        FROM
        director;`
  const moviesArray = await db.all(getAllDirectorQuery)
  response.send(
    moviesArray.map(director => convertDirectorDetailsPascalCase(director)),
  )
})

const convertMovieNamePascalCase = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

// 7 Returns a list of all movie names directed by a specific director
app.get('/directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovieQuery = `
    SELECT
      movie_name
      FROM
      director INNER JOIN movie
      ON director.director_id = ${directorId};`
  const movies = await db.all(getDirectorMovieQuery)
  console.log(directorId)
  response.send(
    movies.map(movienames => convertMovieNamePascalCase(movienames)),
  )
})

module.exports = app
