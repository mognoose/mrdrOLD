<template>
  <div class="container">
    <div class="row mt-5">
      <div class="col">
        <div class="card p-5 text-center">
          <img alt="MRDR logo" src="../assets/logo.svg" class="w-50">
          <h3>MRDR</h3>
          <h4>{{this.username}}</h4>
          <h4>{{this.room}}</h4>
            <div class="form-group">
              <button class="btn btn-outline-danger">Log out</button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    username: String,
    room: String
  },
  data(){
    return {
    }
  },
  methods: {
    login(){
      console.log(this.username, this.room);
      this.$emit('login:data', {name: this.username, room: this.room})
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
