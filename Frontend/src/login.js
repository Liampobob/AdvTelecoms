// require.config({
//     paths:{
//         crypto: '../node_modules/crypto'
//     }
// })
function getWebWorkerResponse (messageType, messagePayload) {
    return new Promise((resolve, reject) => {
      // Generate a random message id to identify the corresponding event callback
      const messageId = Math.floor(Math.random() * 100000)
  
      // Post the message to the webworker
      this.cryptWorker.postMessage([messageType, messageId].concat(messagePayload))
  
      const handler = function (e) {
        // Only handle messages with the matching message id
        if (e.data[0] === messageId) {
          // Remove the event listener once the listener has been called.
          e.currentTarget.removeEventListener(e.type, handler)
  
          // Resolve the promise with the message payload.
          resolve(e.data[1])
        }
      }
  
      // Assign the handler to the webworker 'message' event.
      this.cryptWorker.addEventListener('message', handler)
    })
  }

  async function created () {
    this.cryptWorker = new Worker('crypto-worker.js')
    this.keys = await this.getWebWorkerResponse('generate-keys')

  };

async function signup(form){
    await created()
    var now = new Date();
    fetch("http://127.0.0.1:8080/user", {
      method: "POST", 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        uuid: now.getTime(),
        name: form.uname.value,
        key: this.keys["pub"]
      })
    }).then(data => data.json()).then(res => {
      console.log(res['key'])
      var data = {
        uuid: now.getTime(),
        name: form.uname.value,
        keys: this.keys,
        sKey: res['key']
    }

    localStorage.setItem('advTelecomUser', JSON.stringify(data))    
    window.location.href = "./home.html";
  });
 
}