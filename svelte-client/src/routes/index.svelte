<script>
  import logo from 'images/logo.svg'
  import io from "socket.io-client";
  import { each } from "svelte/internal";
  import { fade } from "svelte/transition";
  import { Card } from "sveltestrap/src";
  import { goto } from '@sapper/app';

  const windowGlobal = typeof window !== 'undefined' && window;

  let room = windowGlobal?.localStorage?.getItem('room')
  let name = windowGlobal?.localStorage?.getItem('name')
  

  const join = async () => {
    localStorage.setItem('room', room);
    localStorage.setItem('name', name);
    await goto('/chat')
  }

</script>

<svelte:head>
  <title>MRDR Svelte Client</title>
</svelte:head>
<div class="container">
  <div class="row">
    <div class="col">
        <Card class="p-5 d-flex justify-content-center">
          <img src="{logo}" class="loginlogo" alt="logo">
          <h1 class="text-center">MRDR</h1>
          <form action="" class="pt-3">
            <div class="form-group text-center">
              <label for="name" class="form-label mt-3">Name</label>
              <input id="name" class="form-control mb-2" type="text" bind:value={name} />
            </div>
            <div class="form-group text-center">
              <label for="room" class="form-label mt-3">Room</label>
              <input id="room" class="form-control mb-2" type="text" bind:value={room} />
            </div>
            <div class="form-group text-center">
              <button class="btn btn-outline-success mt-4" on:click={join}>Join</button>
            </div>
          </form>
        </Card>
    </div>
  </div>
</div>

<style>
.loginlogo{
  background-color: #FFFFFF;
  border-radius: 50%;
  width: 5em;
  height: 5em;
  margin: 0 auto;
  padding: .5em;
}
input{
  max-width: 400px;
  margin: 0 auto;
  background-color: #333;
  border-color: #333;
  color: #EEE;
  text-align: center;
  font-size: 1.2em;
}
#room{
  text-transform: uppercase;
}

input:focus{
  background-color: #333;
  color: #EEE;
}


</style>
