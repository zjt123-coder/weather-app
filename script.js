// API 密鑰
const API_KEY = '7031fa38cf9a51b74cac2915b83e07d4';

// 獲取 DOM 元素
const cityInput = document.getElementById('city');
const dateInput = document.getElementById('date');
const weatherInfo = document.getElementById('weather-info');
const searchBtn = document.querySelector('.search-btn');

// 設置默認日期為今天
dateInput.valueAsDate = new Date();

// 添加輸入驗證
cityInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
});

// 添加錯誤處理函數
function showError(message) {
    weatherInfo.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            ${message}
        </div>
    `;
    weatherInfo.classList.add('show');
}

// 添加加載狀態
function setLoading(isLoading) {
    if (isLoading) {
        searchBtn.innerHTML = '<span class="loading"></span> 查詢中...';
        searchBtn.disabled = true;
    } else {
        searchBtn.innerHTML = '<i class="fas fa-search"></i> 查詢天氣';
        searchBtn.disabled = false;
    }
}

// 格式化日期
function formatDate(date) {
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

// 獲取天氣數據
async function getWeather() {
    const city = cityInput.value.trim();
    const date = dateInput.value;

    // 清除之前的錯誤狀態
    cityInput.classList.remove('error');
    weatherInfo.classList.remove('show');

    // 驗證輸入
    if (!city) {
        cityInput.classList.add('error');
        showError('請輸入城市名稱');
        return;
    }

    if (!date) {
        showError('請選擇日期');
        return;
    }

    // 檢查選擇的日期
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // 計算日期差
    const diffTime = selectedDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 檢查是否在預報範圍內（5天）
    if (diffDays < 0) {
        showError('抱歉，無法查詢過去的天氣數據');
        return;
    }
    if (diffDays > 5) {
        showError('抱歉，目前只能查詢未來5天的天氣預報');
        return;
    }

    try {
        setLoading(true);

        // 獲取城市的地理坐標
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            throw new Error('找不到該城市，請確認城市名稱是否正確');
        }

        const { lat, lon } = geoData[0];

        // 獲取5天預報數據
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=zh_tw`
        );

        if (!forecastResponse.ok) {
            throw new Error('獲取天氣數據失敗，請稍後再試');
        }

        const forecastData = await forecastResponse.json();
        
        // 找到最接近選擇日期的預報數據
        const targetDate = new Date(date);
        targetDate.setHours(12, 0, 0, 0); // 設置為中午12點
        
        const forecast = forecastData.list.find(item => {
            const itemDate = new Date(item.dt * 1000);
            return itemDate.getDate() === targetDate.getDate() &&
                   itemDate.getMonth() === targetDate.getMonth() &&
                   itemDate.getFullYear() === targetDate.getFullYear();
        });

        if (!forecast) {
            throw new Error('無法獲取該日期的天氣預報');
        }

        // 顯示天氣信息
        weatherInfo.innerHTML = `
            <h2><i class="fas fa-map-marker-alt"></i> ${city}</h2>
            <p><i class="fas fa-calendar"></i> ${formatDate(new Date(date))}</p>
            <p><i class="fas fa-temperature-high"></i> 溫度：${Math.round(forecast.main.temp)}°C</p>
            <p><i class="fas fa-cloud"></i> 天氣狀況：${forecast.weather[0].description}</p>
            <p><i class="fas fa-temperature-low"></i> 最低溫度：${Math.round(forecast.main.temp_min)}°C</p>
            <p><i class="fas fa-temperature-high"></i> 最高溫度：${Math.round(forecast.main.temp_max)}°C</p>
            <p><i class="fas fa-tint"></i> 濕度：${forecast.main.humidity}%</p>
            <p><i class="fas fa-wind"></i> 風速：${forecast.wind.speed} m/s</p>
            <div class="note">
                <i class="fas fa-info-circle"></i> 
                ${diffDays === 0 ? '這是今天的實時天氣數據' : '這是天氣預報數據'}
            </div>
        `;
        weatherInfo.classList.add('show');

    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

// 添加鍵盤事件支持
cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// 添加錯誤處理
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showError('發生錯誤，請稍後再試');
    setLoading(false);
});
