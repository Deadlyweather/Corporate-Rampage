let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

ctx.fillStyle = "black"
ctx.fillRect(0, 0, canvas.width, canvas.height)

let Stats = {
    MaxHealth: 100,
    Health: 100,
    Money: 100,
    Floor: 0,
    Points: 0
}

function TrackCursor(canvas) {
    canvas.addEventListener("mousemove", (event) => {
        Debug.Cursor.x = event.clientX
        Debug.Cursor.y = event.clientY
    })

    canvas.addEventListener("mouseleave", () => {
        Debug.Cursor.x = null;
        Debug.Cursor.y = null;
    });
}

TrackCursor(canvas)

const paths = {
    // Blueprints

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
    Manager: "Kuvat/Entities/Manager.png",

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
    StairsSurface: "Kuvat/Special/Exit.png",
    StairsDeep: "Kuvat/Special/Exit2.png",
    Unlocked: "Kuvat/Special/Unlocked.png",

    // Stats
    Agility: "Kuvat/Stats/Agility.png",
    Endurance: "Kuvat/Stats/Endurance.png",
    Level: "Kuvat/Stats/Level.png",
    Strenght: "Kuvat/Stats/Strenght.png",

    // Walls
    BasicWall: "Kuvat/Walls/BasicWall.png"
}

let images = {}

function createPlaceholder(size = 32, color = "black") {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const cx = c.getContext("2d");
    cx.fillStyle = color;
    cx.fillRect(0, 0, size, size);
    cx.strokeStyle = "red";
    cx.lineWidth = 2;
    cx.strokeRect(1,1,size-2,size-2);
    cx.fillStyle = "white";
    cx.font = `${Math.floor(size/2)}px Arial`;
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText("?", size/2, size/2);
    return c;
}

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
            console.error("Kuva ei löydy:", paths[key]);
            images[key] = null;
            loadedCount++;

            if (onProgress) {
                onProgress(Math.floor((loadedCount / totalImages) * 100));
            }

            if (loadedCount === totalImages && onComplete) {
                onComplete();
            }
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
            color: "white",
            size: 40,

            x: canvas.width / 1.1,
            y: canvas.height * 0.3
        },

        icon: {
            size: 128,
            image: "Money"
        }
    },

    Floor: {
        text: {
            font: "Arial",
            color: "white",
            size: 40,

            x: canvas.width / 1.05,
            y: canvas.height * 0.1
        }
    },

    Points: {
        text: {
            font: "Arial",
            color: "white",
            size: 40,

            x: canvas.width / 1.05,
            y: canvas.height * 0.2
        }
    },

    Debug: {

        Player: {
            font: "Arial",
            color: "white",
            size: 20
        },

        Camera: {
            font: "Arial",
            color: "white",
            size: 40,
            location: { x: 20, y: 20 }
        },

        Cursor: {
            font: "Arial",
            color: "white",
            size: 16
        }
    }
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
    ctx.fillStyle = UI.Money.text.color
    ctx.font = `${UI.Money.text.size}px ${UI.Money.text.font}`
    ctx.textAlign = "right"

    ctx.fillText(`${Stats.Money}`, 
        UI.Money.text.x,
        UI.Money.text.y)

    ctx.drawImage(
        images[UI.Money.icon.image] || createPlaceholder(UI.Money.icon.size),
        UI.Money.text.x,
        UI.Money.text.y - UI.Money.icon.size / 2,
        UI.Money.icon.size,
        UI.Money.icon.size
    )
}

function Floor() {
    ctx.fillStyle = UI.Floor.text.color
    ctx.font = `${UI.Floor.text.size}px ${UI.Floor.text.font}`
    ctx.textAlign = "right"

    ctx.fillText(`Floor: ${Stats.Floor}`,
        UI.Floor.text.x,
        UI.Floor.text.y
    )
}

function Points() {
    ctx.fillStyle = UI.Points.text.color
    ctx.font = `${UI.Points.text.size}px ${UI.Points.text.font}`
    ctx.textAlign = "right"

    ctx.fillText(`Points: ${Stats.Points}`,
        UI.Points.text.x,
        UI.Points.text.y
    )
}

