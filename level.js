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

     // 3. HUONEIDEN GENEROINTI (Korjattu ovilogiikka)
    if (Stats.Floor === 0 || Stats.Floor % 10 !== 0) {
    const gridSize = 3; 
    const cellSize = size / gridSize;
    const gap = 120;
    const doorGap = 100;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            let xStart = -size/2 + (col * cellSize);
            let yStart = -size/2 + (row * cellSize);

            let cx = xStart + cellSize/2;
            let cy = yStart + cellSize/2;
            if (Math.abs(cx) < 300 && Math.abs(cy) < 300) continue;

            let x = (col === 0) ? xStart : xStart + (gap / 2);
            let w = (col === 0 || col === gridSize - 1) ? cellSize - (gap / 2) : cellSize - gap;
            let y = (row === 0) ? yStart : yStart + (gap / 2);
            let h = (row === 0 || row === gridSize - 1) ? cellSize - (gap / 2) : cellSize - gap;

            // --- OVILOGIIKKA ---
            // Listataan vain ne seinät, jotka EIVÄT ole ulkoreunoja
            let possibleDoors = [];
            if (row > 0) possibleDoors.push(0);            // Yläseinä (jos ei yläreunassa)
            if (row < gridSize - 1) possibleDoors.push(1); // Alaseinä (jos ei alareunassa)
            if (col > 0) possibleDoors.push(2);            // Vasen seinä (jos ei vasemmassa reunassa)
            if (col < gridSize - 1) possibleDoors.push(3); // Oikea seinä (jos ei oikeassa reunassa)

            // Valitaan vähintään yksi ovi näistä mahdollisista suunnista
            let selectedDoors = possibleDoors.sort(() => Math.random() - 0.5).slice(0, 2);
            if (selectedDoors.length === 0 && possibleDoors.length > 0) {
                selectedDoors.push(possibleDoors[0]); // Varmistus: vähintään yksi ovi
            }

            // YLÄSEINÄ
            if (row > 0) {
                if (selectedDoors.includes(0)) {
                    walls.push(new Wall(x, y, w/2 - doorGap/2, wallThick));
                    walls.push(new Wall(x + w/2 + doorGap/2, y, w/2 - doorGap/2, wallThick));
                } else { walls.push(new Wall(x, y, w, wallThick)); }
            }

            // ALASEINÄ
            if (row < gridSize - 1) {
                if (selectedDoors.includes(1)) {
                    walls.push(new Wall(x, y + h - wallThick, w/2 - doorGap/2, wallThick));
                    walls.push(new Wall(x + w/2 + doorGap/2, y + h - wallThick, w/2 - doorGap/2, wallThick));
                } else { walls.push(new Wall(x, y + h - wallThick, w, wallThick)); }
            }

            // VASEN SEINÄ
            if (col > 0) {
                if (selectedDoors.includes(2)) {
                    walls.push(new Wall(x, y, wallThick, h/2 - doorGap/2));
                    walls.push(new Wall(x, y + h/2 + doorGap/2, wallThick, h/2 - doorGap/2));
                } else { walls.push(new Wall(x, y, wallThick, h)); }
            }

            // OIKEA SEINÄ
            if (col < gridSize - 1) {
                if (selectedDoors.includes(3)) {
                    walls.push(new Wall(x + w - wallThick, y, wallThick, h/2 - doorGap/2));
                    walls.push(new Wall(x + w - wallThick, y + h/2 + doorGap/2, wallThick, h/2 - doorGap/2));
                } else { walls.push(new Wall(x + w - wallThick, y, wallThick, h)); }
            }
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