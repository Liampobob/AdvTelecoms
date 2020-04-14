const express = require('express')
const app = express()

app.use(express.static(__dirname + '/src'))

app.get('/', (req, res) => {res.redirect(`/home.html`)})

app.listen(8000)
