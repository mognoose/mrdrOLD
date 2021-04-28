<template>
  <div class="home">
    <Login v-if="!joined" @login:data="login($event)" />
    <Game v-else :username="name" :room="room" @logout="(logout())"/>
  </div>
</template>

<script>
// @ is an alias to /src
import Login from '@/components/Login.vue'
import Game from '@/components/Game.vue'

export default {
  name: 'Home',
  components: {
    Login,
    Game
  },
  data(){
    return {
      joined: false,
      room: "",
      name: ""
    }
  },
  methods:{
    login(data){
      this.joined = true
      this.name = data.name
      this.room = data.room
      console.log(this.name);
      console.log(this.room);
    }
  }
}
</script>
