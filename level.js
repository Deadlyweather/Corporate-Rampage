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

   // 3. HUONEIDEN GENEROINTI (Vain jos ei ole Boss-taso)
    if (Stats.Floor === 0 || Stats.Floor % 10 !== 0) {
        const rooms = [];
        const roomCount = 6; // Kuinka monta huonetta yritetään luoda
        const minSize = 300;
        const maxSize = 600;

        for (let i = 0; i < roomCount; i++) {
            let w = minSize + Math.random() * (maxSize - minSize);
            let h = minSize + Math.random() * (maxSize - minSize);
            let x = (Math.random() - 0.5) * (size - 1000);
            let y = (Math.random() - 0.5) * (size - 1000);

            // Estetään päällekkäisyys ja turvaväli keskustaan
            let overlap = rooms.some(r => 
                x < r.x + r.w + 100 && x + w + 100 > r.x &&
                y < r.y + r.h + 100 && y + h + 100 > r.y
            );
            let tooCloseToCenter = Math.abs(x) < 400 && Math.abs(y) < 400;

            if (!overlap && !tooCloseToCenter) {
                // Luodaan neljä seinää huoneelle
                // Yläseinä (jossa oviaukko keskellä)
                walls.push(new Wall(x, y, w / 2 - 60, wallThick)); 
                walls.push(new Wall(x + w / 2 + 60, y, w / 2 - 60, wallThick));

                // Alaseinä
                walls.push(new Wall(x, y + h - wallThick, w, wallThick));

                // Vasen seinä
                walls.push(new Wall(x, y, wallThick, h));

                // Oikea seinä
                walls.push(new Wall(x + w - wallThick, y, wallThick, h));

                rooms.push({x, y, w, h});
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

    // 5. PELAAJAN ALOITUSPISTE (Siirretty pois portaikon päältä)
    Debug.Player.world.x = 0;
    Debug.Player.world.y = 400; // Pelaaja aloittaa portaikon alapuolelta
    
    // Kamera kohdistuu pelaajaan heti
    Debug.Camera.world.x = 0;
    Debug.Camera.world.y = 400;

    console.log(`Kerros ${Stats.Floor} valmis. Vihollisia yhteensä: ${enemies.length}`);
}