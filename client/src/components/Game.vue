<template>
  <div class="container">
    <div class="row mt-5">
      <div class="col">
        <div class="card p-5 text-center">
          <img alt="MRDR logo" src="../assets/logo.svg" class="w-50">
          <h3>MRDR</h3>
          <h4>ROOM: {{player.room}}</h4>
          <h4>PLAYERS:</h4>
          <div v-for="player in players" :key="player.id">
            {{player.name}}

          </div>
            <div class="form-group">
              <button class="btn btn-outline-danger" @click="$emit('logout')">Log out</button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HelloWorld',
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
.card {
  margin: 0 auto;
  max-width: 35em;
}
img{
  margin: 0 auto;
}
h3{
  font-weight: bold;
  color: black;
}
input{
  font-size: 2em;
  text-align: center;
}
label{
  font-weight: bold;
  font-size: 1.2em;
}

</style>
