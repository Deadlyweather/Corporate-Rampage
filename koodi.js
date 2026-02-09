let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

ctx.fillStyle = "black"
ctx.fillRect(0, 0, canvas.width, canvas.height)

let Stats = {
    MaxHealth: 100,
    Health: 100,
    Money: 0,
    Floor: 0,
    Points: 0
}

paths = {
    // Blueprints
    Lobby: "../Kuvat/Blueprints/Lobby.png",

    // Collectables
    BigMoney: "../Kuvat/Collectables/BigMoney.png",
    Keycard: "../Kuvat/Collectables/Keycard.png",
    Money: "../Kuvat/Collectables/Money.png",
    SmallMoney: "../Kuvat/Collectables/SmallMoney.png",

    // Consumeables
    Coffee: "../Kuvat/Consumeables/Coffee.png",
    Soda: "../Kuvat/Consumeables/Soda.png",
    Water: "../Kuvat/Consumeables/Water.png",

    // Display
    Cover: "../Kuvat/Display/Cover.png",
    Ivan: "../Kuvat/Display/Ivan.png",

    // Entities
    Employee: "../Kuvat/Entities/Employee.png",
    Guard: "../Kuvat/Entities/Guard.png",
    Player: "../Kuvat/Entities/Player.png",

    // Equipment
    BatonSword: "../Kuvat/Equipment/BatonSword.png",
    BatSword: "../Kuvat/Equipment/BatSword.png",
    BladeOfSymmetry: "../Kuvat/Equipment/BladeOfSymmetry.png",
    DoorShield: "../Kuvat/Equipment/DoorShield.png",
    Impaler: "../Kuvat/Equipment/Impaler.png",
    LeadLauncher: "../Kuvat/Equipment/LeadLauncher.png",
    Mouce: "../Kuvat/Equipment/Mouce.png",
    MouseLauncher: "../Kuvat/Equipment/MouseLauncher.png",
    PluggedAnnihilator: "../Kuvat/Equipment/PluggedAnnihilator.png",
    PluggedDestroyer: "../Kuvat/Equipment/PluggedDestroyer.png",
    PluggedStorm: "../Kuvat/Equipment/PluggedStorm.png",
    PlugNPound: "../Kuvat/Equipment/PlugNPound.png",
    RoundTable: "../Kuvat/Equipment/RoundTable.png",
    RulerOfAngles: "../Kuvat/Equipment/RulerOfAngles.png",
    RulerOfDiscipline: "../Kuvat/Equipment/RulerOfDiscipline.png",
    SquareTable: "../Kuvat/Equipment/SquareTable.png",
    Sunglasses: "../Kuvat/Equipment/Sunglasses.png",
    ZeusLightning: "../Kuvat/Equipment/ZeusLightning.png",

    // Floors
    FloorMat: "../Kuvat/Floors/FloorMat.png",
    FloorTile: "../Kuvat/Floors/FloorTile.png",

    // Materials
    Glass: "../Kuvat/Materials/Glass.png",

    // Special
    DoorKnob: "../Kuvat/Special/DoorKnob.png",
    Locked: "../Kuvat/Special/Locked.png",
    OfficeDoorKnob: "../Kuvat/Special/OfficeDoorKnob.png",
    StairsDown: "../Kuvat/Special/StairsDown.png",
    StairsUp: "../Kuvat/Special/StairsUp.png",
    Unlocked: "../Kuvat/Special/Unlocked.png",

    // Stats
    Agility: "../Kuvat/Stats/Agility.png",
    Endurance: "../Kuvat/Stats/Endurance.png",
    Level: "../Kuvat/Stats/Level.png",
    Strenght: "../Kuvat/Stats/Strenght.png",

    // Walls
    BasicWall: "../Kuvat/Walls/BasicWall.png"
}

let images = {}