function DebugMode() {

    // Cursor
    ctx.fillStyle = UI.Debug.Cursor.color;
    ctx.font = `${UI.Debug.Cursor.size}px ${UI.Debug.Cursor.font}`
    ctx.textAlign = "center"

    if (Debug.Cursor.x && Debug.Cursor.y) {
        ctx.fillText(`(${Debug.Cursor.x}, ${Debug.Cursor.y})`,
            Debug.Cursor.x,
            Debug.Cursor.y + 32
        );
    }

    // Player
    ctx.fillStyle = UI.Debug.Player.color
    ctx.font = `${UI.Debug.Player.size / 2}px ${UI.Debug.Player.font}`
    ctx.textAlign = "center"

    ctx.fillText(`( Screen: ${Debug.Player.screen.x}, ${Debug.Player.screen.y} )`,
        Debug.Player.screen.x,
        Debug.Player.screen.y + Player.size
    )

    ctx.fillStyle = UI.Debug.Player.color
    ctx.font = `${UI.Debug.Player.size}px ${UI.Debug.Player.font}`
    ctx.textAlign = "center"

    ctx.fillText(`( World: ${Player.position.x}, ${Player.position.y} )`,
        Debug.Player.screen.x,
        Debug.Player.screen.y + Player.size * 1.5
    )

    // Camera
    ctx.fillStyle = UI.Debug.Camera.color
    ctx.font = `${UI.Debug.Camera.size}px ${UI.Debug.Camera.font}`
    ctx.textAlign = "left"

    ctx.fillText(`( Screen: ${Debug.Camera.screen.x}, ${Debug.Camera.screen.y} )`,
        UI.Debug.Camera.location.x,
        UI.Debug.Camera.location.y + UI.Debug.Camera.size
    )

    ctx.fillStyle = UI.Debug.Camera.color
    ctx.font = `${UI.Debug.Camera.size}px ${UI.Debug.Camera.font}`
    ctx.textAlign = "left"

    ctx.fillText(`( World: ${Debug.Camera.world.x}, ${Debug.Camera.world.y} )`,
        UI.Debug.Camera.location.x,
        UI.Debug.Camera.location.y + UI.Debug.Camera.size * 2.5
    )

    ctx.fillStyle = UI.Debug.Camera.color
    ctx.font = `${UI.Debug.Camera.size}px ${UI.Debug.Camera.font}`
    ctx.textAlign = "left"

    ctx.fillText(`( Offset: ${Debug.Camera.offset.x}, ${Debug.Camera.offset.y} )    ( Distance : ${Debug.Camera.offset.distance} / ${Debug.Camera.offset.max} )`,
        UI.Debug.Camera.location.x,
        UI.Debug.Camera.location.y + UI.Debug.Camera.size * 4
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
            console.log("Kaikki kuvat ladattu");
            gameloop()
        }
    );
}

let Player = {

    image: "Player",

    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    movement: { x: 0, y: 0 },

    size: 128,
    weight: 100,

    Strenght: 1,
    Endurance: 1,
    Agility: 1,
    Level: 1,

    Experience: {Count: 0, Max: 5, Scaling: 1}
}

let Blocks = {}

let Debug = {

    Player: {
        screen: { x: canvas.width / 2, y: canvas.height / 2},
        rotation: 90
    },

    Camera: {
        world: { x: 0, y: 0 },
        screen: { x: canvas.width / 2, y: canvas.height / 2 },
        offset: { x: 0, y: 0, distance: 0, max: Infinity },
    },

    Cursor: {
        x: 0,
        y: 0
    },
}

let input = {
    leftclick: false,
    rightclick: false,
    left: false,
    right: false,
    up: false,
    down: false,
}

document.addEventListener("keydown", (e) => {
    if (e.key === "w") input.up = true;
    if (e.key === "a") input.left = true;
    if (e.key === "s") input.down = true;
    if (e.key === "d") input.right = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "w") input.up = false;
    if (e.key === "a") input.left = false;
    if (e.key === "s") input.down = false;
    if (e.key === "d") input.right = false;
});

function MovePlayer() {

    Player.movement.x = 0
    Player.movement.y = 0

    if (input.up) Player.movement.y -= Player.Agility
    if (input.left) Player.movement.x -= Player.Agility
    if (input.down) Player.movement.y += Player.Agility
    if (input.right) Player.movement.x += Player.Agility
    
    

    Player.velocity.x += Player.movement.x
    Player.velocity.y += Player.movement.y

    Player.velocity.x *= (10 / Player.weight)
    Player.velocity.y *= (10 / Player.weight)

    Player.position.x += Player.velocity.x
    Player.position.y += Player.velocity.y
    
}

function DrawPlayer( Start = { x: canvas.width / 2, y: canvas.height / 2 }, End = { x: Debug.Cursor.x, y: Debug.Cursor.y } ) {

    const dx = End.x - Start.x
    const dy = End.y - Start.y

    if (Debug.Cursor.x && Debug.Cursor.y) {
        Player.rotation = Math.atan2(dy, dx)
    }
    

    ctx.save();

    ctx.translate(Start.x, Start.y)
    ctx.rotate(Player.rotation + Math.PI / 2)

    ctx.shadowColor = "white"
    ctx.shadowBlur = 80

    ctx.drawImage(images[Player.image],
        - Player.size / 2,
        - Player.size / 2,
        Player.size,
        Player.size
    )
    
    ctx.restore()

}

function ShowUI() {
    Healthbar()
    Money()
    Floor()
    Points()
}

LoadingScreen()

DebugEnabled = false

document.addEventListener("keydown", (e) => {
    if (e.key === "p") {
        if (DebugEnabled) {
            DebugEnabled = false
        } else {
            DebugEnabled = true
        }
    }
})

function gameloop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (DebugEnabled) {
        DebugMode()
    }

    MovePlayer()
    DrawPlayer()
    ShowUI()

    requestAnimationFrame(gameloop)
}

// UI (Tony Ruotsalainen)