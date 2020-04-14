self.window = self // This is required for the jsencrypt library to work within the web worker

// Import the jsencrypt library
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/2.3.1/jsencrypt.min.js');

let crypt = null
// let privateKey = null

/** Webworker onmessage listener */
onmessage = function(e) {
  const [ messageType, messageId, text, key ] = e.data
  let result
  switch (messageType) {
    case 'generate-keys':
      result = generateKeypair()
      break
    case 'encrypt':
      result = encrypt(text, key)
      break
    case 'decrypt':
      result = decrypt(text, key)
      break
  }

  // Return result to the UI thread
  postMessage([ messageId, result ])
}

/** Generate and store keypair */
function generateKeypair () {
  crypt = new JSEncrypt({default_key_size: 2056})
//   privateKey = crypt.getPrivateKey()

  // Only return the public key, keep the private key hidden
  return {pub:crypt.getPublicKey(), priv:crypt.getPrivateKey()}
}

/** Encrypt the provided string with the destination public key */
function encrypt (content, publicKey) {
  crypt = new JSEncrypt({default_key_size: 2056})
  crypt.setKey(publicKey)
  let r = crypt.encrypt(content)
  // console.log(r)
  return r
}

/** Decrypt the provided string with the local private key */
function decrypt (content, privateKey) {
  console.log(content)
  console.log(privateKey)
  crypt = new JSEncrypt({default_key_size: 2056})
  crypt.setKey(privateKey)
  let r = crypt.decrypt(content)
  console.log(r)
  return r;
}