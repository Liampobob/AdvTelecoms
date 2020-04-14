global.navigator = {appName: 'nodejs'}; // fake the navigator object
global.window = {}; // fake the window object
const JSEncrypt = require('jsencrypt').default;

let crypt = null
async function getKeys(){
    crypt = new JSEncrypt({default_key_size: 2056})
    return  {pub: await crypt.getPublicKey(), priv: await crypt.getPrivateKey()}
}

async function encrypt(key, message){
    crypt = new JSEncrypt({default_key_size: 2056})
    crypt.setKey(key)
    return crypt.encrypt(message)
}


function decrypt(key, message){
    crypt = new JSEncrypt({default_key_size: 2056})
    crypt.setKey(key)
    return crypt.decrypt(message)
}

module.exports.decrypt = decrypt
module.exports.encrypt = encrypt
module.exports.getKeys = getKeys