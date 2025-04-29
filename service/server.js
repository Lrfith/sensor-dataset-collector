// server.js (Backend)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// server function
async function server() {
    const app = express();
    app.use(cors());
    
    // MongoDB connection URI
    const mongoUri = "mongodb+srv://admin:1234@cluster0.jouxozz.mongodb.net/sensor_database?retryWrites=true&w=majority";
    
    // Connect to MongoDB
    mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log('Connected to MongoDB'))
      .catch(err => console.log('MongoDB connection error:', err));
    
    // Define a Mongoose schema and model for the 'predict' collection
    const weatherSchema = new mongoose.Schema({
      time: String,
      status: String,
      predicted_temperature: Number,
    });
    
    const Weather = mongoose.model('Weather', weatherSchema, 'predict');  // 'predict' is the collection name
    
    // API endpoint to fetch data from the 'predict' collection
    app.get('/weather', async (req, res) => {
        try {
            const latestWeather = await Weather.findOne().sort({ _id: -1 });
            if (latestWeather) {
              latestWeather.predicted_temperature = parseFloat(latestWeather.predicted_temperature.toFixed(2));
            }
            res.json(latestWeather);
            
        } catch (err) {
          res.status(500).send('Error fetching weather data');
        }
      });
      
    
    // Start the server
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
}

module.exports = { server };
