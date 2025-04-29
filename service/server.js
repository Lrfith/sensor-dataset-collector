function server() {
    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');

    const app = express();
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    })
    app.use(cors());

    const mongoUri = "mongodb+srv://admin:1234@cluster0.jouxozz.mongodb.net/sensor_database?retryWrites=true&w=majority";

    mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected to MongoDB'))
        .catch((err) => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        });

    const weatherSchema = new mongoose.Schema({
        time: String,
        status: String,
        predicted_temperature: Number,
    });

    const Weather = mongoose.model('Weather', weatherSchema, 'predict');

    app.get('/weather', async (req, res) => {
        try {
            const latestWeather = await Weather.findOne().sort({ _id: -1 });
            if (latestWeather) {
                latestWeather.predicted_temperature = parseFloat(latestWeather.predicted_temperature.toFixed(2));
            }
            res.json(latestWeather);
        } catch (err) {
            console.error('Error fetching weather data:', err);
            res.status(500).send('Error fetching weather data');
        }
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = { server };
