import { isGameOver, Startup, keys, Debug, Stats } from './config.js';
import { DownloadImages } from './assets.js';
import { UpdateWorld, Shoot, canShoot, canSwing } from './engine.js';
import { RenderGame, ShowUI, DrawDebugMode } from './renderer.js';
import { walls } from './world.js';
import { GenerateFloor } from './level.js';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// contextmenu poistaja
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

// Efektimuuttuja aseen välähdykselle (viedään exportilla rendererille)
export let muzzleFlash = 0;

export let SwingFlash = 0

// 1. ALUSTUS
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Responsiivisuus: Päivitetään koot jos ikkunaa pienennetään/suurennetaan
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    Debug.Camera.screen.x = canvas.width / 2;
    Debug.Camera.screen.y = canvas.height / 2;
});

// 2. TAPAHTUMANKUUNTELIJAT (Näppäimistö ja hiiri)
window.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

window.addEventListener("mousemove", (e) => {
    Debug.Cursor.x = e.clientX;
    Debug.Cursor.y = e.clientY;
});

window.addEventListener("mousedown", (e) => {

    // Estetään ampuminen jos peli on loppu tai ollaan latausruudussa
    if (isGameOver || Startup.Progress !== 100) return;

    if (e.button === 0) {  // Left click = Ranged
        Shoot("Bullet");
        muzzleFlash = 5; 
    }

    if (e.button === 2) {  // Right click = Melee
        Shoot("Slash");
        SwingFlash = 5
    }

});

// 3. PELISILMUKKA (Game Loop)
function gameLoop() {
    // TARKISTETAAN PELIN LOPPUMINEN
    if (isGameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "red";
        ctx.font = "bold 80px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText(`Saavutit kerroksen ${Stats.Floor} ja keräsit ${Stats.Points} pistettä.`, canvas.width / 2, canvas.height / 2 + 60);
        ctx.fillText("Paina F5 aloittaaksesi alusta", canvas.width / 2, canvas.height / 2 + 100);
        return; 
    }

    // A) LOGIIKAN PÄIVITYS
    UpdateWorld(walls); 
    if (muzzleFlash > 0) muzzleFlash--; // Vähennetään suuliekin kestoa
    if (SwingFlash > 0) SwingFlash--
    // B) RENDERÖINTI (Piirtäminen)
    RenderGame(ctx);     // Piirtää maailman, viholliset ja pelaajan
    ShowUI(ctx);         // Piirtää HUDin (elämät, rahat, boss-palkki)
    
    //DrawDebugMode(ctx); // Poista kommentti jos haluat nähdä koordinaatit ruudulla

    requestAnimationFrame(gameLoop);
}

// 4. LATAUSRUUTU JA KÄYNNISTYSJÄRJESTYS
function LoadingScreen() {
    DownloadImages(
        (progress) => {
            // Päivitetään latauspalkin tila
            Startup.Progress = progress;

            // Piirretään latausnäkymä
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const pb = Startup.Progressbar;
            
            // Palkin reunat
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(pb.fluid.x - pb.fluid.width / 2, pb.fluid.y - pb.fluid.height / 2, pb.fluid.width, pb.fluid.height);

            // Täytetty osa
            ctx.fillStyle = pb.fluid.color;
            ctx.fillRect(pb.fluid.x - pb.fluid.width / 2, pb.fluid.y - pb.fluid.height / 2, pb.fluid.width * (progress / 100), pb.fluid.height);

            // Prosenttiteksti
            ctx.fillStyle = pb.text.color;
            ctx.font = `${pb.text.size}px ${pb.text.font}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${progress}%`, pb.fluid.x, pb.fluid.y);
        },
        () => {
            // TÄMÄ AJETAAN KUN KAIKKI ON LADATTU
            console.log("Kuvat ladattu onnistuneesti!");
            
            // Generoidaan ensimmäinen kerros (Floor 0)
            GenerateFloor(); 
            
            // Käynnistetään varsinainen pelisilmukka
            gameLoop();
        }
    );
}

// KÄYNNISTETÄÄN PELI
LoadingScreen();