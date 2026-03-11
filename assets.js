// assets.js - Kuvien polut ja latauslogiikka

export const paths = {
    // Blueprints
    Lobby: "Kuvat/Blueprints/Lobby.png",

    // Collectables
    BigMoney: "Kuvat/Collectables/BigMoney.png",
    Keycard: "Kuvat/Collectables/Keycard.png",
    Money: "Kuvat/Collectables/Money.png",
    SmallMoney: "Kuvat/Collectables/SmallMoney.png",

    // Consumeables
    Coffee: "Kuvat/Consumeables/Coffee.png",
    Soda: "Kuvat/Consumeables/Soda.png",
    Water: "Kuvat/Consumeables/Water.png",

    // Display
    Cover: "Kuvat/Display/Cover.png",
    Ivan: "Kuvat/Display/Ivan.png",

    // Entities
    Employee: "Kuvat/Entities/Employee.png",
    Guard: "Kuvat/Entities/Guard.png",
    Player: "Kuvat/Entities/Player.png",

    // Equipment
    BatonSword: "Kuvat/Equipment/BatonSword.png",
    BatSword: "Kuvat/Equipment/BatSword.png",
    BladeOfSymmetry: "Kuvat/Equipment/BladeOfSymmetry.png",
    DoorShield: "Kuvat/Equipment/DoorShield.png",
    Impaler: "Kuvat/Equipment/Impaler.png",
    LeadLauncher: "Kuvat/Equipment/LeadLauncher.png",
    Mouce: "Kuvat/Equipment/Mouce.png",
    MouseLauncher: "Kuvat/Equipment/MouseLauncher.png",
    PluggedAnnihilator: "Kuvat/Equipment/PluggedAnnihilator.png",
    PluggedDestroyer: "Kuvat/Equipment/PluggedDestroyer.png",
    PluggedStorm: "Kuvat/Equipment/PluggedStorm.png",
    PlugNPound: "Kuvat/Equipment/PlugNPound.png",
    RoundTable: "Kuvat/Equipment/RoundTable.png",
    RulerOfAngles: "Kuvat/Equipment/RulerOfAngles.png",
    RulerOfDiscipline: "Kuvat/Equipment/RulerOfDiscipline.png",
    SquareTable: "Kuvat/Equipment/SquareTable.png",
    Sunglasses: "Kuvat/Equipment/Sunglasses.png",
    ZeusLightning: "Kuvat/Equipment/ZeusLightning.png",

    // Floors
    FloorMat: "Kuvat/Floors/FloorMat.png",
    FloorTile: "Kuvat/Floors/FloorTile.png",

    // Materials
    Glass: "Kuvat/Materials/Glass.png",
    Null: "Kuvat/Materials/Null.png",

    // Special
    DoorKnob: "Kuvat/Special/DoorKnob.png",
    Locked: "Kuvat/Special/Locked.png",
    OfficeDoorKnob: "Kuvat/Special/OfficeDoorKnob.png",
    StairsDown: "Kuvat/Special/StairsDown.png",
    StairsUp: "Kuvat/Special/StairsUp.png",
    Unlocked: "Kuvat/Special/Unlocked.png",

    // Stats
    Agility: "Kuvat/Stats/Agility.png",
    Endurance: "Kuvat/Stats/Endurance.png",
    Level: "Kuvat/Stats/Level.png",
    Strenght: "Kuvat/Stats/Strenght.png",

    // Walls
    BasicWall: "Kuvat/Walls/BasicWall.png"
};

export const music = new Audio("audio/music_loop.mp3");
music.loop = true;
music.volume = 0.5;

// Haetaan HTML-elementit
const volumeSlider = document.getElementById("volumeSlider");
const muteButton = document.getElementById("muteButton");

// 1. Äänenvoimakkuuden säädin
volumeSlider.addEventListener("input", (e) => {
    music.volume = e.target.value;
    if (music.volume > 0) {
        music.muted = false;
        muteButton.textContent = "Mykistä";
    }
});

// 2. Mykistysnappi
muteButton.addEventListener("click", () => {
    music.muted = !music.muted;
    muteButton.textContent = music.muted ? "Äänet päälle" : "Mykistä";
    
    // Päivitetään liuku säädin nollaan jos mykistetty (visuaalinen palaute)
    if (music.muted) {
        volumeSlider.value = 0;
    } else {
        volumeSlider.value = music.volume;
    }
});

// Alkuperäinen 'o'-näppäimen kuuntelija
document.addEventListener("keydown", (e) => {
    if (e.key === "o") {
        music.play().catch(err => console.warn("Interaktio puuttuu:", err));
    }
});

export let images = {};

export function createPlaceholder(size = 32, color = "black") {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const cx = c.getContext("2d");
    cx.fillStyle = color;
    cx.fillRect(0, 0, size, size);
    cx.strokeStyle = "red";
    cx.lineWidth = 2;
    cx.strokeRect(1, 1, size - 2, size - 2);
    cx.fillStyle = "white";
    cx.font = `${Math.floor(size / 2)}px Arial`;
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText("?", size / 2, size / 2);
    return c;
}

export function DownloadImages(onProgress, onComplete) {
    let loadedCount = 0;
    const keys = Object.keys(paths);
    const total = keys.length;

    if (total === 0) {
        onComplete();
        return;
    }

    keys.forEach(key => {
        const img = new Image();
        img.src = paths[key];

        img.onload = () => {
            images[key] = img;
            loadedCount++;
            onProgress(Math.floor((loadedCount / total) * 100));
            if (loadedCount === total) onComplete();
        };

        img.onerror = () => {
            console.error("Kuva ei löydy:", paths[key]);
            images[key] = createPlaceholder(64, "purple");
            loadedCount++;
            onProgress(Math.floor((loadedCount / total) * 100));
            if (loadedCount === total) onComplete();
        };
    });
}