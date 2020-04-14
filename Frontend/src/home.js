let tmp = JSON.parse(localStorage.getItem("advTelecomUser"))
let node = document.getElementById('loginnav')
if (tmp == null) {
    let a = document.createElement("a");
    a.setAttribute("href", "./login.html")
    a.setAttribute("class", "w3-button w3-bar-item")
    let t = document.createTextNode("Sign Up")
    a.appendChild(t)
    node.appendChild(a);
} else {
    let a = document.createElement("a");
    a.setAttribute("href", "")
    a.setAttribute("class", "w3-button w3-bar-item")
    let t = document.createTextNode("Welcome " + tmp['name'] + " Id:" + tmp["uuid"])
    a.appendChild(t)
    node.appendChild(a);
}
this.cryptWorker = new Worker('crypto-worker.js')


async function addUser(form){
    console.log("add")
    await fetch("http://127.0.0.1:8080/group", {
      method: "POST", 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: tmp["name"],
        id: form.uuid.value
      })
    }).then(res => {
      window.location.href = "./groups.html";
    });
}

async function removeUser(form){
    console.log("delete")
    await fetch("http://127.0.0.1:8080/group", {
      method: "DELETE", 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: tmp["name"],
        id: form.uuid.value,
      })
    }).then(res => {
        console.log(res)
      window.location.href = "./groups.html";
  });
}

async function getUsers(form){
    console.log("get")
    await fetch("http://127.0.0.1:8080/group", {
      method: "GET", 
      headers: {'Content-Type': 'application/json', 'name': tmp["name"]}
    }).then(data => data.json()).then(res => {
      console.log(res)
      let n = document.getElementById("members")
      for (var key in res) {
        // check if the property/key is defined in the object itself, not in parent
        if (res.hasOwnProperty(key)) {           
        let u = document.createTextNode(res[key] + " ")
        n.appendChild(u);
        }
    }
    });
    
}

async function post(form){
    console.log("post")

    let result = await this.getWebWorkerResponse('encrypt', form.cont.value)
    console.log(result)
    await fetch("http://127.0.0.1:8080/post", {
      method: "POST", 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: tmp["name"],
        message: result,
      })
    }).then(res => {
        console.log(res)
      window.location.href = "./home.html";
  });
}

async function myWall(){
    console.log("post")
    await fetch("http://127.0.0.1:8080/post", {
      method: "GET", 
      headers: {'Content-Type': 'application/json', 'name': tmp["name"]},
    }).then(data => data.json()).then(res => {
        console.log(res)
        localStorage.setItem("en", JSON.stringify(res))
    });
    let x = JSON.parse(localStorage.getItem("en"))
    let posts = localStorage.getItem("posts")
    if (posts == null){
        posts = {}
    } else {
        posts = JSON.parse(posts)
    }
    for (var key in x) {
        // check if the property/key is defined in the object itself, not in parent
        if (x.hasOwnProperty(key)) {           
            posts[new Date().getTime()*-1] = {
                message:await this.getWebWorkerResponse('decrypt', x[key]),
                name: key
            }
        }
    }

     var newObject = {};
     var keys = [];

    for (var key in posts) {
        keys.push(key);
    }
    let n = document.getElementById("wall")

    for (var i = keys.length - 1; i >= 0; i--) {
        let d = document.createElement("div") 
            let u = document.createTextNode(posts[keys[i]]["name"] + " says " + posts[keys[i]]["message"])
            d.appendChild(u)
            n.appendChild(d);
    }       

    localStorage.setItem("posts", JSON.stringify(posts))
}


function getWebWorkerResponse (messageType, messagePayload) {
    return new Promise((resolve, reject) => {
      // Generate a random message id to identify the corresponding event callback
      const messageId = Math.floor(Math.random() * 100000)
  
      // Post the message to the webworker
      if(messageType == "encrypt"){
        this.cryptWorker.postMessage([messageType, messageId].concat(messagePayload).concat( tmp["sKey"]))
      } else  {
      this.cryptWorker.postMessage([messageType, messageId].concat(messagePayload).concat( tmp["keys"]["priv"]))
    }
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