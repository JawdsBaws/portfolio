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

// Fetch Stock Data
async function fetchStockData(symbol, range) {
    if (!FINNHUB_API_KEY) {
        console.error('Finnhub API key not configured');
        return null;
    }

    const { interval, days } = timeRangeMap[range];
    const to = Math.floor(Date.now() / 1000);
    const from = to - (days * 24 * 60 * 60);

    try {
        const response = await fetch(
            `https://api.finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${interval}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
        );
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${symbol} data:`, error);
        return null;
    }
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

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
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
