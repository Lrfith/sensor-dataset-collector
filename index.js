const { model_trainer } = require('./service/model_trainer.js');
const { server } = require('./service/server.js');
const { syncFirebaseToMongo } = require('./service/syncFirebaseToMongo.js');

async function startApp() {
    try {
        // เรียกใช้ฟังก์ชันแต่ละตัวที่เป็น async
        await model_trainer();
        console.log('Model Trainer completed');
        
        await server();
        console.log('Server started');
        
        await syncFirebaseToMongo();
        console.log('Firebase to Mongo sync completed');
    } catch (error) {
        console.error('Error during app startup:', error);
        process.exit(1);  // Exit the process with a failure code
    }
}

startApp();
