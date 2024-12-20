import { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { useSelector } from 'react-redux';
import { getPrice } from '../store/interactions/interactions';
import { FaDrawPolygon, FaRegClock, FaChartLine, FaChartBar, FaChartArea } from 'react-icons/fa';
import { BsGraphUp } from 'react-icons/bs';
import moment from 'moment';
import ReactApexChart from 'react-apexcharts';

import '../css/PriceCharts.css';


const PriceCharts = () => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const swaps = useSelector(state => state.amm.swaps);
    const amm = useSelector(state => state.amm.contract);
    const provider = useSelector(state => state.provider.connection);
    
    // State for timeframe and indicators
    const [selectedIndicators, setSelectedIndicators] = useState({
        sma: true,
        volume: true
    });
    const [timeframe, setTimeframe] = useState(900); // 15m default
    const [chartType, setChartType] = useState('candlestick');
    const [isToolboxOpen, setIsToolboxOpen] = useState(false);

    const timeframes = [
        { value: 60, label: '1m' },
        { value: 300, label: '5m' },
        { value: 900, label: '15m' },
        { value: 3600, label: '1h' },
        { value: 14400, label: '4h' },
        { value: 86400, label: '1d' }
    ];

    const processSwapData = () => {
        if (!swaps || swaps.length === 0) return [];

        // Group swaps by timeframe
        const groupedData = new Map();

        swaps.forEach(swap => {
            const timestamp = moment(swap.timestamp).unix();
            const periodTimestamp = Math.floor(timestamp / timeframe) * timeframe;

            const price = Number(swap.tokenGetAmount) / Number(swap.tokenGiveAmount);
            const volume = Number(swap.tokenGiveAmount);

            if (!groupedData.has(periodTimestamp)) {
                groupedData.set(periodTimestamp, {
                    time: periodTimestamp,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                    volume: volume
                });
            } else {
                const candle = groupedData.get(periodTimestamp);
                candle.high = Math.max(candle.high, price);
                candle.low = Math.min(candle.low, price);
                candle.close = price;
                candle.volume += volume;
            }
        });

        // Convert to array and sort by timestamp
        return Array.from(groupedData.values()).sort((a, b) => a.time - b.time);
    };

    useEffect(() => {
        if (!chartContainerRef.current || !swaps || swaps.length === 0) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: 'solid', color: '#131722' },
                textColor: '#d1d4dc',
                fontSize: 12,
                fontFamily: "'Roboto', sans-serif"
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.5)' }
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    color: 'rgba(124, 58, 237, 0.4)',
                    width: 1,
                    style: 0,
                },
                horzLine: {
                    color: 'rgba(124, 58, 237, 0.4)',
                    width: 1,
                    style: 0,
                }
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: 'rgba(42, 46, 57, 0.5)',
                textColor: '#d1d4dc',
            },
            rightPriceScale: {
                borderColor: 'rgba(42, 46, 57, 0.5)',
                textColor: '#d1d4dc',
                autoScale: true,
                mode: 1, // Logarithmic scale
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2,
                },
                alignLabels: true,
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            localization: {
                priceFormatter: price => price.toFixed(8), // More decimal places for crypto
            }
        });

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
            priceFormat: {
                type: 'price',
                precision: 8,
                minMove: 0.00000001,
            },
        });

        const volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        // Process and set data
        const candleData = processSwapData();
        if (candleData.length > 0) {
            candlestickSeries.setData(candleData);
            volumeSeries.setData(candleData.map(d => ({
                time: d.time,
                value: d.volume,
                color: d.close >= d.open ? '#26a69a' : '#ef5350'
            })));
        }

        // Add legend
        const legend = document.createElement('div');
        legend.className = 'chart-legend';
        chartContainerRef.current.appendChild(legend);

        chart.subscribeCrosshairMove(param => {
            if (param.time) {
                const data = param.seriesData.get(candlestickSeries);
                if (data) {
                    const price = data.close;
                    const time = moment(param.time * 1000).format('MMM DD HH:mm');
                    const volume = param.seriesData.get(volumeSeries);
                    legend.innerHTML = `
                        <div class="legend-line">
                            <span class="legend-time">${time}</span>
                            <span class="legend-price">Price: $${price.toFixed(6)}</span>
                            ${volume ? `<span class="legend-volume">Vol: ${volume.value.toFixed(2)}</span>` : ''}
                        </div>
                    `;
                }
            }
        });

        // Cleanup
        return () => {
            chart.remove();
        };
    }, [swaps, timeframe, chartType]);

    const chartTypes = [
        { id: 'candlestick', icon: <FaChartBar />, label: 'Candlestick' },
        { id: 'line', icon: <FaChartLine />, label: 'Line' },
        { id: 'area', icon: <FaChartArea />, label: 'Area' }
    ];

    return (
        <div className="tradingview-container">
            <div className="trading-header">
                <div className="trading-toolbar">
                    <div className="toolbar-left">
                        <div className="chart-type-selector">
                            {chartTypes.map(type => (
                                <button
                                    key={type.id}
                                    className={`toolbar-button ${chartType === type.id ? 'active' : ''}`}
                                    onClick={() => setChartType(type.id)}
                                    title={type.label}
                                >
                                    {type.icon}
                                </button>
                            ))}
                        </div>

                        <div className="toolbar-separator" />

                        <button className="toolbar-button" onClick={() => setIsToolboxOpen(!isToolboxOpen)}>
                            <FaDrawPolygon />
                        </button>

                        {isToolboxOpen && (
                            <div className="toolbox-dropdown">
                                {/* Drawing tools will go here */}
                            </div>
                        )}
                    </div>

                    <div className="toolbar-center">
                        <div className="timeframe-selector">
                            {timeframes.map(tf => (
                                <button
                                    key={tf.value}
                                    className={`timeframe-button ${timeframe === tf.value ? 'active' : ''}`}
                                    onClick={() => setTimeframe(tf.value)}
                                >
                                    {tf.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="toolbar-right">
                        <div className="indicator-dropdown">
                            <button className="toolbar-button">
                                <BsGraphUp />
                            </button>
                            <div className="indicator-menu">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedIndicators.sma}
                                        onChange={e => setSelectedIndicators(prev => ({
                                            ...prev,
                                            sma: e.target.checked
                                        }))}
                                    />
                                    SMA
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedIndicators.volume}
                                        onChange={e => setSelectedIndicators(prev => ({
                                            ...prev,
                                            volume: e.target.checked
                                        }))}
                                    />
                                    Volume
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div ref={chartContainerRef} className="chart" />
        </div>
    );
};

// const PriceCharts = () => {
//     const swaps = useSelector(state => state.amm.swaps);
//     const amm = useSelector(state => state.amm.contract);
//     const [timeframe, setTimeframe] = useState(900); // 15m default
//     const [series, setSeries] = useState([]);

//     useEffect(() => {
//         if (!swaps || !amm) return;

//         const groupedData = new Map();
        
//         swaps.forEach(swap => {
//             const timestamp = moment(swap.timestamp * 1000).unix();
//             const periodTimestamp = Math.floor(timestamp / timeframe) * timeframe;
            
//             // Calculate price using AMM token balance ratio
//             const price = Number(amm.token1Balance) / Number(amm.token2Balance);
//             const volume = Number(swap.tokenGiveAmount);

//             if (!groupedData.has(periodTimestamp)) {
//                 groupedData.set(periodTimestamp, {
//                     x: new Date(periodTimestamp * 1000),
//                     y: [price, price, price, price], // open, high, low, close
//                     volume: volume
//                 });
//             } else {
//                 const candle = groupedData.get(periodTimestamp);
//                 candle.y[1] = Math.max(candle.y[1], price); // high
//                 candle.y[2] = Math.min(candle.y[2], price); // low
//                 candle.y[3] = price; // close
//                 candle.volume += volume;
//             }
//         });

//         const candleData = Array.from(groupedData.values())
//             .sort((a, b) => a.x - b.x);

//         setSeries([{
//             name: 'candles',
//             data: candleData
//         }]);
//     }, [swaps, timeframe, amm]);

//     const options = {
//         chart: {
//             type: 'candlestick',
//             height: 600,
//             background: '#131722',
//             foreColor: '#d1d4dc',
//             animations: {
//                 enabled: false
//             },
//             toolbar: {
//                 show: true,
//                 tools: {
//                     download: false,
//                     selection: true,
//                     zoom: true,
//                     zoomin: true,
//                     zoomout: true,
//                     pan: true,
//                     reset: true
//                 }
//             }
//         },
//         grid: {
//             borderColor: '#1e222d',
//             strokeDashArray: 0
//         },
//         plotOptions: {
//             candlestick: {
//                 colors: {
//                     upward: '#26a69a',
//                     downward: '#ef5350'
//                 },
//                 wick: {
//                     useFillColor: true,
//                 }
//             }
//         },
//         xaxis: {
//             type: 'datetime',
//             labels: {
//                 style: {
//                     colors: '#d1d4dc'
//                 }
//             },
//             axisBorder: {
//                 color: '#1e222d'
//             },
//             axisTicks: {
//                 color: '#1e222d'
//             }
//         },
//         yaxis: {
//             decimalsInFloat: 8,
//             labels: {
//                 style: {
//                     colors: '#d1d4dc'
//                 },
//                 formatter: (value) => value.toFixed(8)
//             },
//             tooltip: {
//                 enabled: true
//             }
//         },
//         tooltip: {
//             theme: 'dark',
//             custom: ({ seriesIndex, dataPointIndex, w }) => {
//                 const o = w.globals.seriesCandleO[seriesIndex][dataPointIndex];
//                 const h = w.globals.seriesCandleH[seriesIndex][dataPointIndex];
//                 const l = w.globals.seriesCandleL[seriesIndex][dataPointIndex];
//                 const c = w.globals.seriesCandleC[seriesIndex][dataPointIndex];
                
//                 return `
//                     <div class="apexcharts-tooltip-box">
//                         <div>O: ${o.toFixed(8)}</div>
//                         <div>H: ${h.toFixed(8)}</div>
//                         <div>L: ${l.toFixed(8)}</div>
//                         <div>C: ${c.toFixed(8)}</div>
//                     </div>
//                 `;
//             }
//         }
//     };

//     return (
//         <div className="tradingview-container">
//             <div className="trading-header">
//                 <div className="timeframe-selector">
//                     {[
//                         { value: 60, label: '1m' },
//                         { value: 300, label: '5m' },
//                         { value: 900, label: '15m' },
//                         { value: 3600, label: '1h' },
//                         { value: 14400, label: '4h' },
//                         { value: 86400, label: '1d' }
//                     ].map(tf => (
//                         <button
//                             key={tf.value}
//                             className={`timeframe-button ${timeframe === tf.value ? 'active' : ''}`}
//                             onClick={() => setTimeframe(tf.value)}
//                         >
//                             {tf.label}
//                         </button>
//                     ))}
//                 </div>
//             </div>
//             <ReactApexChart
//                 options={options}
//                 series={series}
//                 type="candlestick"
//                 height={600}
//             />
//         </div>
//     );
// };

export default PriceCharts;
