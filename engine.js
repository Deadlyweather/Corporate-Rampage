import { Debug, keys, Stats, setGameOver } from './config.js';
import { Enemy, Projectile, EnemyProjectile } from './entities.js';
import { GenerateFloor } from './level.js';

// Pelimaailman dynaamiset listat
export let particles = [];
export let projectiles = [];
export let enemyProjectiles = [];
export let enemies = [];

// Pelin tilamuuttujat
export let canShoot = true;
export let canSwing = true;
export let shootDelay = 200;
export let swingDuration = 600;
export let hasKeycard = false;

/**
 * Luo räjähdysefektin
 */
export function SpawnExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 25,
            color: color
        });
    }
}

/**
 * Luo uuden ammuksen pelaajan sijainnista kohti hiirtä
 */
export function Shoot(type) {
    if ((type === "Bullet" && !canShoot) || (type === "Slash" && !canSwing)) return;

    let targetX = Debug.Cursor.x - Debug.Camera.offset.x;
    let targetY = Debug.Cursor.y - Debug.Camera.offset.y;
    let angle = Math.atan2(targetY - Debug.Player.world.y, targetX - Debug.Player.world.x);

    projectiles.push(new Projectile(Debug.Player.world.x, Debug.Player.world.y, angle, type));

    if (type === "Bullet") {
        canShoot = false;
        setTimeout(() => canShoot = true, shootDelay);
    }

    if (type === "Slash") {
        canSwing = false;
        setTimeout(() => canSwing = true, swingDuration);
    }
}

/**
 * Liikuttaa pelaajaa ja tarkistaa seinätörmäykset
 */
export function UpdatePlayer(walls) {
    let speed = 5;
    let nextX = Debug.Player.world.x;
    let nextY = Debug.Player.world.y;

    if (keys['w']) nextY -= speed;
    if (keys['s']) nextY += speed;
    if (keys['a']) nextX -= speed;
    if (keys['d']) nextX += speed;

    let canMoveX = true;
    let canMoveY = true;

    walls.forEach(wall => {
        if (wall.collides(nextX, Debug.Player.world.y, Debug.Player.size)) canMoveX = false;
        if (wall.collides(Debug.Player.world.x, nextY, Debug.Player.size)) canMoveY = false;
    });

    if (canMoveX) Debug.Player.world.x = nextX;
    if (canMoveY) Debug.Player.world.y = nextY;
}

/**
 * Päivittää kameran pehmeän seurannan
 */
export function UpdateCamera() {
    Debug.Camera.world.x += (Debug.Player.world.x - Debug.Camera.world.x) * 0.1;
    Debug.Camera.world.y += (Debug.Player.world.y - Debug.Camera.world.y) * 0.1;
    Debug.Camera.offset.x = Debug.Camera.screen.x - Debug.Camera.world.x;
    Debug.Camera.offset.y = Debug.Camera.screen.y - Debug.Camera.world.y;
}

/**
 * Tarkistaa onko kerros suoritettu ja voiko siirtyä eteenpäin.
 * UUSI: Vain Keycard vaaditaan, viholliset voivat jäädä henkiin.
 */
export function CheckExit() {
    let distToCenter = Math.sqrt(Debug.Player.world.x**2 + Debug.Player.world.y**2);

    // Ehto: VAIN avain hallussa ja pelaaja portaikossa (säde 100)
    if (hasKeycard && distToCenter < 100) {
        Stats.Floor++;
        hasKeycard = false; // Nollataan avain uutta kerrosta varten
        
        console.log(`Kerros ${Stats.Floor}. Viholliset seuraavat!`);
        
        // Kutsutaan generaattoria siten, ettei se tyhjennä vihollislistaa
        GenerateFloor(false); 
    }
}

/**
 * Koko pelimaailman logiikkapäivitys
 */
export function UpdateWorld(walls) {
    UpdatePlayer(walls);
    UpdateCamera();

    // 1. Pelaajan ammukset ja osumat
    projectiles = projectiles.filter(p => p.alive);

    projectiles.forEach(p => {
        p.update(walls);

        enemies.forEach(e => {

            let hit = false;

            if (p.type === "Bullet") {

                let dx = p.x - e.x;
                let dy = p.y - e.y;
                let dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < e.size / 2) {
                    hit = true;
                    p.alive = false;
                }
            } 
            
            else if (p.type === "Slash") {

                let dx = e.x - p.x;
                let dy = e.y - p.y;
                let dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < p.size) {

                    let angleToEnemy = Math.atan2(dy, dx);

                    let startAngle = p.angle;
                    let endAngle = startAngle + Math.PI;

                    let norm = (angleToEnemy - startAngle + Math.PI * 2) % (Math.PI * 2);

                    if (norm <= Math.PI) {
                        hit = true;
                    }

                }
            }

            if (hit) {

                e.health -= p.damage;

                if (e.health <= 0) {

                    Stats.Points += 100;
                    Stats.Money += 10;

                    SpawnExplosion(e.x, e.y, e.color);

                    if (e.hasKeycard) {
                        hasKeycard = true;
                        console.log("AVAINKORTTI POIMITTU!");
                    }
                }
            }

        });

    });

    // 2. Vihollisen ammukset ja osumat pelaajaan
    enemyProjectiles = enemyProjectiles.filter(ep => ep.alive);
    enemyProjectiles.forEach(ep => {
        ep.update(walls);
        let dx = ep.x - Debug.Player.world.x;
        let dy = ep.y - Debug.Player.world.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 32) { // Pelaajan osumasäde
            Stats.Health -= ep.damage;
            ep.alive = false;
            if (Stats.Health <= 0) {
                Stats.Health = 0;
                setGameOver(true);
            }
        }
    });

    // 3. Viholliset (tekoäly)
    enemies = enemies.filter(e => e.health > 0);
    enemies.forEach(e => e.update(Debug.Player.world.x, Debug.Player.world.y));

    // 4. Tarkistetaan siirtyminen (Portaikko)
    CheckExit();

    // 5. Hiukkaset
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (--p.life <= 0) particles.splice(i, 1);
    }
}