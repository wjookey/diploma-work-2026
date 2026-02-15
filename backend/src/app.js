const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use('/api', routes);

// app.get('/', (req, res) => {
//     res.json({ message: "Hello I'm a GET request!" });
// });
// app.post('/', (req, res) => {
//     res.json({ message: "Hello I'm a POST request!" });
// });
// app.put('/', (req, res) => {
//     res.json({ message: "Hello I'm a PUT request!" });
// });
// app.delete('/', (req, res) => {
//     res.json({ message: "Hello I'm a DELETE request!" });
// });

module.exports = app;