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
                      :disabled="player.role != 'murderer' || !player.alive"
                      @click="murder(opponent.id)"
                    >
                      Murder
                    </button>
                  </div>
                  <div class="col">
                    <button
                      class="btn btn-sm"
                      :class="player.role != 'doctor' ? 'btn-outline-secondary' : 'btn-outline-success'"
                      :disabled="player.role != 'doctor' || !player.alive"
                      @click="rescue(opponent.id)"
                    >
                      Rescue
                    </button>
                  </div>
                  <div class="col">
                    <button
                      class="btn btn-sm"
                      :class="player.role != 'cop' ? 'btn-outline-secondary' : 'btn-outline-primary'"
                      :disabled="player.role != 'cop' || gameStatus != 'night' || !player.alive"
                      @click="investigate(opponent.id)"
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
        <b-button v-if="message.waitForCop" class="mt-3" variant="outline-success" @click="investigationReady()">COP OK ({{message.waitForCop}})</b-button>
        <b-button v-else class="mt-3" variant="outline-success" @click="hideMessage">OK</b-button>
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
    this.socket.on('STATUS',() => {
      this.getPlayers()
    })
    this.socket.on('READY', async () => {
      this.gameStatus = 'night'
      await this.getPlayers()
      await this.showMessage({type: "role"})

    })
    this.socket.on('SUNRISE', async (data) => {
      this.gameStatus = 'day'
      await this.getPlayers()
      await this.showMessage({type: "morning", data})

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
        },
        waitForCop: false
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

      const self = this.players.filter(player => player.id == this.player.id)
      this.player.role = self[0].role
    },
    toggleReady(){
      let ready = true
      if(this.player.ready) ready = false
      axios.put('http://localhost:8080/api/players/'+this.player.id, {ready})
      .then(() => {
        this.socket.emit('CHANGE_STATUS', {
          ready: ready,
        });
      })
      .catch(error => {
        return console.log(error);
      })

      this.player.ready = ready
    },
    showMessage(message){
      if(message.type === "role"){
        this.message.title = "You are the "+this.message.roles[this.player.role]
        this.message.text = "Your goal is to "+this.message.goals[this.player.role]
        
        this.$refs['message-modal'].show()
      }
      else if(message.type === "investigation"){
        this.message.title = "You investigated "+message.target
        this.message.text = "You found out that "+message.target
        this.message.text += (message.success ? " is the murderer" : " is not the murderer")
        this.message.waitForCop = true
        
        this.$refs['message-modal'].show()
      }
      else if(message.type === "murder"){
        this.message.title = "You stabbed "+message.target
        this.message.text = "You stabbed "+message.target
        
        this.$refs['message-modal'].show()
      }
      else if(message.type === "rescue"){
        this.message.title = "You rescued "+message.target
        this.message.text = "You saved the life of "+message.target
        
        this.$refs['message-modal'].show()
      }
      else if(message.type === "morning"){
        let victim = this.players.filter(player => player.id == message.data.target)
        victim = victim[0]
        console.log(victim.name)
        this.message.title = "It is morning"
        if(message.data.murder) this.message.text = "Poor "+victim.name+" was found murdered in cold blood"
        else this.message.text = "Poor "+victim.name+" was stabbed last night. Luckily he survived"
        
        this.$refs['message-modal'].show()
      }

    },
    hideMessage(){
      this.$refs['message-modal'].hide()
    },
    murder(id){
      const target = this.players.filter(player => player.id === id)
      this.showMessage({type: "murder", target: target[0].name})
      this.socket.emit('ACTION_DONE', {
        action: 'murder',
        target: id,
      });
    },
    rescue(id){
      const target = this.players.filter(player => player.id === id)
      this.showMessage({type: "rescue", target: target[0].name})
      this.socket.emit('ACTION_DONE', {
        action: 'rescue',
        target: id,
      });
    },

    investigate(id){
      this.gameStatus = 'day'
      let investigation = {
        type: "investigation",
        success: false
      }
      const target = this.players.filter(player => player.id === id)
      if(target[0].role === "murderer") investigation.success = true
      investigation.target = target[0].name
      this.showMessage(investigation)
    },
    investigationReady(){
      this.socket.emit('ACTION_DONE', {
        action: 'investigate',
        target: 0,
      });
      this.message.waitForCop = false
      this.hideMessage()
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
