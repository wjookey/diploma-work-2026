const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');
const cors = require('cors');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}
app.use('/api', routes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route is not found' });
});

app.use(errorHandler);

module.exports = app;