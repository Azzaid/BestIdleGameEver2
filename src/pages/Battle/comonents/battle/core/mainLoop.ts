export function runAllSystems(world: World, dt: number) {
    SpawnSystem(world, dt);
    TargetingSystem(world);
    AimingSystem(world, dt);
    FiringSystem(world, dt);
    ProjectileSystem(world, dt);
    AoESystem(world, dt);
    StatusSystem(world, dt);
    MovementSystem(world, dt);
    DamageSystem?.(world, dt);     // if you separate DPS ticks
    DeathCleanupSystem(world);
    AnimationSystem?.(world, dt);
    // Render sync system if using Pixi
}