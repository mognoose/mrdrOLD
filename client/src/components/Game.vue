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
                <div class="profilepic" :class="opponent.alive ? 'border-primary' : 'border-secondary'">
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
                      :class="player.role != 'police' ? 'btn-outline-secondary' : 'btn-outline-primary'"
                      :disabled="player.role != 'police'"
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
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Game',
  props: {
    player: Object,
  },
  mounted(){
    this.getPlayers();
  },
  data(){
    return {
      players: []
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
