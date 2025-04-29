// model_trainer.js

const { MongoClient } = require('mongodb');
const { RandomForestRegression } = require('ml-random-forest');

// MongoDB connection URI
const mongoUri = "mongodb+srv://admin:1234@cluster0.jouxozz.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(mongoUri);

async function fetchDataAndCleanse() {
  try {
    await client.connect();
    const database = client.db('sensor_database');
    const collection = database.collection('sensor_data');

    // ดึงข้อมูลหลายแถวจาก MongoDB
    const sensorDataList = await collection.find({}).sort({_id: -1}).limit(12).toArray();

    if (sensorDataList.length === 0) {
      console.log('No data found.');
      return;
    }

    // เตรียมข้อมูลสำหรับฝึก
    const X = []; // features
    const y = []; // target (เช่น temperature)
    let validDataCount = 0;

    // ตรวจสอบและแปลงข้อมูล
    sensorDataList.forEach(doc => {
      const timestamp = doc.timestamp ? new Date(doc.timestamp.replace(' ', 'T')) : null;

      // ตรวจสอบค่า missing หรือ invalid
      if (doc.humidity !== undefined && doc.thermal_avg !== undefined && doc.temperature !== undefined && timestamp) {
        // ตรวจสอบว่า timestamp ไม่เป็นค่าผิดปกติ
        if (isNaN(timestamp.getTime())) {
          console.log("Invalid timestamp:", doc.timestamp);
          return;
        }

        // เพิ่มข้อมูลที่ผ่านการตรวจสอบ
        X.push([
          parseFloat(doc.humidity),         // humidity
          parseFloat(doc.thermal_avg),      // thermal_avg
          timestamp.getTime()               // timestamp (converted to milliseconds)
        ]);
        y.push(parseFloat(doc.temperature)); // target: temperature
        validDataCount++;
      } else {
        console.log("Missing data in document:", doc);
      }
    });

    console.log("Cleaned data size:", validDataCount);

    // หากมีข้อมูลที่ผ่านการทำความสะอาด
    if (X.length > 0) {
      return { X, y };
    } else {
      console.log("No valid data to use.");
      return null;
    }

  } catch (error) {
    console.error('Error fetching or cleansing data:', error);
  } finally {
    await client.close();
  }
}

async function savePredictionToMongo(prediction, actual, inputData) {
  try {
    await client.connect();
    const database = client.db('sensor_database');
    const collection = database.collection('predict');

    // บันทึกข้อมูลทำนายเข้าไปใน MongoDB
    const predictionData = {
      input: inputData,
      predicted_temperature: prediction,
      actual_temperature: actual,
      timestamp: new Date(),
    };

    await collection.insertOne(predictionData);
    console.log("Prediction saved to MongoDB:", predictionData);

  } catch (error) {
    console.error('Error saving prediction:', error);
  } finally {
    await client.close();
  }
}

async function model_trainer() {
  const cleanedData = await fetchDataAndCleanse();

  if (cleanedData) {
    const { X, y } = cleanedData;

    // สร้างโมเดล RandomForest
    const options = {
      seed: 3,
      maxFeatures: 1.0,
      replacement: true,
      nEstimators: 100
    };
    const regression = new RandomForestRegression(options);

    // ฝึกโมเดล
    regression.train(X, y);
    console.log("Random Forest Model trained!");

    // ทดลองพยากรณ์ (ใช้ตัวอย่างแรก)
    const predictInput = [X[0]]; // [humidity, thermal_avg, timestamp]
    const predicted = regression.predict(predictInput);

    console.log("Actual temperature:", y[0]);
    console.log("Predicted temperature:", predicted[0]);

    // บันทึกผลการทำนายไปยัง MongoDB
    await savePredictionToMongo(predicted[0], y[0], predictInput[0]);
  }
}

// Run model_trainer immediately and every 10 minutes
model_trainer();
setInterval(model_trainer, 600000); // 600,000 ms = 10 minutes

module.exports = { model_trainer };
