const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
var corsOptions = {
  origin: "*"
}
const { QueryTypes } = require('sequelize');

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

const db = require("./app/models");

// For resync use this
db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and re-sync db.");
});
// db.sequelize.sync();

app.get("/", (req, res) => {
  res.json({ message: "MRDR API" });
});

require("./app/routes/player.routes")(app);

const PORT = process.env.PORT || 8080;
server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const io = require("socket.io")(server, {
  cors:{
    origins: ["*"],
    handlePreflightRequest: (req, res) => {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST",
        "Access-Control-Allow-Headers": "my-custom-header",
        "Access-Control-Allow-Credentials": true
      });
      res.end();
    }
  }
});



async function checkReady(room){
  const players = await db.sequelize.query("SELECT * FROM `players`", { type: QueryTypes.SELECT })
  .then(
    console.log('success')
  ).catch(console.log('tääerror'))
  let ready = true
  players.forEach(p => {
    if(!p.ready) ready = false
  });
  return {ready, players}

  // await db.sequelize.query("SELECT * FROM `players`", { type: QueryTypes.SELECT })
  // .then(res => {
  //   let ready = true
  //   players = res.data
  //   res.forEach(p => {
  //     if(!p.ready) ready = false
  //   });
  //   return {ready, players}
  // }
  // ).catch(err => {
  //   console.log('tääerror')
  // })



}

async function dealRolesOLD(room, players){
  const ids = players.map(player => player.id)
  console.log("IDS: ", ids)
  let murderer
  let doctor
  let cop

  let key = Math.floor(Math.random()*ids.length)
  murderer = ids[key]
  ids.splice(key, 1)

  key = Math.floor(Math.random()*ids.length)
  doctor = ids[key]
  ids.splice(key, 1)

  key = Math.floor(Math.random()*ids.length)
  cop = ids[key]
  ids.splice(key, 1)

  console.log("murderer: ", murderer)
  console.log("doctor: ", doctor)
  console.log("cop: ", cop)

  await db.sequelize.query("UPDATE `players` SET role = 'murderer' WHERE id = "+murderer, { type: QueryTypes.UPDATE })
  await db.sequelize.query("UPDATE `players` SET role = 'doctor' WHERE id = "+doctor, { type: QueryTypes.UPDATE })
  await db.sequelize.query("UPDATE `players` SET role = 'cop' WHERE id = "+cop, { type: QueryTypes.UPDATE })
  await db.sequelize.query("UPDATE `players` SET alive = true WHERE room = '"+room+"'", { type: QueryTypes.UPDATE })

}
async function dealRoles(room){
  let players = users.filter(u=>u.room===room)
  const ids = players.map(player => player.id)
  console.log("IDS: ", ids)
  let murderer
  let doctor
  let cop

  let key = Math.floor(Math.random()*ids.length)
  murderer = ids[key]
  ids.splice(key, 1)

  key = Math.floor(Math.random()*ids.length)
  doctor = ids[key]
  ids.splice(key, 1)

  key = Math.floor(Math.random()*ids.length)
  cop = ids[key]
  ids.splice(key, 1)

  io.to(murderer).emit('ROLE', {role: 'murderer'})
  io.to(doctor).emit('ROLE', {role: 'doctor'})
  io.to(cop).emit('ROLE', {role: 'cop'})


  console.log("murderer: ", murderer)
  console.log("doctor: ", doctor)
  console.log("cop: ", cop)

}

let murdered
let saved
let investigated = false
let murder = false
let done = false
let users = []

io.on('connection', socket => {
  let name = socket.handshake.headers.name
  let room = socket.handshake.headers.room
  let status = 'joined'
  console.log(socket.id+': '+name+'@'+room+' status: '+status)
  if(name) socket.join(room)
  else socket.disconnect()


  let inList = users.forEach(user => {
    if(user.name === name) return true
    return false
  })
  if(!inList) users = [...users, {name, room, 'id': socket.id, status}]
  roomusers = users.filter(user => user.room === room)
  io.in(room).emit('USERS', roomusers)

  socket.on('MESSAGE', data => {
    if(data.name) io.in(room).emit('MESSAGE', data)
  })

  socket.on('READY', data => {
    users = users.map(user=>{
      if(user.name === data.name) {
        user.status = data.ready ? 'ready' : 'joined'
      }
      return user
    })
    io.in(room).emit('USERS', users)
    let usersReady = true
    users.forEach(user=>{
      if(user.status === 'joined') usersReady = false
    })
    if(usersReady){
      io.in(room).emit('MESSAGE', {name: 'Server', message:'Everyone\'s ready! Game is starting'})
      dealRoles(room)
    }

  })

  socket.on('LEAVE', data => {
    console.log(data)
    users = users.filter(user => user.id !== data.id)
    socket.disconnect();
    io.in(room).emit('USERS', users)


  })

  socket.on('CHANGE_STATUS', async data => {
    let check = await checkReady('test')
    if(check.ready){
      await dealRoles('test', check.players);
      io.emit('READY')
    }
    io.emit('STATUS', data)
  })

  socket.on('ACTION_DONE', async data => {

    console.log(data)
    if(data.action === "murder") murdered = data.target
    if(data.action === "rescue") saved = data.target
    if(data.action === "investigate") investigated = true

    if(murdered && saved){
      done = true
      if(murdered != saved) {
        murder = true
      }
    }

    if(done && investigated){
      console.log('murder: '+murder+' murdered: '+murdered)
      if(murder){
        await db.sequelize.query("UPDATE `players` SET alive = false WHERE id = "+parseInt(murdered), { type: QueryTypes.UPDATE })
      }
      
      const res = await db.sequelize.query("UPDATE `players` SET ready = false WHERE room = 'test'", { type: QueryTypes.UPDATE })
      console.log(res)
      io.emit('SUNRISE', {murder, target: murdered})
      murdered = null
      saved = null
      investigated = false
      murder = false
      done = false
    }
  })
  socket.on('DISCUSSION_READY', async data => {
    let check = await checkReady('test')
    if(check.ready) io.emit('NEXT_DAY')
    io.emit('STATUS', data)
  })

})