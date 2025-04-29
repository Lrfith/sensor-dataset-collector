// server.js (Backend)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 7000;

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(cors());

// MongoDB connection URI
const mongoUri = "mongodb+srv://admin:1234@cluster0.jouxozz.mongodb.net/sensor_database?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000  // Increase timeout to 30 seconds
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.log('MongoDB connection error:', err);
        process.exit(1);
    });

// Define a Mongoose schema and model for the 'predict' collection
const weatherSchema = new mongoose.Schema({
    time: String,
    status: String,
    predicted_temperature: Number,
});

const Weather = mongoose.model('Weather', weatherSchema, 'predict');  // 'predict' is the collection name

// Root endpoint
app.get('/', (req, res) => {
    console.log("/weather for get data.");
    res.send('/weather API is working.');
});

// API endpoint to fetch data from the 'predict' collection
app.get('/weather', async (req, res) => {
    try {
        const latestWeather = await Weather.findOne().sort({ _id: -1 });
        if (latestWeather) {
            latestWeather.predicted_temperature = parseFloat(latestWeather.predicted_temperature.toFixed(2));
        }
        res.json(latestWeather);
    } catch (err) {
        console.error('Error fetching weather data:', err);  // Log the error to the console
        res.status(500).json({ error: 'Error fetching weather data', details: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// If you plan to export the server for testing, you can use:
module.exports = app;
