const API_KEY = '7031fa38cf9a51b74cac2915b83e07d4';

async function getWeather() {
    const city = document.getElementById('city').value;
    const date = document.getElementById('date').value;
    const weatherInfo = document.getElementById('weatherInfo');

    if (!city || !date) {
        alert('請輸入城市名稱和日期');
        return;
    }

    try {
        // 獲取城市的地理座標
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            throw new Error('找不到該城市');
        }

        const { lat, lon } = geoData[0];

        // 獲取天氣數據
        const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=zh_tw`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        // 找到最接近選擇日期的天氣數據
        const targetDate = new Date(date);
        const weatherList = weatherData.list;
        const closestWeather = weatherList.reduce((closest, current) => {
            const currentDate = new Date(current.dt * 1000);
            const closestDate = new Date(closest.dt * 1000);
            return Math.abs(currentDate - targetDate) < Math.abs(closestDate - targetDate) ? current : closest;
        });

        // 顯示天氣資訊
        const weather = closestWeather.weather[0];
        const main = closestWeather.main;
        
        weatherInfo.innerHTML = `
            <div class="weather-card">
                <h2>${city}</h2>
                <p>日期：${new Date(closestWeather.dt * 1000).toLocaleDateString()}</p>
                <p>天氣：${weather.description}</p>
                <p>溫度：${Math.round(main.temp)}°C</p>
                <p>體感溫度：${Math.round(main.feels_like)}°C</p>
                <p>濕度：${main.humidity}%</p>
                <p>風速：${closestWeather.wind.speed} m/s</p>
            </div>
        `;
        weatherInfo.classList.add('active');

    } catch (error) {
        alert(error.message || '獲取天氣資訊時發生錯誤');
    }
}