function DownloadImages(onProgress, onComplete) {
    let loadedCount = 0;
    let totalImages = Object.keys(paths).length;

    for (const key in paths) {
        const img = new Image();
        img.src = paths[key];

        img.onload = () => {
            images[key] = img;
            loadedCount++;

            if (onProgress) {
                onProgress(Math.floor((loadedCount / totalImages) * 100));
            }

            if (loadedCount === totalImages && onComplete) {
                onComplete();
            }
        };

        img.onerror = () => {
            console.error("Kuvan ei löydy:", paths[key]);
        };
    }
}

let UI = {
    Healthbar: {
        fluid: {
            width: 400,
            height: 30,
            color: "red",

            x: canvas.width / 2,
            y: canvas.height / 1.25
        },
        text: {
            font: "Arial",
            color: "white",
            size: 20,
        }
    },
    
    Money: {
        text: {
            font: "Arial",
            color: "lime",
            size: 20,

            x: canvas.width / 1.1,
            y: canvas.height * 0.1
        },

        icon: {
            size: 16,
            image: images.Money
        }
    },

    // debug
}

let Startup = {
    Progress: 0,

    Progressbar: {
        fluid: {
            width: 800,
            height: 100,
            color: "lime",

            x: canvas.width / 2,
            y: canvas.height / 2
        },

        text: {
            font: "Arial",
            size: 80,
            color: "white"
        }
    }
}

// UI (Tony.Ruotsalainen)

function Healthbar() {
    // Bar
    ctx.fillStyle = UI.Healthbar.fluid.color
    ctx.fillRect(
        UI.Healthbar.fluid.x - UI.Healthbar.fluid.width / 2,
        UI.Healthbar.fluid.y,
        UI.Healthbar.fluid.width * (Stats.Health / Stats.MaxHealth),
        UI.Healthbar.fluid.height
    )

    // Text
    ctx.fillStyle = UI.Healthbar.text.color
    ctx.font = `${UI.Healthbar.text.size}px ${UI.Healthbar.text.font}`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    ctx.fillText(
        `${Stats.Health}/${Stats.MaxHealth}`,
        UI.Healthbar.fluid.x,
        UI.Healthbar.fluid.y + UI.Healthbar.fluid.height / 2
    )
}

function Money() {
    ctx.fillStyle = UI.Money.color
    ctx.font = `${UI.Money.text.size}px ${UI.Money.text.font}`
    
    // count
    ctx.fillText(
        `${Stats.Money}`,
        UI.Money.text.x,
        UI.Money.text.y
    )

    // icon
    ctx.drawImage(
        UI.Money.icon.image,
        UI.Money.text.x,
        UI.Money.text.y + UI.Money.size / 2,
        UI.Money.icon.size,
        UI.Money.icon.size
    )
}

function LoadingScreen() {
    DownloadImages(
        (progress) => {
            Startup.Progress = progress;

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = "black",
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.strokeStyle = "white";
            ctx.lineWidth = 5;
            ctx.strokeRect(
                Startup.Progressbar.fluid.x - Startup.Progressbar.fluid.width / 2,
                Startup.Progressbar.fluid.y - Startup.Progressbar.fluid.height / 2,
                Startup.Progressbar.fluid.width,
                Startup.Progressbar.fluid.height
            );

            ctx.fillStyle = Startup.Progressbar.fluid.color;
            ctx.fillRect(
                Startup.Progressbar.fluid.x - Startup.Progressbar.fluid.width / 2,
                Startup.Progressbar.fluid.y - Startup.Progressbar.fluid.height / 2,
                Startup.Progressbar.fluid.width * (Startup.Progress / 100),
                Startup.Progressbar.fluid.height
            );

            ctx.fillStyle = Startup.Progressbar.text.color;
            ctx.font = `${Startup.Progressbar.text.size}px ${Startup.Progressbar.text.font}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${Startup.Progress}%`, Startup.Progressbar.fluid.x, Startup.Progressbar.fluid.y);
        },
        () => {
            console.log("Kaikki kuvat ladattu!");
            gameloop()
        }
    );
}

function ShowUI() {
    Healthbar()
    Money()
}

LoadingScreen()

function gameloop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ShowUI()
}