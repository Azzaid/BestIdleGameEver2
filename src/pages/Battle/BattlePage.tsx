import { useRef, useEffect } from 'react';
import * as s from './BattlePage.css.ts';

const BattlePage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Background (field)
    ctx.fillStyle = '#8B9862'; // Grass-like color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // City wall along the bottom
    const wallHeight = 80;
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, canvas.height - wallHeight, canvas.width, wallHeight);

    // Tower centered on the wall
    const towerWidth = 80;
    const towerHeight = 100;
    const towerX = canvas.width / 2 - towerWidth / 2;
    const towerY = canvas.height - wallHeight - towerHeight;
    // Tower base
    ctx.fillStyle = '#666666';
    ctx.fillRect(towerX, towerY, towerWidth, towerHeight);
    // Tower turret
    ctx.fillStyle = '#555555';
    ctx.fillRect(towerX + towerWidth / 2 - 10, towerY - 20, 20, 20);

    // Enemies coming from the top
    const enemyCount = 8;
    for (let i = 0; i < enemyCount; i++) {
      const ex = (i + 1) * (canvas.width / (enemyCount + 1));
      const ey = 20 + (i % 4) * 30; // stagger vertically near the top
      // Enemy body
      ctx.fillStyle = '#b22222';
      ctx.beginPath();
      ctx.arc(ex, ey, 10, 0, Math.PI * 2);
      ctx.fill();
      // Downward hint (arrow)
      ctx.strokeStyle = '#7a1a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex, ey + 12);
      ctx.lineTo(ex, ey + 32);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex - 5, ey + 26);
      ctx.lineTo(ex, ey + 32);
      ctx.lineTo(ex + 5, ey + 26);
      ctx.stroke();
    }
  }, []);

  return (
    <div className={s.battlePage}>
      <h1>Battle</h1>
      <div className={s.canvasContainer}>
        <canvas ref={canvasRef} className={s.battleCanvas}></canvas>
      </div>
      <div className={s.battleControls}>
        <p>Tower stands on the city wall along the bottom. Enemies approach from the top.</p>
      </div>
    </div>
  );
};

export default BattlePage;