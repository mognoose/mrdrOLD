<script>
  import logo from "images/logo.svg";
  import io from "socket.io-client";
  import { each } from "svelte/internal";
  import { fade } from "svelte/transition";
  import { Card } from "sveltestrap/src";

  // let room = localStorage.getItem("room");
  // let name = localStorage.getItem("name");
  const windowGlobal = typeof window !== "undefined" && window;

  let room = windowGlobal?.localStorage?.getItem("room");
  let name = windowGlobal?.localStorage?.getItem("name");

  const socket = io("localhost:8080", { extraHeaders: { room, name } });

  let message = "";
  let messages = [];
  let users = [];

  const send = () => {
    socket.emit("MESSAGE", { name, room, message });
    message = "";
    updateScroll();
  };
  socket.on("USERS", userlist => {
    users = userlist
    console.log(userlist)
  })
  socket.on(
    "MESSAGE",
    (msg) => (
      //(messages = [...messages, msg.name + "@"+msg.room+": " + msg.message]), updateScroll() //WITH ROOM FOR DEBUG
      (messages = [...messages, msg.name + ": " + msg.message]), updateScroll() //NORMAL
    )
  );

  function updateScroll() {
    setTimeout(() => {
      let element = document.getElementById("messages");
      element.scrollTop = element.scrollHeight;
      console.log("Scrolled");
    }, 100);
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
              <li trasition:fade class="messageText">{message}</li>
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
              <li trasition:fade class="messageText">{user.name}</li>
            {/each}
          </ul>
        </div></Card
      >
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
