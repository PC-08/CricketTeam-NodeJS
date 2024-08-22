const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is started at 3000 port')
    })
  } catch (e) {
    console.log(`DB error ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// 1

app.get('/players/', async (request, response) => {
  const GetPlayersListQuery = `
  SELECT 
  *
  FROM 
   cricket_team
  ORDER BY 
   player_id
  `

  const playersArray = await db.all(GetPlayersListQuery)

  const convertDbObjectToResponseObject = dbObject => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    }
  }

  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

//2

app.post('/players/', async (request, response) => {
  const playerDetails = request.body

  const {playerName, jerseyNumber, role} = playerDetails

  const AddPlayerQuery = `
  INSERT INTO 
    cricket_team (player_name, jersey_number,role)
  VALUES (
    '${playerName}',
    ${jerseyNumber},
    '${role}'
  )   `

  const dbResponse = await db.run(AddPlayerQuery)
  response.send(`Player Added to Team`)
})

//3

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerByIdQuery = `
  SELECT * 
  FROM
  cricket_team
  WHERE
   player_id = ${playerId}; 
  `

  const PlayerArray = await db.get(getPlayerByIdQuery)
  const convertDbObjectToResponseObject = dbObject => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    }
  }

  response.send(convertDbObjectToResponseObject(PlayerArray))
})

//4

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const playerDetails = request.body

  const {playerName, jerseyNumber, role} = playerDetails

  const UpdatePlayerDetailsQuery = `
  UPDATE 
   cricket_team 
  SET 
     player_name =  '${playerName}',
     jersey_number = ${jerseyNumber},
     role = '${role}'
  WHERE 
      player_id = ${playerId}; 
   `

  const UpdatePlayer = await db.run(UpdatePlayerDetailsQuery)
  response.send('Player Details Updated')
})

//5

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const DelePlayerQuery = `
  DELETE 
  FROM
  cricket_team
  WHERE  
   player_id = ${playerId}; 

  `
  await db.run(DelePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
