const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const geoip = require('geoip-lite');
const City = require('../models/cities');

router.get('/', async (req, res) => {
  const [lat, lon] = geoip.lookup(req.headers['x-real-ip'] || '77.153.156.39').ll;
  const data = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OWM_API_KEY}&units=metric`
  );
  res.json({ weather: await City.find(), currentPosWeather: processOpenWeatherData(await data.json()) });
});

router.post('/', (req, res) => {
  // Check if the city has not already been added
  City.findOne({ cityName: { $regex: new RegExp(req.body.cityName, 'i') } }).then((dbData) => {
    if (dbData === null) {
      // Request OpenWeatherMap API for weather data
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${req.body.cityName}&appid=${process.env.OWM_API_KEY}&units=metric`
      )
        .then((response) => response.json())
        .then((apiData) => {
          // Creates new document with weather data
          const newCity = new City({
            cityName: req.body.cityName,
            main: apiData.weather[0].main,
            description: apiData.weather[0].description,
            tempMin: apiData.main.temp_min,
            tempMax: apiData.main.temp_max,
          });

          // Finally save in database
          newCity.save().then((newDoc) => {
            res.json({ result: true, weather: newDoc });
          });
        });
    } else {
      // City already exists in database
      res.json({ result: false, error: 'City already saved' });
    }
  });
});

router.get('/:cityName', (req, res) => {
  City.findOne({ cityName: req.params.cityName }).then((data) => {
    if (data) {
      res.json({ result: true, weather: data });
    } else {
      res.json({ result: false, error: 'City not found' });
    }
  });
});

router.delete('/:cityName', (req, res) => {
  City.deleteOne({ cityName: req.params.cityName }).then((deletedDoc) => {
    if (deletedDoc.deletedCount > 0) {
      City.find().then((data) => {
        res.json({ result: true, weather: data });
      });
    } else {
      res.json({ result: false, error: 'City not found' });
    }
  });
});

function processOpenWeatherData({ weather, main, name }) {
  return {
    cityName: name,
    main: weather[0].main,
    description: weather[0].description,
    tempMin: main.temp_min,
    tempMax: main.temp_max,
  };
}

module.exports = router;
