import { useRef, useEffect } from 'react';
import * as s from './StatisticsPage.css.ts';
import type { StatSeries } from '../../models/statistics/statistics.ts';

const StatisticsPage = () => {
  // Canvas references for each graph
  const damageCanvasRef = useRef<HTMLCanvasElement>(null);
  const goldCanvasRef = useRef<HTMLCanvasElement>(null);
  const accuracyCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Example statistics data (in a real app, this would come from game state)
  const statistics = {
    damage: {
      average: 245,
      highest: 1250,
      total: 12500,
      series: [
        {
          id: 'avg_damage',
          name: 'Average Damage',
          color: '#e74c3c',
          data: Array.from({ length: 20 }, (_, i) => ({
            timestamp: Date.now() - (19 - i) * 3600000,
            value: 150 + Math.random() * 200
          }))
        },
        {
          id: 'critical_damage',
          name: 'Critical Damage',
          color: '#9b59b6',
          data: Array.from({ length: 20 }, (_, i) => ({
            timestamp: Date.now() - (19 - i) * 3600000,
            value: 300 + Math.random() * 400
          }))
        }
      ]
    },
    gold: {
      perSecond: 12.5,
      total: 45680,
      series: [
        {
          id: 'gold_per_second',
          name: 'Gold per Second',
          color: '#f39c12',
          data: Array.from({ length: 20 }, (_, i) => ({
            timestamp: Date.now() - (19 - i) * 3600000,
            value: 5 + Math.random() * 15
          }))
        }
      ]
    },
    accuracy: {
      hitRatio: 0.78,
      hits: 3450,
      misses: 970,
      series: [
        {
          id: 'hit_ratio',
          name: 'Hit/Miss Ratio',
          color: '#3498db',
          data: Array.from({ length: 20 }, (_, i) => ({
            timestamp: Date.now() - (19 - i) * 3600000,
            value: 0.6 + Math.random() * 0.3
          }))
        }
      ]
    }
  };

  useEffect(() => {
    // Draw damage graph
    if (damageCanvasRef.current) {
      drawLineGraph(
        damageCanvasRef.current,
        'Damage Over Time',
        statistics.damage.series,
        'Damage'
      );
    }
    
    // Draw gold graph
    if (goldCanvasRef.current) {
      drawLineGraph(
        goldCanvasRef.current,
        'Gold per Second',
        statistics.gold.series,
        'Gold/s'
      );
    }
    
    // Draw accuracy graph
    if (accuracyCanvasRef.current) {
      drawLineGraph(
        accuracyCanvasRef.current,
        'Hit/Miss Ratio',
        statistics.accuracy.series,
        'Ratio'
      );
    }
  }, []);

  // Function to draw a line graph
  const drawLineGraph = (
    canvas: HTMLCanvasElement,
    title: string,
    series: StatSeries[],
    yAxisLabel: string
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Graph dimensions
    const padding = 40;
    const graphWidth = canvas.width - padding * 2;
    const graphHeight = canvas.height - padding * 2;
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, padding / 2);
    
    // Find min and max values for scaling
    let minValue = Number.MAX_VALUE;
    let maxValue = Number.MIN_VALUE;
    
    series.forEach(s => {
      s.data.forEach(point => {
        minValue = Math.min(minValue, point.value);
        maxValue = Math.max(maxValue, point.value);
      });
    });
    
    // Add some padding to min/max
    const valueRange = maxValue - minValue;
    minValue = Math.max(0, minValue - valueRange * 0.1);
    maxValue = maxValue + valueRange * 0.1;
    
    // Find min and max timestamps
    const minTimestamp = Math.min(...series.flatMap(s => s.data.map(d => d.timestamp)));
    const maxTimestamp = Math.max(...series.flatMap(s => s.data.map(d => d.timestamp)));
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw Y-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    const yLabelCount = 5;
    for (let i = 0; i <= yLabelCount; i++) {
      const value = minValue + (maxValue - minValue) * (i / yLabelCount);
      const y = canvas.height - padding - (i / yLabelCount) * graphHeight;
      
      ctx.fillText(value.toFixed(1), padding - 5, y + 4);
      
      // Draw horizontal grid line
      ctx.strokeStyle = '#ddd';
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }
    
    // Draw X-axis labels (timestamps)
    ctx.textAlign = 'center';
    const xLabelCount = 4;
    
    for (let i = 0; i <= xLabelCount; i++) {
      const timestamp = minTimestamp + (maxTimestamp - minTimestamp) * (i / xLabelCount);
      const x = padding + (i / xLabelCount) * graphWidth;
      
      const date = new Date(timestamp);
      const label = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      
      ctx.fillText(label, x, canvas.height - padding + 15);
      
      // Draw vertical grid line
      ctx.strokeStyle = '#ddd';
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    }
    
    // Draw Y-axis label
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#333';
    ctx.fillText(yAxisLabel, 0, 0);
    ctx.restore();
    
    // Draw data series
    series.forEach(s => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      s.data.forEach((point, index) => {
        const x = padding + ((point.timestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * graphWidth;
        const y = canvas.height - padding - ((point.value - minValue) / (maxValue - minValue)) * graphHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Draw data points
      ctx.fillStyle = s.color;
      s.data.forEach(point => {
        const x = padding + ((point.timestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * graphWidth;
        const y = canvas.height - padding - ((point.value - minValue) / (maxValue - minValue)) * graphHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    
    // Draw legend
    const legendX = canvas.width - padding - 100;
    const legendY = padding + 10;
    
    series.forEach((s, index) => {
      const y = legendY + index * 20;
      
      // Draw color box
      ctx.fillStyle = s.color;
      ctx.fillRect(legendX, y, 15, 15);
      
      // Draw series name
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.fillText(s.name, legendX + 20, y + 12);
    });
  };

  return (
    <div className={s.statisticsPage}>
      <h1>Statistics</h1>
      
      <div className={s.statSummary}>
        <div className={s.statCard}>
          <h3 className={s.statCardTitle}>Damage</h3>
          <div className={s.statValues}>
            <div className={s.statValue}>
              <span className={s.label}>Average:</span>
              <span className={s.value}>{statistics.damage.average}</span>
            </div>
            <div className={s.statValue}>
              <span className={s.label}>Highest:</span>
              <span className={s.value}>{statistics.damage.highest}</span>
            </div>
            <div className={s.statValue}>
              <span className={s.label}>Total:</span>
              <span className={s.value}>{statistics.damage.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className={s.statCard}>
          <h3 className={s.statCardTitle}>Gold</h3>
          <div className={s.statValues}>
            <div className={s.statValue}>
              <span className={s.label}>Per Second:</span>
              <span className={s.value}>{statistics.gold.perSecond}</span>
            </div>
            <div className={s.statValue}>
              <span className={s.label}>Total:</span>
              <span className={s.value}>{statistics.gold.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className={s.statCard}>
          <h3 className={s.statCardTitle}>Accuracy</h3>
          <div className={s.statValues}>
            <div className={s.statValue}>
              <span className={s.label}>Hit Ratio:</span>
              <span className={s.value}>{(statistics.accuracy.hitRatio * 100).toFixed(1)}%</span>
            </div>
            <div className={s.statValue}>
              <span className={s.label}>Hits:</span>
              <span className={s.value}>{statistics.accuracy.hits.toLocaleString()}</span>
            </div>
            <div className={s.statValue}>
              <span className={s.label}>Misses:</span>
              <span className={s.value}>{statistics.accuracy.misses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className={s.graphsContainer}>
        <div className={s.graphWrapper}>
          <canvas ref={damageCanvasRef} className={s.statGraph}></canvas>
        </div>
        
        <div className={s.graphWrapper}>
          <canvas ref={goldCanvasRef} className={s.statGraph}></canvas>
        </div>
        
        <div className={s.graphWrapper}>
          <canvas ref={accuracyCanvasRef} className={s.statGraph}></canvas>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
