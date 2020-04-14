const router = require('express').Router();
const {getKeys, encrypt, decrypt} = require('./encrypter.js');
let publicKey=null;
let privateKey=null;
let users = {};
let uids = {};



router.post('/user', async (req, res) => {
	if(publicKey == undefined){
		const keys = await getKeys()
		publicKey = keys['pub']
		privateKey = keys['priv']
	}

	try {
		console.log(req.body)
		let id = req.body.uuid;
		let uname = req.body.name;
		let key = req.body.key;
		
		users[uname] = {
			id: id,
			name: uname,
			key: key,
			group: {},
			posts: {}
		}

		users[uname]["group"][id] = id

		uids[id] = uname

		console.log("new user " + users[uname]["name"])
		console.log(publicKey)

		res.status(200).send({key: publicKey});
	} catch (err) {
		console.log(err)
		res.status(400).send({ error: err });
	}
});

router.get('/group', async (req, res) => {
	try {
		let uname = req.headers["name"];
		console.log(uname)
		let resp = {}
		console.log(users)
		console.log(uids)
		for (var key in users[uname]["group"]) {
			console.log("1")
			// check if the property/key is defined in the object itself, not in parent
			if (users[uname]["group"].hasOwnProperty(key)) {           
				console.log(key)
				let aname = uids[key];
				console.log(aname)
				resp[key]= aname;
			}
		}

		res.status(200)
		res.send(resp)
	} catch (err) {
		console.log(err)
		res.status(400).send({ error: err });
	}
});

router.post('/group', async (req, res) => {
	try {
		let name = req.body.name;
		let uid = req.body.id;
		console.log(req.body)

		users[name]["group"][uid] = uid;

		res.sendStatus(200)
	} catch (err) {
		console.log(err)
		res.status(400).send({ error: err });
	}
});

router.delete('/group', async (req, res) => {
	try {
		let name = req.body.name;
		let uid = req.body.id;
		console.log(uid)
		console.log(users[name]["group"])
		delete users[name]["group"][uid];
		console.log(users[name]["group"])

		res.sendStatus(200)
	} catch (err) {
		console.log(err)
		res.status(400).send({ error: err });
	}
});


router.post('/post', async (req, res) => {
	try {
		console.log(req.body)
		let uname = req.body.name;
		let message = req.body.message;
		console.log(message)
		for (var key in users[uname]["group"]) {
			// check if the property/key is defined in the object itself, not in parent
			if (users[uname]["group"].hasOwnProperty(key)) {           
				let aname = uids[key];
				users[aname]["posts"][uname] = message;
			}
		}

		res.sendStatus(200)
	} catch (err) {
		console.log(err)
		res.status(400).send({ error: err });
	}
});

router.get('/post', async (req, res) => {
	try {
		let uname = req.headers.name;
		console.log(users)
		let resp = {}

		for (var key in users[uname]["posts"]) {
			// check if the property/key is defined in the object itself, not in parent
			if (users[uname]["posts"].hasOwnProperty(key)) {   
				let message = await decrypt(privateKey, users[uname]["posts"][key])        
				resp[key] = await encrypt(users[uname].key, message)
			}
		}
		
		users[uname]["posts"] = {}

		console.log(resp)
		res.status(200).send(resp)
	} catch (err) {
		console.log(err)
		res.status(400).send({ error: err });
	}
});

module.exports = router;