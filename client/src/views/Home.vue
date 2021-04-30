<template>
  <div class="home">
    <Login v-if="!joined" @login:data="login($event)" />
    <Game v-else :player="player" @logout="logout()"/>
  </div>
</template>

<script>
// @ is an alias to /src
import Login from '@/components/Login.vue'
import Game from '@/components/Game.vue'
import axios from 'axios';

export default {
  name: 'Home',
  components: {
    Login,
    Game
  },
  data(){
    return {
      joined: false,
      player: {},
    }
  },
  methods:{
    login(data){
      this.joined = true
      this.player = data
    },
    logout(){
      console.log(this.player.id)
      axios.delete('http://localhost:8080/api/players/'+this.player.id)
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        return console.log(error);
      })
      this.joined = false
    }
  }
}
</script>
<style>
html, body, .home, .container{
  background-color: #121212;
}
.col .card{
  background-color: #212121;
}
</style>