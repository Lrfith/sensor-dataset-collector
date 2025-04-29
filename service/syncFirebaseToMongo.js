// syncFirebaseToMongo.js

const admin = require('firebase-admin');
const { MongoClient } = require('mongodb');
const serviceAccount = require('../serviceAccountKey.json');

// เชื่อมต่อ Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://finalcpe495-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

// เชื่อมต่อ MongoDB Atlas
const mongoUri = "mongodb+srv://admin:1234@cluster0.jouxozz.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(mongoUri);

async function syncFirebaseToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    const database = client.db('sensor_database');
    const collection = database.collection('sensor_data');

    const dbRef = admin.database().ref('sensor/data');

    // ดึงข้อมูลจาก Firebase
    const snapshot = await dbRef.once('value');
    const sensorData = snapshot.val();

    if (sensorData) {
      try {
        await collection.insertOne(sensorData);
        console.log("New sensor data inserted:", sensorData);
      } catch (err) {
        console.error("Error inserting data:", err);
      }
    } else {
      console.log("No data found in Firebase.");
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

// เรียกใช้งานฟังก์ชันทุกๆ 10 นาที (600,000 ms)
setInterval(syncFirebaseToMongo, 10 * 60 * 1000);

// เรียกครั้งแรก
syncFirebaseToMongo();

// Export ไว้เผื่ออยากนำไปใช้ที่อื่น
module.exports = { syncFirebaseToMongo };
