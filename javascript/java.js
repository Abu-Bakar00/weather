

// Функция для обращения к API погоды
async function fetchWeather(location) {
    try {
        const apiKey = '7b98526408b27d0e6f7b88d4fb4d915e'; // Вставьте ваш API ключ
        // Получение текущей погоды
        const currentWeatherResponse = await fetch (`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
        const currentData = await currentWeatherResponse.json();

        // Получение прогноза погоды на 5 дней
        const forecastResponse = await fetch (`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`);
        const forecastData = await forecastResponse.json();

        return {
            current: processCurrentWeatherData(currentData),
            forecast: processForecastData(forecastData)
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Функция для обработки текущих данных погоды
function processCurrentWeatherData(data) {
    return {
        description: data.weather[0].description,
        temperature: data.main.temp,
        icon: data.weather[0].icon
    };
}

// Функция для обработки данных прогноза погоды
function processForecastData(data) {
    const dailyData = {};

    data.list.forEach(entry => {
        const date = new Date(entry.dt_txt);
        const day = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

        if (!dailyData[day]) {
            dailyData[day] = {
                temp: entry.main.temp,
                icon: entry.weather[0].icon,
                description: entry.weather[0].description
            };
        }
    });

    // Преобразуем объект в массив и ограничим 5 днями
    return Object.keys(dailyData).slice(0, 5).map(day => ({
        day,
        ...dailyData[day]
    }));
}

// Функция для отображения текущей погоды на странице
function displayCurrentWeather(weather) {
    document.getElementById('weather-description').innerText = `Description: ${capitalizeFirstLetter(weather.description)}`;
    document.getElementById('weather-temperature').innerText = `Temperature: ${weather.temperature} °C`;
    document.getElementById('current-icon').src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
    document.getElementById('weather-info').classList.remove('hidden');
}

// Функция для отображения прогноза погоды на странице
function displayForecast(forecast) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = ''; // Очистка предыдущих данных

    forecast.forEach(dayForecast => {
        const forecastDiv = document.createElement('div');
        forecastDiv.classList.add('forecast-day');

        forecastDiv.innerHTML = `
            <h3>${dayForecast.day}</h3>
            <img src="https://openweathermap.org/img/wn/${dayForecast.icon}@2x.png" alt="Weather Icon">
            <p>${capitalizeFirstLetter(dayForecast.description)}</p>
            <p>${dayForecast.temperature} °C</p>
        `;

        forecastContainer.appendChild(forecastDiv);
    });

    document.getElementById('forecast-info').classList.remove('hidden');
}

// Функция для отображения данных на странице
function displayWeatherInfo(weatherData) {
    displayCurrentWeather(weatherData.current);
    displayForecast(weatherData.forecast);
}

// Функция для капитализации первой буквы строки
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Форма для ввода местоположения
const form = document.getElementById('location-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const location = document.getElementById('location-input').value.trim();
    if (!location) return;

    // Отображение компонента загрузки
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('weather-info').classList.add('hidden');
    document.getElementById('forecast-info').classList.add('hidden');

    // Получение и обработка данных погоды
    const weatherData = await fetchWeather(location);

    // Скрытие компонента загрузки и отображение информации о погоде
    document.getElementById('loading').classList.add('hidden');
    if (weatherData && weatherData.current && weatherData.forecast) {
        displayWeatherInfo(weatherData);
    } else {
        alert('Could not fetch weather data. Please try again.');
    }
});
