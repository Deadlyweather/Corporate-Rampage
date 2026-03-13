// renderer.js - Kaikki peli-istunnon piirtäminen
import { Debug, Stats, UI } from './config.js';
import { images, createPlaceholder } from './assets.js';
import { walls } from './world.js';
import { enemies, projectiles, enemyProjectiles, particles, hasKeycard } from './engine.js';
import { muzzleFlash, progress } from './main.js';

// --- PÄÄPIIRTOFUNKTIOT ---

/**
 * Piirtää koko pelimaailman kameranäkymän sisällä
 */
export function RenderGame(ctx) {
    
    // 1. Ruudun tyhjennys
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 2. Maailman piirtäminen (Kamera-alue alkaa)
    ctx.save();
    ctx.translate(Debug.Camera.offset.x, Debug.Camera.offset.y);

    // --- PIIRRETÄÄN PORTAIKKO (Exit) ---
    // Portaikko on aina maailman keskellä (0, 0)
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 2);

    // Tila: Aktiivinen (Sininen) tai Lukittu (Harmaa)
    // UUSI LOGIIKKA: Vain Keycard vaaditaan siirtymiseen
    if (hasKeycard) {
        ctx.fillStyle = "rgba(0, 255, 255, 0.25)"; 
        ctx.strokeStyle = "cyan";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "cyan";
    } else {
        ctx.fillStyle = "rgba(100, 100, 100, 0.1)"; 
        ctx.strokeStyle = "#555";
        ctx.shadowBlur = 0;
    }

    ctx.lineWidth = 5;
    ctx.fill();
    ctx.stroke();

    // Portaikon tekstit
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 20px Arial";
    ctx.fillText("PORTAIKKO", 0, 5);

    ctx.font = "12px Arial";
    if (!hasKeycard) {
        ctx.fillText("LUKITTU: ETSI AVAINKORTTI", 0, 35);
    } else {
        ctx.fillStyle = "cyan";
        ctx.fillText("REITTI AUKI - ASTU SISÄÄN", 0, 35);
        if (enemies.length > 0) {
            ctx.fillStyle = "orange";
            ctx.fillText(`VARO: ${enemies.length} VIHОLLISTA SEURAA!`, 0, 55);
        }
    }
    ctx.restore();

    // --- MAAILMAN OBJEKTIT ---
    walls.forEach(wall => wall.draw(ctx));
    
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
    });

    projectiles.forEach(p => p.draw(ctx));
    enemyProjectiles.forEach(ep => ep.draw(ctx));
    enemies.forEach(e => e.draw(ctx));
    
    drawPlayerAndGun(ctx);

    ctx.restore(); // Kamera-alue loppuu
}

/**
 * Piirtää kaikki käyttöliittymän elementit (HUD)
 */
export function ShowUI(ctx) {
    DrawHealthbar(ctx);
    DrawMoney(ctx);
    DrawFloor(ctx);
    DrawPoints(ctx);
    DrawKeycardStatus(ctx); 
    DrawBossHealth(ctx);    
}

// --- APUFUNKTIOT PIIRTÄMISEEN ---

function drawPlayerAndGun(ctx) {
    ctx.save();
    ctx.translate(Debug.Player.world.x, Debug.Player.world.y);
    
    let playerImg = images["Player"] || createPlaceholder(64, "white");
    ctx.drawImage(playerImg, -32, -32, 64, 64);

    let targetX = Debug.Cursor.x - Debug.Camera.offset.x;
    let targetY = Debug.Cursor.y - Debug.Camera.offset.y;
    let gunAngle = Math.atan2(targetY - Debug.Player.world.y, targetX - Debug.Player.world.x);

    ctx.save();
    ctx.rotate(gunAngle);
    if (Math.abs(gunAngle) > Math.PI / 2) ctx.scale(1, -1);
    
    let gunImg = images["LeadLauncher"] || createPlaceholder(64, "orange");
    ctx.drawImage(gunImg, 40, -16, 64, 32); 

    if (muzzleFlash > 0) {
        ctx.fillStyle = "rgba(255, 255, 0, 0.6)";
        ctx.beginPath();
        ctx.arc(65, 0, 18, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
    ctx.restore();
}

function drawBat(ctx, swingProgress = 0) {
    ctx.save();
    ctx.translate(Debug.Player.world.x, Debug.Player.world.y);

    let startAngle = 0 + swingProgress;     // kaaren alku 0 rad
    let endAngle = startAngle + Math.PI;    // 180 astetta

    ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 25, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// --- HUD-ELEMENTIT ---

export function DrawHealthbar(ctx) {
    let healthPercent = Math.max(0, Stats.Health / Stats.MaxHealth);
    ctx.fillStyle = UI.Healthbar.fluid.color;
    ctx.fillRect(
        UI.Healthbar.fluid.x - UI.Healthbar.fluid.width / 2, 
        UI.Healthbar.fluid.y, 
        UI.Healthbar.fluid.width * healthPercent, 
        UI.Healthbar.fluid.height
    );
    
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "20px Arial";
    ctx.fillText(`${Math.max(0, Math.floor(Stats.Health))}/${Stats.MaxHealth}`, UI.Healthbar.fluid.x, UI.Healthbar.fluid.y + 22);
}

export function DrawMoney(ctx) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`$${Stats.Money}`, ctx.canvas.width - 20, 40);
}

export function DrawFloor(ctx) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`FLOOR: ${Stats.Floor}`, 20, 40);
}

export function DrawPoints(ctx) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`POINTS: ${Stats.Points}`, 20, 70);
}

function DrawBossHealth(ctx) {
    const boss = enemies.find(e => e.isBoss);
    if (!boss) return;

    const barWidth = 600;
    const x = ctx.canvas.width / 2 - barWidth / 2;
    const y = 40;

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(x, y, barWidth, 25);

    const healthPercent = Math.max(0, boss.health / 1000);
    ctx.fillStyle = "purple";
    ctx.fillRect(x, y, barWidth * healthPercent, 25);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, 25);

    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("FINAL BOSS: HR MANAGER", ctx.canvas.width / 2, y - 10);
}

function DrawKeycardStatus(ctx) {
    if (!hasKeycard) return;
    const x = ctx.canvas.width - 100;
    const y = ctx.canvas.height - 80;

    ctx.fillStyle = "cyan";
    ctx.fillRect(x, y, 50, 30);
    ctx.fillStyle = "black";
    ctx.fillRect(x + 5, y + 5, 15, 8);
    ctx.fillStyle = "white";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("KEYCARD", x + 25, y - 5);
}

export function DrawDebugMode(ctx) {
    ctx.save();
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "16px Arial";
    ctx.fillText(`Player World: ${Math.round(Debug.Player.world.x)}, ${Math.round(Debug.Player.world.y)}`, 20, 110);
    ctx.fillText(`Enemies: ${enemies.length}`, 20, 130);
    ctx.restore();
}