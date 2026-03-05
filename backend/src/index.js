const app = require('./app');
const config = require('./config');

const start = async () => {
    try {
        app.listen(config.port, () => {
            console.log(`Server is running on http://localhost:${config.port}`);
            console.log(`API: http://localhost:${config.port}/api`);
            console.log(`Mode: ${config.nodeEnv}`);
        });
    } catch (error) {
        console.error(`Server running error: ${error}`);
        process.exit(1);
    }
}

start();