
// 請替換為您的 OpenWeatherMap API 密鑰
const API_KEY = '7031fa38cf9a51b74cac2915b83e07d4';

async function getWeather() {
    const city = document.getElementById('city').value;
    const date = document.getElementById('date').value;
    const weatherInfo = document.getElementById('weather-info');

    if (!city || !date) {
        alert('請輸入城市名稱（英文）和日期');
        return;
    }

    try {
        // 獲取城市的地理坐標
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            throw new Error('找不到該城市');
        }

        const { lat, lon } = geoData[0];

        // 獲取天氣數據
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=zh_tw`);
        const weatherData = await weatherResponse.json();

        // 顯示天氣信息
        weatherInfo.innerHTML = `
            <h2>${city}的天氣</h2>
            <p>日期：${date}</p>
            <p>溫度：${Math.round(weatherData.main.temp)}°C</p>
            <p>天氣：${weatherData.weather[0].description}</p>
            <p>濕度：${weatherData.main.humidity}%</p>
            <p>風速：${weatherData.wind.speed} m/s</p>
        `;
        weatherInfo.classList.add('show');
    } catch (error) {
        alert('獲取天氣信息時出錯：' + error.message);
    }
}
