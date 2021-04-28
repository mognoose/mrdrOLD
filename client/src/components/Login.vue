<template>
  <div class="container">
    <div class="row mt-5">
      <div class="col">
        <div class="card p-5 text-center">
          <img alt="MRDR logo" src="../assets/logo.svg" class="w-50">
          <h3>MRDR</h3>
          <form class="p-5" @submit.prevent="login()">
            <div class="form-group">
              <label for="name" class="form-label">Name</label>
              <input type="name" class="form-control" id="name" v-model="username">
            </div>
            <div class="form-group">
              <label for="room" class="form-label">Room</label>
              <input type="room" class="form-control" id="room" v-model="room">
            </div>
            <div class="form-group">
              <button type="submit" :class="(username&&room) ? 'btn btn-outline-success' : 'btn btn-outline-secondary'" :disabled="!username || !room">Play</button>
            </div>
          </form>
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
    msg: String
  },
  data(){
    return {
      username: "",
      room: ""
    }
  },
  methods: {
    login(){
      console.log(this.username, this.room);
      console.log(process.env.API)

      axios.post('http://localhost:8080/api/players', {
        name: this.username,
        room: this.room
      })
      .then(function (response) {
        console.log(response);
        this.$emit('login:data', {name: this.username, room: this.room})
      })
      .catch(function (error) {
        console.log(error);
      })


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
