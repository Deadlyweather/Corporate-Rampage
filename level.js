// level.js - Kentän generointi ja kerroshallinta
import { Wall, walls } from './world.js';
import { enemies } from './engine.js';
import { Enemy } from './entities.js';
import { Debug, Stats } from './config.js';

/**
 * Generoi uuden kerroksen.
 * @param {boolean} clearEnemies - Jos true, kaikki viholliset poistetaan (pelin alku). 
 *                                 Jos false, vanhat viholliset säilyvät (seuraavat pelaajaa).
 */
export function GenerateFloor(clearEnemies = true) {
    // 1. TYHJENNETÄÄN SEINÄT JA LASKETAAN SIIRTYVÄT VIHОLLISET
    walls.length = 0; 

    const size = 2500; // Pelialueen koko
    const wallThick = 40;

    if (clearEnemies) {
        enemies.length = 0; 
    } else {
        // Siirretään kerroksessa selvinneet viholliset satunnaisiin paikkoihin uuden kerroksen reunoille,
        // jotta ne eivät ole heti pelaajan päällä portaikossa.
        enemies.forEach(e => {
            e.x = (Math.random() > 0.5 ? 1 : -1) * (800 + Math.random() * 300);
            e.y = (Math.random() > 0.5 ? 1 : -1) * (800 + Math.random() * 300);
            e.hasKeycard = false; // Vanha avain katoaa, jos se oli jollain
        });
        console.log(`Viholliset seurasivat sinua! Elossa: ${enemies.length}`);
    }

    // 2. ULKOSEINÄT
    walls.push(new Wall(-size/2, -size/2, size, wallThick)); // Ylä
    walls.push(new Wall(-size/2, size/2 - wallThick, size, wallThick));  // Ala
    walls.push(new Wall(-size/2, -size/2, wallThick, size)); // Vasen
    walls.push(new Wall(size/2 - wallThick, -size/2, wallThick, size)); // Oikea

     // 3. HUONEIDEN GENEROINTI (Päivitetty satunnaisilla kooilla)
    if (Stats.Floor === 0 || Stats.Floor % 10 !== 0) {
        const gridSize = 3; 
        const margin = 200; 
        const innerSize = size - (margin * 2); 
        const cellSize = innerSize / gridSize;
        const gap = 150; 

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                let xStart = -size/2 + margin + (col * cellSize);
                let yStart = -size/2 + margin + (row * cellSize);

                let cx = xStart + cellSize/2;
                let cy = yStart + cellSize/2;

                if (Math.abs(cx) < 300 && Math.abs(cy) < 300) continue;

                // TÄMÄ KOHTA: Määritellään uudet koot
                let randomW = (cellSize - gap) * (0.8 + Math.random() * 0.2);
                let randomH = (cellSize - gap) * (0.8 + Math.random() * 0.2);
                let x = xStart + (cellSize - randomW) / 2;
                let y = yStart + (cellSize - randomH) / 2;

                const doorGap = 100;
                // Arvotaan 2 ovea
                let doors = [0, 1, 2, 3].sort(() => Math.random() - 0.5).slice(0, 2);

                // HUOM: Käytä tässä randomW ja randomH muuttujia!
                // Yläseinä
                if (doors.includes(0)) {
                    walls.push(new Wall(x, y, randomW/2 - doorGap/2, wallThick));
                    walls.push(new Wall(x + randomW/2 + doorGap/2, y, randomW/2 - doorGap/2, wallThick));
                } else { walls.push(new Wall(x, y, randomW, wallThick)); }

                // Alaseinä
                if (doors.includes(1)) {
                    walls.push(new Wall(x, y + randomH - wallThick, randomW/2 - doorGap/2, wallThick));
                    walls.push(new Wall(x + randomW/2 + doorGap/2, y + randomH - wallThick, randomW/2 - doorGap/2, wallThick));
                } else { walls.push(new Wall(x, y + randomH - wallThick, randomW, wallThick)); }

                // Vasen seinä
                walls.push(new Wall(x, y, wallThick, randomH));
                // Oikea seinä
                walls.push(new Wall(x + randomW - wallThick, y, wallThick, randomH));
            }
        }
    }


    // 4. UUDET VIHОLLISET JA KEYCARD
    if (Stats.Floor > 0 && Stats.Floor % 10 === 0) {
        // BOSS-TASO
        const boss = new Enemy(600, 600, 'HR_Boss');
        boss.hasKeycard = true;
        enemies.push(boss);
    } else {
        // NORMAALI KERROS: Lisätään uusia vihollisia vanhojen lisäksi
        const newEnemyCount = Math.max(4, 3 + Math.floor(Stats.Floor / 2));
        
        for (let i = 0; i < newEnemyCount; i++) {
            let ex = (Math.random() - 0.5) * (size - 400);
            let ey = (Math.random() - 0.5) * (size - 400);
            
            // Varmistetaan etteivät uudet viholliset synny suoraan pelaajan päälle
            if (Math.abs(ex) > 600 || Math.abs(ey) > 600) {
                enemies.push(new Enemy(ex, ey, 'Rookie'));
            }
        }

        // Arvotaan uusi Keycard yhdelle elossa olevista vihollisista
        if (enemies.length > 0) {
            const luckyIndex = Math.floor(Math.random() * enemies.length);
            enemies[luckyIndex].hasKeycard = true;
        }
    }

     // 5. PELAAJAN ALOITUSPISTE (Keskelle tyhjää tilaa)
    Debug.Player.world.x = 0;
    Debug.Player.world.y = 0; // Nyt keskusta on tyhjä "aula"
    
    Debug.Camera.world.x = 0;
    Debug.Camera.world.y = 0;
}