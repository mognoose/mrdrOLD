<template>
  <div class="container">
    <div class="row mt-5">
      <div class="col">
        <div class="card p-5 text-center">
          <img alt="MRDR logo" src="../assets/logo.svg" class="w-50">
          <h3>MRDR</h3>
          <form class="p-5">
            <div class="form-group">
              <label for="name" class="form-label">Name</label>
              <input type="name" class="form-control" id="name">
            </div>
            <div class="form-group">
              <label for="room" class="form-label">Room</label>
              <input type="room" class="form-control" id="room">
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
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
