const { server } = require('./service/server.js');

async function startApp() {
    try {
        server();
        console.log('Server started');
    } catch (error) {
        console.error('Error during app startup:', error);
        process.exit(1);
    }
}

startApp();
