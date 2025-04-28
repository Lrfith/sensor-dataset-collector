import { model_trainer } from './service/model_trainer.js';
import { start } from './service/server.js';
import { syncFirebaseToMongo } from './service/syncFirebaseToMongo.js';

async function startApp() {
    // เรียกใช้ฟังก์ชันแต่ละตัวที่เป็น async
    await model_trainer();
    await start();
    await syncFirebaseToMongo();
}

startApp();
