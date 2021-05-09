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
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });
db.sequelize.sync();

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

async function getStatuses(room){
  const players = await db.sequelize.query("SELECT * FROM `players`", { type: QueryTypes.SELECT })
  .then(
    console.log('success')
  ).catch(console.log('error'))
  let ready = true
  players.forEach(player => {
    if(!player.ready) ready = false
  });
  if(ready){
    const ids = players.map(player => player.id)
    console.log("IDS: ", ids)
    let murderer
    // let doctor
    // let cop

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
  }
  // console.log(ready)
  return ready

}

let murdered
let saved
let investigated = false
let murder = false
let done = false

io.on('connection', socket =>{
  console.log(socket.id)

  socket.on('CHANGE_STATUS', async data => {
    let ready = await getStatuses('test')
    if(ready) io.emit('READY')
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
      io.emit('SUNRISE', {murder, target: murdered})
      murdered = null
      saved = null
      investigated = false
      murder = false
      done = false
    }
    console.log('murdered: '+murdered)
    console.log('saved: '+saved)
    console.log('murder: '+murder)
    console.log('done: '+done)
    console.log("investigated: "+investigated)

    // let ready = await getStatuses('test')
    // if(ready) io.emit('READY')
  })

})