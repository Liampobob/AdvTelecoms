const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const routes = require('./routes/posts.js');
const app = express();

dotenv.config();

const port = process.env.PORT || 8080;

app.use(cors());

app.use(express.json());
app.use('/', routes);

app.listen(port, () => {
	console.log('AdvTelecoms Social Platform Server On ' + port);
});