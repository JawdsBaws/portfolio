// Chart.js default configuration
Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
Chart.defaults.font.family = "'Arial', sans-serif";
Chart.defaults.elements.line.borderWidth = 2;
Chart.defaults.elements.point.radius = 0;
Chart.defaults.elements.point.hoverRadius = 4;

// API Configuration
const FINNHUB_API_KEY = 'cukdf51r01qo08i81m4gcukdf51r01qo08i81m50';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Market Data State
const marketData = {
    timeRange: '1d',
    charts: new Map(),
    prices: new Map()
};

// Time Range Mapping
const timeRangeMap = {
    '1d': { interval: '5', days: 1 },
    '1w': { interval: '15', days: 7 },
    '1m': { interval: '60', days: 30 },
    '3m': { interval: 'D', days: 90 },
    '1y': { interval: 'W', days: 365 }
};

// Initialize Charts
function initializeCharts() {
    document.querySelectorAll('.price-chart canvas').forEach(canvas => {
        const symbol = canvas.closest('.price-card').dataset.symbol;
        const ctx = canvas.getContext('2d');
        
        marketData.charts.set(symbol, new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                return `$${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: true,
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        }
                    }
                }
            }
        }));
    });
}

// Mock Stock Data (for development)
function generateMockStockData(symbol, range) {
    const { days } = timeRangeMap[range];
    const dataPoints = days * 24; // hourly data points
    const data = {
        c: [], // closing prices
        t: [], // timestamps
    };

    // Generate base price based on symbol
    let basePrice;
    switch(symbol) {
        case 'SPY': basePrice = 475.50; break;
        case 'VOO': basePrice = 435.75; break;
        case 'IVV': basePrice = 480.25; break;
        case 'VTI': basePrice = 240.80; break;
        case 'QQQ': basePrice = 420.30; break;
        default: basePrice = 100.00;
    }

    // Generate data points
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < dataPoints; i++) {
        // Add some random variation (-0.5% to +0.5%)
        const variation = (Math.random() - 0.5) * 0.01;
        const price = basePrice * (1 + variation);
        data.c.push(price);
        data.t.push(now - ((dataPoints - i) * 3600)); // hourly timestamps
    }

    return data;
}

// Fetch Stock Data
async function fetchStockData(symbol, range) {
    // Use mock data instead of API calls
    return generateMockStockData(symbol, range);
}

// Fetch Crypto Data
async function fetchCryptoData(symbol, range) {
    const days = timeRangeMap[range].days;
    try {
        const response = await fetch(
            `${COINGECKO_API}/coins/${symbol.toLowerCase()}/market_chart?vs_currency=usd&days=${days}&interval=daily`
        );
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${symbol} data:`, error);
        return null;
    }
}

// Update Chart
function updateChart(symbol, data, labels) {
    const chart = marketData.charts.get(symbol);
    if (!chart) return;

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update('none');
}

// Update Price Display
function updatePriceDisplay(symbol, price, change = null) {
    const card = document.querySelector(`.price-card[data-symbol="${symbol}"]`);
    if (!card) return;

    const priceElement = card.querySelector('.price');
    priceElement.textContent = `$${price.toFixed(2)}`;

    if (change !== null) {
        const changeElement = card.querySelector('.price-change') || document.createElement('span');
        changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
        changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        
        if (!card.querySelector('.price-change')) {
            priceElement.appendChild(changeElement);
        }
    }
}

// Load Market Data
async function loadMarketData() {
    const stockSymbols = ['SPY', 'VOO', 'IVV', 'VTI', 'QQQ'];
    const cryptoSymbols = ['bitcoin', 'ethereum'];

    // Load stock data
    for (const symbol of stockSymbols) {
        const data = await fetchStockData(symbol, marketData.timeRange);
        if (data && data.c) {
            const prices = data.c;
            const timestamps = data.t.map(t => new Date(t * 1000));
            updateChart(symbol, prices, timestamps);
            updatePriceDisplay(symbol, prices[prices.length - 1], 
                ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100);
        }
    }

    // Load crypto data
    for (const symbol of cryptoSymbols) {
        const data = await fetchCryptoData(symbol, marketData.timeRange);
        if (data && data.prices) {
            const prices = data.prices.map(p => p[1]);
            const timestamps = data.prices.map(p => new Date(p[0]));
            const displaySymbol = symbol === 'bitcoin' ? 'BTC' : 'ETH';
            updateChart(displaySymbol, prices, timestamps);
            updatePriceDisplay(displaySymbol, prices[prices.length - 1],
                ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100);
        }
    }
}

// Handle Time Range Selection
function handleTimeRangeChange(event) {
    const newRange = event.target.dataset.range;
    if (!newRange || newRange === marketData.timeRange) return;

    // Update active state
    document.querySelectorAll('.time-range').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.range === newRange);
    });

    marketData.timeRange = newRange;
    loadMarketData();
}

// Theme handling
function initializeTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.dataset.theme = savedTheme;
        updateThemeIcon(savedTheme === 'dark');
    } else if (prefersDarkScheme.matches) {
        document.documentElement.dataset.theme = 'dark';
        updateThemeIcon(true);
    }
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme === 'dark');
    });
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.dataset.theme = newTheme;
            updateThemeIcon(e.matches);
        }
    });
}

function updateThemeIcon(isDark) {
    const themeToggle = document.querySelector('.theme-toggle');
    if (isDark) {
        themeToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        `;
    } else {
        themeToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
        `;
    }
}

// Loading handler
function handlePageLoad() {
    const loading = document.querySelector('.loading');
    const content = document.querySelector('.content');
    
    // Hide loading spinner after all content is loaded
    window.addEventListener('load', () => {
        // Ensure minimum loading time of 500ms for visual effect
        setTimeout(() => {
            loading.classList.add('hidden');
            content.classList.add('visible');
        }, 500);
    });
    
    // If content loads too quickly, still show loading animation
    setTimeout(() => {
        if (!loading.classList.contains('hidden')) {
            loading.classList.add('hidden');
            content.classList.add('visible');
        }
    }, 2000);
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Initialize loading handler
    handlePageLoad();

    // Initialize theme
    initializeTheme();
    
    // Initialize charts
    initializeCharts();
    
    // Set up time range controls
    document.querySelectorAll('.time-range').forEach(button => {
        button.addEventListener('click', handleTimeRangeChange);
    });

    // Load initial data
    loadMarketData();

    // Refresh data periodically (every minute)
    setInterval(loadMarketData, 60000);

    // Update charts on theme change
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                Chart.defaults.color = getComputedStyle(document.documentElement)
                    .getPropertyValue('--text-primary');
                marketData.charts.forEach(chart => {
                    chart.options.scales.y.grid.color = getComputedStyle(document.documentElement)
                        .getPropertyValue('--border-color');
                    chart.data.datasets[0].borderColor = getComputedStyle(document.documentElement)
                        .getPropertyValue('--accent-color');
                    chart.update();
                });
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
});
