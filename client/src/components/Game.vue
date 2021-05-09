<template>
  <div class="container">
    <div class="row">
      <div class="col text-center">

        <div class="row header">
          <div class="col vcenter">
            <h3 class="w-100">
              <img alt="MRDR logo" src="../assets/logo.svg" class="ingamelogo">
              MRDR
            </h3>
          </div>
          <div class="col vcenter">
            <h4 class="w-100">
              ROOM: {{player.room}}
            </h4>
          </div>
          <div class="col vcenter">
            <div class="w-100">
              <button class="btn btn-outline-danger" @click="$emit('logout')">Leave</button>
              <button class="btn btn-outline-success ml-2" @click="toggleReady()">Ready</button>
              <button class="btn btn-outline-success ml-2" @click="getPlayers()">Refresh</button>
            </div>
          </div>
        </div>


          <h4>PLAYERS:</h4>
          <div class="row">
            <div class="col mb-4" v-for="opponent in players" :key="opponent.id">
              <div class="card">
                <p class="playername">
                  {{opponent.name}}
                  
                </p>
                <div
                  class="profilepic"
                  :class="
                    opponent.ready ? 'border-success' : 'border-secondary'
                    "
                  >
                  <img alt="profilepic" src="../assets/logo.svg">
                </div>
                <div class="row p-2">
                  <div class="col">
                    <button
                      class="btn btn-sm"
                      :class="player.role != 'murderer' ? 'btn-outline-secondary' : 'btn-outline-danger'"
                      :disabled="player.role != 'murderer'"
                    >
                      Murder
                    </button>
                  </div>
                  <div class="col">
                    <button
                      class="btn btn-sm"
                      :class="player.role != 'doctor' ? 'btn-outline-secondary' : 'btn-outline-success'"
                      :disabled="player.role != 'doctor'"
                    >
                      Rescue
                    </button>
                  </div>
                  <div class="col">
                    <button
                      class="btn btn-sm"
                      :class="player.role != 'cop' ? 'btn-outline-secondary' : 'btn-outline-primary'"
                      :disabled="player.role != 'cop'"
                    >
                      Investigate
                    </button>
                  </div>
                </div>
              </div>
          </div>

          </div>

      </div>
    </div>
    <b-modal ref="message-modal" hide-footer :title="message.title">
      <div class="d-block text-center">
        <img :alt="player.role+' image'" :src="message.images[player.role]" class="w-50 m-5">
        <h3>{{message.text}}</h3>
      </div>
      <div class="text-center">
        <b-button class="mt-3" variant="outline-success" @click="hideMessage">OK</b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';
import io from 'socket.io-client'

export default {
  name: 'Game',
  props: {
    player: Object,
  },
  mounted(){
    this.getPlayers();
    this.socket.on('STATUS',data => {
      this.getPlayers()
      console.log("SOCKET.IO: "+data)
    })
    this.socket.on('READY', async () => {
      console.log("Everyone is ready!")
      await this.getPlayers()
      await this.showMessage("role")

    })
  },
  data(){
    return {
      players: [],
      socket: io('localhost:8080'),
      gameStatus: 'lobby',
      message: {
        title: "",
        text: "",
        goals: {
          murderer: "murder everyone and not get caught",
          doctor: "find and rescue murder victims",
          cop: "find the murderer",
        },
        roles: {
          murderer: "murderer",
          doctor: "doctor",
          cop: "investigator",
        },
        images: {
          murderer: require('/src/assets/images/murderer.png'),
          doctor: require('/src/assets/images/doctor.png'),
          cop: require('/src/assets/images/cop.png'),
        }
      }
    }
  },
  methods: {
    async getPlayers(){
      try {
        const response = await axios.get('http://localhost:8080/api/players/?room='+this.player.room)
        this.players = response.data
      } catch (e) {
        this.errors.push(e)
      }
      console.log("PLAYER: ", this.player)
      console.log("PLAYERS: ", this.players)

      const self = this.players.filter(player => player.id == this.player.id)
      console.log(self)
      this.player.role = self[0].role
    },
    toggleReady(){
      let ready = true
      if(this.player.ready) ready = false
      axios.put('http://localhost:8080/api/players/'+this.player.id, {ready})
      .then(response => {
        console.log("AXIOS: "+response.data);
        this.socket.emit('CHANGE_STATUS', {
          ready: ready,
      });
      })
      .catch(error => {
        return console.log(error);
      })

      this.player.ready = ready
    },
    showMessage(type){
      if(type === "role"){
        this.message.title = "You are the "+this.message.roles[this.player.role]
        this.message.text = "Your goal is to "+this.message.goals[this.player.role]
        
        this.$refs['message-modal'].show()

      }

    },
    hideMessage(){
      this.$refs['message-modal'].hide()

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .header{
    background-color: #212121;
    border-radius: 1.3em;
    padding: 1em;
    margin: 1em;
  }
  .ingamelogo{
    width: 2em;
    background-color: #FFFFFF;
    border-radius: 100%;
    height: 2em;
    padding: 0.2em;
  }
  h3, h4{
    font-weight: bold;
    color: #FFFFFF;
  }
  input{
    font-size: 2em;
    text-align: center;
  }
  label{
    font-weight: bold;
    font-size: 1.2em;
  }
  .card{
    min-width: 280px;
    width: 285px;
    margin: 0 auto;
  }
  .profilepic{
    margin: 0 auto;
    border: 1px solid #666;
    width: 10em;
    height: 10em;
    padding: 1em;
  }
  .profilepic img{
    width: 100%;
    height: 100%;
    background-color: #515151;
    box-shadow: 0px 0px 10px #515151;
    border-radius: 100%;
  }
  .playername{
    font-size: 1.5em;
    color:#FFFFFF;
  }
  .vcenter{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    text-align: center;
    margin: 0 auto;
  }
</style>
