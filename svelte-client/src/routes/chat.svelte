<script>
  import logo from "images/logo.svg";
  import io from "socket.io-client";
  import { each } from "svelte/internal";
  import { fade } from "svelte/transition";
  import { Card } from "sveltestrap/src";
  import { goto } from '@sapper/app';

  // let room = localStorage.getItem("room");
  // let name = localStorage.getItem("name");
  const windowGlobal = typeof window !== "undefined" && window;

  let room = windowGlobal?.localStorage?.getItem("room");
  let name = windowGlobal?.localStorage?.getItem("name");

  const socket = io("localhost:8080", {
    extraHeaders: { room: room?.toUpperCase(), name },
  });

  let ready = false;
  let message = "";
  let messages = [];
  let users = [];

  const send = () => {
    socket.emit("MESSAGE", { name, room, message, ready });
    message = "";
    updateScroll();
  };
  socket.on("USERS", (userlist) => {
    users = userlist;
    console.log(userlist);
  });
  socket.on(
    "MESSAGE",
    msg => (
      //(messages = [...messages, msg.name + "@"+msg.room+": " + msg.message]), updateScroll() //WITH ROOM FOR DEBUG
      (messages = [...messages, msg]),
      updateScroll() //NORMAL
    )
  );
  socket.on(
    "ROLE",
    role => messages = [...messages, {name: 'Server', message: 'You are the '+role.role}]
  );

  function updateScroll() {
    setTimeout(() => {
      let element = document.getElementById("messages");
      element.scrollTop = element.scrollHeight;
    }, 100);
  }

  function onReady() {
    ready = !ready;
    socket.emit("READY", { name, room, ready });
  }

  function onLeave() {
    socket.emit("LEAVE", { name, room, id: socket.id});
    goto('/')
  }

  function statusColor(name){
    if(!name) return
    let color = 'text-normal'
    let statuses = users.map(user => {
      if(user.name === name) return user.status
    })
    let ready = statuses.forEach(status => {
      if(status === 'ready') return true
    })
    if(ready) color = 'text-success'
    console.log("STATUSJEE:",status)
    return color
  }
</script>

<svelte:head>
  <title>MRDR Svelte Client - Chat</title>
</svelte:head>
<div class="container">
  <div class="row">
    <div class="col-8">
      <Card class="p-1 d-flex">
        <div id="messages" class="messages align-items-end">
          <ul class="messageTextList">
            {#each messages as message}
              {#if message.name === "Server"}
                <li trasition:fade class="text-warning messageText">
                  {message.name}: {message.message}
                </li>
              {:else}
                <li trasition:fade class="messageText">
                  <span class="{message.ready?'text-success':'text-normal'}">
                    {message.name}:
                  </span>
                  <span>
                     {message.message}
                  </span>
                </li>
              {/if}
            {/each}
          </ul>
        </div>
        <form action="">
          <input
            class="form-control"
            id="m"
            autocomplete="off"
            bind:value={message}
          />
          <button
            class="btn btn-sm btn-primary hidden"
            on:click|preventDefault={send}>Send</button
          >
        </form>
      </Card>
    </div>
    <div class="col-4">
      <Card class="p-1 d-flex">
        <div id="messages" class="messages align-items-end">
          <ul class="messageTextList">
            {#each users as user}
              <li
                trasition:fade
                class="{user.status == 'ready'
                  ? 'text-success'
                  : 'text-normal'} messageText"
              >
                {user.name}
              </li>
            {/each}
          </ul>
        </div>
        <div class="row">
          <div class="col-sm text-center p-0 m-0">
            <button
              on:click={onReady}
              class="m-0 btn btn-sm {ready ? 'btn-danger' : 'btn-success'}"
              >{ready ? "Unready" : "Ready"}</button
            >
          </div>
          <div class="col-sm text-center p-0 m-0">
            <button
              on:click={onLeave}
              disabled={ready}
              class="m-0 btn btn-sm {ready ? 'btn-secondary' : 'btn-danger'}"
              >Leave</button
            >
          </div>
        </div>
      </Card>
    </div>
  </div>
</div>

<style>
  input {
    max-width: 400px;
    margin: 0 auto;
    background-color: #333;
    border-color: #333;
    color: #eee;
    text-align: left;
    font-size: 1.2em;
  }

  input:focus {
    background-color: #333;
    color: #eee;
  }
  .hidden {
    display: none;
  }

  #messages {
    height: 70vh;
    overflow-y: scroll;
  }

  #m {
    padding: 0;
    margin: 0;
    max-width: 100%;
  }
  ul {
    list-style-type: none;
    padding: 0em;
    margin: 0em;
  }
  li {
    margin: 0em;
  }
</style>
