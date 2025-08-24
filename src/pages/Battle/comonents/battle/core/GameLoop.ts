// /battle/core/GameLoop.ts
const FIXED_DT = 1 / 60;

export class GameLoop {
    private lastTimestamp = 0;
    private accumulator = 0;

    constructor(private update: (dt: number) => void, private render: (alpha: number) => void) {}

    start() {
        this.lastTimestamp = performance.now();
        const frame = (now: number) => {
            const elapsed = Math.min(0.25, (now - this.lastTimestamp) / 1000);
            this.lastTimestamp = now;
            this.accumulator += elapsed;

            while (this.accumulator >= FIXED_DT) {
                this.update(FIXED_DT);
                this.accumulator -= FIXED_DT;
            }
            const alpha = this.accumulator / FIXED_DT;
            this.render(alpha);
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }
}
