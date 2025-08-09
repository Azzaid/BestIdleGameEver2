import { useRef, useEffect } from 'react';
import * as s from './CityPage.css.ts';

// Define building types
interface Building {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  level: number;
  description: string;
}

interface Slot {
  id: string;
  position: { x: number; y: number };
  size: number;
  occupiedBy?: string; // building type or name
}

const CityPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Example buildings data
  const buildings: Building[] = [
    {
      id: 'townhall',
      name: 'Town Hall',
      type: 'administrative',
      position: { x: 400, y: 300 },
      size: { width: 100, height: 100 },
      level: 3,
      description: 'The center of your city operations'
    },
    {
      id: 'barracks',
      name: 'Barracks',
      type: 'military',
      position: { x: 250, y: 200 },
      size: { width: 80, height: 60 },
      level: 2,
      description: 'Trains defenders for your city'
    },
    {
      id: 'workshop',
      name: 'Workshop',
      type: 'production',
      position: { x: 550, y: 200 },
      size: { width: 70, height: 70 },
      level: 2,
      description: 'Produces components for your tower'
    },
    {
      id: 'mine',
      name: 'Gold Mine',
      type: 'resource',
      position: { x: 300, y: 450 },
      size: { width: 60, height: 60 },
      level: 1,
      description: 'Generates gold over time'
    },
    {
      id: 'lab',
      name: 'Research Lab',
      type: 'research',
      position: { x: 500, y: 450 },
      size: { width: 80, height: 60 },
      level: 2,
      description: 'Generates research points'
    },
    {
      id: 'wall_north',
      name: 'North Wall',
      type: 'defense',
      position: { x: 200, y: 100 },
      size: { width: 400, height: 20 },
      level: 1,
      description: 'Protects your city from the north'
    },
    {
      id: 'wall_south',
      name: 'South Wall',
      type: 'defense',
      position: { x: 200, y: 580 },
      size: { width: 400, height: 20 },
      level: 1,
      description: 'Protects your city from the south'
    },
    {
      id: 'wall_east',
      name: 'East Wall',
      type: 'defense',
      position: { x: 600, y: 120 },
      size: { width: 20, height: 460 },
      level: 1,
      description: 'Protects your city from the east'
    },
    {
      id: 'wall_west',
      name: 'West Wall',
      type: 'defense',
      position: { x: 200, y: 120 },
      size: { width: 20, height: 460 },
      level: 1,
      description: 'Protects your city from the west'
    },
    {
      id: 'tower',
      name: 'Main Tower',
      type: 'defense',
      position: { x: 400, y: 100 },
      size: { width: 40, height: 40 },
      level: 3,
      description: 'Your main defensive tower'
    }
  ];

  // Demo slots that can be occupied by buildings
  const slots: Slot[] = [
    { id: 'slot1', position: { x: 120, y: 520 }, size: 40 },
    { id: 'slot2', position: { x: 180, y: 520 }, size: 40 },
    { id: 'slot3', position: { x: 240, y: 520 }, size: 40 },
    { id: 'slot4', position: { x: 300, y: 520 }, size: 40 },
    { id: 'slot5', position: { x: 360, y: 520 }, size: 40 },
    { id: 'slot6', position: { x: 420, y: 520 }, size: 40 },
    { id: 'slot7', position: { x: 480, y: 520 }, size: 40 },
    { id: 'slot8', position: { x: 540, y: 520 }, size: 40 },
  ];

  // Selected building state (would use useState in a real app)
  let selectedBuilding: Building | null = null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Initial draw: background, buildings, and slots
    redraw(ctx, canvas.width, canvas.height);

    // Add click handler for selection/placement
    const onClick = (e: MouseEvent) => handleCanvasClick(e);
    canvas.addEventListener('click', onClick);

    return () => {
      canvas.removeEventListener('click', onClick);
    };
  }, []);

  // Draw city background
  const drawCityBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw grass background
    ctx.fillStyle = '#7cad6d';
    ctx.fillRect(0, 0, width, height);
    
    // Draw some roads
    ctx.fillStyle = '#a9a9a9';
    
    // Horizontal main road
    ctx.fillRect(0, height / 2 - 15, width, 30);
    
    // Vertical main road
    ctx.fillRect(width / 2 - 15, 0, 30, height);
    
    // Draw some decorative elements
    for (let i = 0; i < 20; i++) {
      // Random trees
      ctx.fillStyle = '#2e5c1a';
      const treeX = Math.random() * width;
      const treeY = Math.random() * height;
      const treeSize = 5 + Math.random() * 10;
      
      // Don't place trees on roads
      if (
        (treeY > height / 2 - 20 && treeY < height / 2 + 20) ||
        (treeX > width / 2 - 20 && treeX < width / 2 + 20)
      ) {
        continue;
      }
      
      ctx.beginPath();
      ctx.arc(treeX, treeY, treeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Draw a building
  const drawBuilding = (ctx: CanvasRenderingContext2D, building: Building) => {
    // Different colors for different building types
    const colors: Record<string, string> = {
      administrative: '#e74c3c',
      military: '#3498db',
      production: '#f39c12',
      resource: '#2ecc71',
      research: '#9b59b6',
      defense: '#7f8c8d'
    };
    
    const color = colors[building.type] || '#95a5a6';
    
    // Draw building
    ctx.fillStyle = color;
    ctx.fillRect(
      building.position.x, 
      building.position.y, 
      building.size.width, 
      building.size.height
    );
    
    // Draw building border
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      building.position.x, 
      building.position.y, 
      building.size.width, 
      building.size.height
    );
    
    // Draw building name
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      building.name, 
      building.position.x + building.size.width / 2, 
      building.position.y + building.size.height / 2
    );
    
    // Draw level indicator
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(
      building.position.x + building.size.width - 10, 
      building.position.y + 10, 
      8, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      building.level.toString(), 
      building.position.x + building.size.width - 10, 
      building.position.y + 13
    );
  };

  // Draw a build slot
  const drawSlot = (
    ctx: CanvasRenderingContext2D,
    slot: Slot
  ) => {
    // Outline for slot
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.strokeRect(slot.position.x, slot.position.y, slot.size, slot.size);

    if (slot.occupiedBy) {
      // Fill to indicate occupied and write the first letter
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(slot.position.x, slot.position.y, slot.size, slot.size);
      ctx.fillStyle = '#2c3e50';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        slot.occupiedBy.charAt(0).toUpperCase(),
        slot.position.x + slot.size / 2,
        slot.position.y + slot.size / 2 + 4
      );
    }
  };

  // Redraw all city visuals
  const redraw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    drawCityBackground(ctx, width, height);
    buildings.forEach(b => drawBuilding(ctx, b));
    slots.forEach(sl => drawSlot(ctx, sl));
  };

  // Handle canvas click to select buildings or slots
  const handleCanvasClick = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check if a building was clicked
    let clickedBuilding: Building | null = null;
    for (const building of buildings) {
      if (
        x >= building.position.x && 
        x <= building.position.x + building.size.width &&
        y >= building.position.y && 
        y <= building.position.y + building.size.height
      ) {
        clickedBuilding = building;
        break;
      }
    }

    if (!clickedBuilding) {
      // If no building clicked, check slots
      let clickedSlot: Slot | null = null;
      for (const slot of slots) {
        if (
          x >= slot.position.x &&
          x <= slot.position.x + slot.size &&
          y >= slot.position.y &&
          y <= slot.position.y + slot.size
        ) {
          clickedSlot = slot;
          break;
        }
      }
      if (clickedSlot) {
        // Cycle occupancy demo: empty -> workshop -> barracks -> lab -> empty
        const cycle = [undefined, 'workshop', 'barracks', 'lab'] as (string | undefined)[];
        const currentIndex = cycle.findIndex(v => v === clickedSlot!.occupiedBy);
        const next = cycle[(currentIndex + 1) % cycle.length];
        clickedSlot.occupiedBy = next;

        // Redraw to reflect slot change
        redraw(ctx, canvas.width, canvas.height);

        // Update info for slot
        const buildingInfo = document.getElementById('building-info');
        if (buildingInfo) {
          if (clickedSlot.occupiedBy) {
            buildingInfo.innerHTML = `
              <h3>Slot ${clickedSlot.id.toUpperCase()}</h3>
              <p><strong>Occupied By:</strong> ${clickedSlot.occupiedBy}</p>
              <p>Click again to cycle occupancy.</p>
            `;
            buildingInfo.style.display = 'block';
          } else {
            buildingInfo.innerHTML = `
              <h3>Slot ${clickedSlot.id.toUpperCase()}</h3>
              <p><strong>Status:</strong> Empty</p>
              <p>Click to place a building.</p>
            `;
            buildingInfo.style.display = 'block';
          }
        }
        return;
      }
    }
    
    // Update selected building
    selectedBuilding = clickedBuilding;
    
    // Update building info display
    const buildingInfo = document.getElementById('building-info');
    if (buildingInfo) {
      if (selectedBuilding) {
        buildingInfo.innerHTML = `
          <h3>${selectedBuilding.name}</h3>
          <p><strong>Type:</strong> ${selectedBuilding.type}</p>
          <p><strong>Level:</strong> ${selectedBuilding.level}</p>
          <p>${selectedBuilding.description}</p>
          <button>Upgrade (${selectedBuilding.level * 100} gold)</button>
        `;
        buildingInfo.style.display = 'block';
      } else {
        buildingInfo.style.display = 'none';
      }
    }
  };

  return (
    <div className={s.cityPage}>
      <h1>City View</h1>
      <div className={s.cityContainer}>
        <canvas ref={canvasRef} className={s.cityCanvas}></canvas>
        <div id="building-info" className={s.buildingInfo}>
          <p className={s.buildingInfoText}>Click on a building to see details</p>
        </div>
      </div>
      <div className={s.cityControls}>
        <div className={s.resources}>
          <div className={s.resource}>
            <span className={s.resourceName}>Gold:</span>
            <span className={s.resourceValue}>1,250</span>
          </div>
          <div className={s.resource}>
            <span className={s.resourceName}>Population:</span>
            <span className={s.resourceValue}>42</span>
          </div>
          <div className={s.resource}>
            <span className={s.resourceName}>Research Points:</span>
            <span className={s.resourceValue}>75</span>
          </div>
        </div>
        <div className={s.actions}>
          <button className={s.actionButton}>Build New</button>
          <button className={s.actionButton}>Collect Resources</button>
        </div>
      </div>
    </div>
  );
};

export default CityPage;