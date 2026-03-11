const music = new Audio("audio/music_loop.ogg");
music.loop = true;
music.volume = 0.5;

document.addEventListener("keydown", (e) => {
    if (e.key === "o") music.play();
})

let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

ctx.fillStyle = "black"
ctx.fillRect(0, 0, canvas.width, canvas.height)
canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});
canvas.draggable = false
canvas.addEventListener("mousedown", (e) => {
    if (e.button === 2) {
        e.preventDefault();
    }
});

let Stats = {
    MaxHealth: 100,
    Health: 100,
    Money: 100,
    Floor: -1,
    Points: 0
}
let Inventory = {
    size: 12,
    slots: [],

    init() {
        this.slots = new Array(this.size).fill(null);
    },

    add(item, amount = 1) {

        
        if (item.stackable) {
            for (let i = 0; i < this.size; i++) {
                let slot = this.slots[i];
                if (slot && slot.item.id === item.id) {
                    slot.amount += amount;
                    return true;
                }
            }
        }

        
        for (let i = 0; i < this.size; i++) {
            if (!this.slots[i]) {
                this.slots[i] = { item, amount };
                return true;
            }
        }

        return false; 
    },

    remove(itemId, amount = 1) {
        for (let i = 0; i < this.size; i++) {
            let slot = this.slots[i];
            if (slot && slot.item.id === itemId) {
                slot.amount -= amount;

                if (slot.amount <= 0) {
                    this.slots[i] = null;
                }
                return true;
            }
        }
        return false;
    },

    has(itemId, amount = 1) {
        for (let slot of this.slots) {
            if (slot && slot.item.id === itemId && slot.amount >= amount) {
                return true;
            }
        }
        return false;
    },

    clear() {
        this.slots = new Array(this.size).fill(null);
    }
};

Inventory.init();

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

    // Debug
    DebugExit: "Kuvat/Debug/Debug_Exit.png",
    DebugSpawn: "Kuvat/Debug/Debug_Spawn.png",
    DebugSword: "Kuvat/Debug/Debug_Sword.png",

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
    FloorMat: "Kuvat/Floors/FloorCarpet.png",
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
    Strength: "Kuvat/Stats/Strength.png",

    // UI

    HealthIcon: "Kuvat/UI/HealthIcon.png",

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

    // Icon
    ctx.drawImage(
        images["HealthIcon"],
        UI.Healthbar.fluid.x - UI.Healthbar.fluid.width / 2 - 40 ,
        UI.Healthbar.fluid.y - UI.Healthbar.fluid.height / 2 - 18,
        64,
        64
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

let Enemies = []



function SpawnEnemy(x, y) {
    Enemies.push({
        image: "Employee",
        position: { x: x, y: y },
        velocity: { x: 0, y: 0 },
        size: 96,
        speed: 1.5,
        health: 20,
        aggroRange: 600,
        hitbox: { type: "circle", radius: 96 * 0.3 },
        lastHit: 0
    })
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

    // --- Hitboxes ---

    // Player
    ctx.save()
    ctx.strokeStyle = "blue"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(Debug.Player.screen.x, Debug.Player.screen.y, Player.size * Player.hitbox.size, 0, Player.hitbox.angle * 4)
    ctx.stroke()
    ctx.restore()

    // Structures
    for (let tile of Structures.Tiles) {
        if (!tile.hitbox) continue;

        const screenX = tile.hitbox.x - Debug.Camera.world.x + Debug.Camera.screen.x;
        const screenY = tile.hitbox.y - Debug.Camera.world.y + Debug.Camera.screen.y;

        ctx.save();
        ctx.globalAlpha = 0.5
        ctx.lineWidth = 1;

        ctx.strokeStyle = tile.hitbox.solid ? "blue" : "red";

        if (tile.hitbox.type === "rect") {
            ctx.strokeRect(
                screenX - tile.hitbox.width / 2,
                screenY - tile.hitbox.height / 2,
                tile.hitbox.width,
                tile.hitbox.height
            );
        } else if (tile.hitbox.type === "circle") {
            ctx.beginPath();
            ctx.arc(screenX, screenY, tile.hitbox.radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

function LoadingScreen() {
    DownloadImages(
        (progress) => {
            Startup.Progress = progress;

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = "black"
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
            gameloop();
        }
    );
}

let Player = {

    image: "Player",

    position: { x: 128, y: 128 },
    velocity: { x: 0, y: 0 },
    movement: { x: 0, y: 0 },

    rotation: 0,
    size: 128,
    weight: 100,
    hitbox: { size: 0.25, angle: Math.PI / 2 },

    Strength: 1,
    Endurance: 1,
    Agility: 1,
    Level: 1,

    Experience: {Count: 0, Max: 5, Scaling: 1},
    Inventory: {
        items: [],
        maxSlots: 12,
        open: false
    }
}

let shop = {
    types: {
        Cold: {
            image: "ColdMachine",
            Inflation: 1,
            Scaling: 1.5,
            Inventory: {
                Slot1: {
                    Item: 0, // Water
                    Cost: 1,
                    Limit: Infinity
                },
                Slot2: {
                    Item: 3, // Soda
                    Cost: 100,
                    Limit: 10
                }
            }
        },
        hot: {
            image: "HotMachine",
            Inflation: 1,
            Scaling: 1.05,
            Items: {
                Coffee: {
                    Item: 2, // Coffee
                    Cost: 500,
                    Limit: 1
                }
            }
        },
        // Ase kauppa jätetään pois. 
        Premium: {
            image: "PremiumMachine",
            Inflation: 2,
            Scaling: 1,
            Items: {
                none: {
                    Item: null,
                    Cost: 0,
                    Limit: 0
                }
            }
        }
    }
}



let World = {
    TileSize: 64,
}

let Structures = {

    Tiles: [],

    Types: {
        BasicWall: {
            image: "BasicWall",
            size: 1,
            solid: true,
            draggable: false,
            layer: 2,
            id: 0,
        },
        BasicFloor: {
            image: "FloorTile",
            size: 1,
            solid: false,
            draggable: false,
            layer: 0,
            id: 1
        },
        StairsSpawn: {
            image: "DebugSpawn",
            size: 2,
            solid: false,
            draggable: false,
            onCollision: 0,
            layer: 1,
            id: 2
        },
        StairsExit: {
            image: "DebugExit",
            size: 2,
            solid: false,
            draggable: false,
            onCollision: 0,
            layer: 1,
            id: 3
        }
    }
}

let Layers = {
    Void: -1,
    Floor: 0,
    Objects: 1,
    Walls: 2
}



let Blueprints = {
    Lobby: null,
    TestArea: null,
    Tutorial: [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0]
    ],
    Start: null
}

let layout = []
let WorldItems = [];

const Items = {
    Money: {
        id: 1,
        image: "Money",
        stackable: true
    },
    Coffee: {
        id: 2,
        image: "Coffee",
        stackable: true
    }
};

function RandomGenerator(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function SpawnItem(x, y, itemData) {
    WorldItems.push({
        position: { x, y },
        size: 64,
        item: itemData,
        hitbox: {
            type: "circle",
            x: x,
            y: y,
            radius: 32
        }
    });
}

let selection = null

function Select(Tile1, Tile2) {
    selection = {
        minX: Math.min(Tile1.x, Tile2.x),
        minY: Math.min(Tile1.y, Tile2.y),
        maxX: Math.max(Tile1.x, Tile2.x),
        maxY: Math.max(Tile1.y, Tile2.y)
    };
}

function ClearSelect() {
    selection = null;
}

function CopySelect() {
    if (!selection) return [];

    const { minX, minY, maxX, maxY } = selection;
    let Copy = [];

    for (let y = minY; y <= maxY; y++) {
        let row = [];
        for (let x = minX; x <= maxX; x++) {
            const tile = layout[y]?.[x];
            row.push(tile && typeof tile === "object" ? tile.type : tile ?? -1);
        }
        Copy.push(row);
    }

    return Copy;
}

function DrawSelection() {
    if (!selection) return;

    const { minX, minY, maxX, maxY } = selection;

    const startX = minX * World.TileSize - Debug.Camera.world.x + Debug.Camera.screen.x;
    const startY = minY * World.TileSize - Debug.Camera.world.y + Debug.Camera.screen.y;
    const width  = (maxX - minX + 1) * World.TileSize;
    const height = (maxY - minY + 1) * World.TileSize;

    ctx.save();
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 4;
    ctx.strokeRect(startX, startY, width, height);
    ctx.restore();
}

function RandomGenerator(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

Stats = new Proxy(Stats, {
    set(target, property, value) {
        if (property === 'Floor' && target.Floor !== value) {
            target.Floor = value;
            console.log(`Floor vaihtui: ${value}`);
            if (value === "Lobby") {
                PrepareFloor(Blueprints.Lobby, value)
            } else if (value === "TestArea") {
                PrepareFloor(Blueprints.TestArea, value)
            } else if (value === -1) {
                PrepareFloor(Blueprints.Tutorial, value)
            } else if (value === 0) {
                PrepareFloor(Blueprints.Tutorial, value)
            } else if (value >= 1 && value <= 9) {
                PrepareFloor(null, value)
            }
            return true;
        }
        target[property] = value;
        return true;
    }
})

function PrepareFloor(Blueprint, Floor) {

    layout = [];

    if (Blueprint) {
        layout = Blueprint.map(row => [...row]);
    }
    BuildFloor()
}

function BuildFloor() {
    Structures.Tiles = [];

    for (let y = 0; y < layout.length; y++) {
        for (let x = 0; x < layout[y].length; x++) {
            const cell = layout[y][x];
            const typeId = (cell && typeof cell === 'object') ? cell.type : cell;
            let typeKey = null;

            for (const key in Structures.Types) {
                if (Structures.Types[key].id === typeId) {
                    typeKey = key;
                    break;
                }
            }

            if (typeKey) {
                const tile = {
                    type: typeKey,
                    x: x,
                    y: y,
                    worldX: x * World.TileSize,
                    worldY: y * World.TileSize,
                    layer: Structures.Types[typeKey].layer
                };

                const type = Structures.Types[typeKey];

                if (type.solid) {
                    tile.hitbox = {
                        type: "rect",
                        x: tile.worldX + World.TileSize / 2,
                        y: tile.worldY + World.TileSize / 2,
                        width: World.TileSize,
                        height: World.TileSize,
                        solid: true
                    };
                } else {
                    tile.hitbox = {
                        type: "rect",
                        x: tile.worldX + World.TileSize / 2,
                        y: tile.worldY + World.TileSize / 2,
                        width: World.TileSize,
                        height: World.TileSize,
                        solid: false
                    };
                }

                Structures.Tiles.push(tile);
            }
        }
    }
    console.log(`Lattia rakennettu: ${Structures.Tiles.length} ruutua`);
}

function GetRenderArea() {

    const tilesX = Math.ceil(canvas.width / World.TileSize)
    const tilesY = Math.ceil(canvas.height / World.TileSize)

    const overscan = 1.5

    const renderX = Math.ceil(tilesX * overscan)
    const renderY = Math.ceil(tilesY * overscan)

    const camTileX = Math.floor(Debug.Camera.world.x / World.TileSize)
    const camTileY = Math.floor(Debug.Camera.world.y / World.TileSize)

    const startX = camTileX - Math.floor(renderX / 2)
    const startY = camTileY - Math.floor(renderY / 2)

    const endX = camTileX + Math.floor(renderX / 2)
    const endY = camTileY + Math.floor(renderY / 2)

    return { startX, startY, endX, endY }
}

function DrawStructures(layer) {
    const { startX, startY, endX, endY } = GetRenderArea();

    for (let tile of Structures.Tiles) {
        if (!tile.origin) continue;
        if (tile.layer !== layer) continue;
        if (tile.x < startX || tile.x > endX || tile.y < startY || tile.y > endY) continue;

        const type = Structures.Types[tile.type];
        const screenX = tile.worldX - Debug.Camera.world.x + Debug.Camera.screen.x;
        const screenY = tile.worldY - Debug.Camera.world.y + Debug.Camera.screen.y;

        const img = images[type.image];
        if (img) {
            ctx.drawImage(
                img,
                screenX,
                screenY,
                type.size * World.TileSize,
                type.size * World.TileSize
            );
        }
    }
}

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



function TrackPlayerHitbox() {
    return {
        type: "circle",
        x: Player.position.x,
        y: Player.position.y,
        radius: Player.size * Player.hitbox.size,
        angle: Player.hitbox.angle
    }
}

function collideCircleCircle(TargetA,TargetB){

    const dx = TargetA.x - TargetB.x;
    const dy = TargetA.y - TargetB.y;
    const radius = TargetA.radius + TargetB.radius;

    return dx*dx + dy*dy <= radius*radius;
}

function collideRectRect(TargetA,TargetB){

    return Math.abs(TargetA.x-TargetB.x)*2 < (TargetA.width+TargetB.width) &&
           Math.abs(TargetA.y-TargetB.y)*2 < (TargetA.height+TargetB.height);
}

function collideCircleRect(circle,rect){

    const closestX = Math.max(
        rect.x - rect.width/2,
        Math.min(circle.x, rect.x + rect.width/2)
    );

    const closestY = Math.max(
        rect.y - rect.height/2,
        Math.min(circle.y, rect.y + rect.height/2)
    );

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;

    return dx*dx + dy*dy <= circle.radius*circle.radius;
}

function Collision(Target1, Target2) {

    if(!Target1 || !Target2) return false;

    if(Target1.type==="circle" && Target2.type==="circle")
        return collideCircleCircle(Target1,Target2);

    if(Target1.type==="rect" && Target2.type==="rect")
        return collideRectRect(Target1,Target2);

    if(Target1.type==="circle" && Target2.type==="rect")
        return collideCircleRect(Target1,Target2);

    if(Target1.type==="rect" && Target2.type==="circle")
        return collideCircleRect(Target2,Target1);

    return false;
}

Player.Godmode = false

function Effect() {
    const playerHitbox = TrackPlayerHitbox();

    for (let tile of Structures.Tiles) {
        if (!tile.hitbox) continue;

        if (Collision(playerHitbox, tile.hitbox)) {
            const type = Structures.Types[tile.type];
            if (!Player.Godmode) {
                if (type.onCollision) {
                    type.onCollision(tile, Player);
                }

                if (type.solid) {
                    const DistanceX = Player.position.x - tile.hitbox.x;
                    const DistanceY = Player.position.y - tile.hitbox.y;

                    const overlapX = playerHitbox.radius + tile.hitbox.width / 2 - Math.abs(DistanceX);
                    const overlapY = playerHitbox.radius + tile.hitbox.height / 2 - Math.abs(DistanceY);

                    if (overlapX > 0 && overlapY > 0) {
                        if (overlapX < overlapY) {
                            Player.position.x += DistanceX > 0 ? overlapX : -overlapX;
                            Player.velocity.x *= -1; 
                        } else {
                            Player.position.y += DistanceY > 0 ? overlapY : -overlapY;
                            Player.velocity.y = -1; 
                        }
                    }
                }
            }
        }
    }
}

function TeleportPlayer(x, y) {
    Player.position.x = x
    Player.position.y = y
}

function Godmode() {
    if (!Player.Godmode) {
        Player.Godmode = true
    } else {
        Player.Godmode = false
    }
}

let input = {
    leftclick: false,
    rightclick: false,
    left: false,
    right: false,
    up: false,
    down: false,
    grab: false
}

function getTileAtWorld(x, y) {
    const tileX = Math.floor(x / World.TileSize);
    const tileY = Math.floor(y / World.TileSize);

    if (tileX < 0 || tileY < 0 || tileX >= World.Size || tileY >= World.Size) {
        return null;
    }

    return layout[tileY][tileX] ?? null;
}

let isColliding = false;

function Void() {
    const playerHitbox = TrackPlayerHitbox();
    
    for (let tile of Structures.Tiles) {
        if (!tile.hitbox) continue;

        if (Collision(playerHitbox, tile.hitbox)) {
            isColliding = true;
            break;
        }
        
    }

    if (!isColliding) {
        console.log("u r ded");
    }
}

function PickupCheck() {
    const playerHitbox = TrackPlayerHitbox();

    for (let i = WorldItems.length - 1; i >= 0; i--) {

        if (Collision(playerHitbox, WorldItems[i].hitbox)) {

            const added = Inventory.add(WorldItems[i].item, 1);

            if (added) {
                WorldItems.splice(i, 1);
            }
        }
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "w") input.up = true;
    if (e.key === "a") input.left = true;
    if (e.key === "s") input.down = true;
    if (e.key === "d") input.right = true;
    if (e.key === "i") {
    Player.Inventory.open = !Player.Inventory.open
    if (e.key === "e") input.grab = true;

    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "w") input.up = false;
    if (e.key === "a") input.left = false;
    if (e.key === "s") input.down = false;
    if (e.key === "d") input.right = false;
    if (e.key === "e") input.grab = false;

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

    Player.velocity.x *= Math.max(0.5, 1 - Player.weight / 1000)
    Player.velocity.y *= Math.max(0.5, 1 - Player.weight / 1000)

    Player.position.x += Player.velocity.x
    Player.position.y += Player.velocity.y
    
}


function DrawWorldItems() {
    for (let worldItem of WorldItems) {

        const screenX = worldItem.position.x - Debug.Camera.world.x + Debug.Camera.screen.x;
        const screenY = worldItem.position.y - Debug.Camera.world.y + Debug.Camera.screen.y;

        ctx.drawImage(
            images[worldItem.item.image] || createPlaceholder(64),
            screenX - worldItem.size / 2,
            screenY - worldItem.size / 2,
            worldItem.size,
            worldItem.size
        );

        if (input.grab && Player.Inventory.items.length === 0) {

            const playerHitbox = TrackPlayerHitbox();

            for (let tile of Structures.Tiles) {

                if (!tile.hitbox) continue;
                if (!tile.hitbox.solid) continue;

                const dx = tile.hitbox.x - Player.position.x;
                const dy = tile.hitbox.y - Player.position.y;

                const distance = Math.hypot(dx, dy);

                if (distance < 150) { 
                    Player.velocity.x += dx * 0.02;
                    Player.velocity.y += dy * 0.02;
                }
            }
        }
    }
}

function DrawEnemies() {
    for (let enemy of Enemies) {

        const screenX = enemy.position.x - Debug.Camera.world.x + Debug.Camera.screen.x;
        const screenY = enemy.position.y - Debug.Camera.world.y + Debug.Camera.screen.y;

        ctx.drawImage(
            images[enemy.image] || createPlaceholder(enemy.size),
            screenX - enemy.size / 2,
            screenY - enemy.size / 2,
            enemy.size,
            enemy.size
        );
    }
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

let EditorPad = {
    Position: { x: 0, y: 0 },
    Size: 256,
    Body: "black",
    Outline: { 
        Color: "cyan",
        Size: 8
    },
    
    Scroll: {
        offset: 0,
        speed: 32,
        max: 0
    },
    Slots: {
        Body: "black",
        Outline: { 
            Color: "white",
            Size: 2
        },
        size: 32,
        gap: 8,
        columns: 6
    }
}

let isDragging = false;
let dragType = null;

canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = Math.floor((Debug.Camera.world.x - Debug.Camera.screen.x + mouseX) / World.TileSize);
    const worldY = Math.floor((Debug.Camera.world.y - Debug.Camera.screen.y + mouseY) / World.TileSize);

    if (e.button === 0 && EditorPad.Selected) {
        BuildTile({ x: worldX, y: worldY }, EditorPad.Selected);
        isDragging = true;
        dragType = "build";
    } else if (e.button === 2) {
        RemoveTile({ x: worldX, y: worldY });
        isDragging = true;
        dragType = "erase";
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDragging || !dragType) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = Math.floor((Debug.Camera.world.x - Debug.Camera.screen.x + mouseX) / World.TileSize);
    const worldY = Math.floor((Debug.Camera.world.y - Debug.Camera.screen.y + mouseY) / World.TileSize);

    if (dragType === "erase") {
        RemoveTile({ x: worldX, y: worldY });
    } else if (dragType === "build" && EditorPad.Selected) {
        BuildTile({ x: worldX, y: worldY }, EditorPad.Selected);
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    dragType = null;
});

function RemoveTile(Position) {
    const x = Position.x;
    const y = Position.y;

    const typeId = layout[y]?.[x];
    if (typeId === undefined || typeId === -1) return;

    const tile = Structures.Tiles.find(t =>
        t.origin &&
        x >= t.originPos.x && x < t.originPos.x + Structures.Types[t.type].size &&
        y >= t.originPos.y && y < t.originPos.y + Structures.Types[t.type].size
    );

    if (!tile) return;

    const startX = tile.originPos.x;
    const startY = tile.originPos.y;
    const type = Structures.Types[tile.type];

    for (let dy = 0; dy < type.size; dy++) {
        for (let dx = 0; dx < type.size; dx++) {
            const tx = startX + dx;
            const ty = startY + dy;
            if (layout[ty]) layout[ty][tx] = -1;
        }
    }

    Structures.Tiles = Structures.Tiles.filter(t =>
        !(t.originPos && t.originPos.x === startX && t.originPos.y === startY)
    );
}

function EditorMode() {
    if (Stats.Floor !== "TestArea") return;

    const pad = EditorPad;
    const slot = pad.Slots;
    const typeEntries = Object.entries(Structures.Types);

    ctx.save();

    ctx.fillStyle = pad.Body;
    ctx.fillRect(pad.Position.x, pad.Position.y, pad.Size, pad.Size);

    ctx.strokeStyle = pad.Outline.Color;
    ctx.lineWidth = pad.Outline.Size;
    ctx.strokeRect(pad.Position.x, pad.Position.y, pad.Size, pad.Size);

    const slotFullSize = slot.size + slot.gap;
    const usableHeight = pad.Size - pad.Outline.Size * 2;
    const visibleRows = Math.floor(usableHeight / slotFullSize);

    const totalRows = Math.ceil(typeEntries.length / slot.columns);
    pad.Scroll.max = Math.max(0, totalRows - visibleRows);

    const firstVisibleRow = Math.floor(pad.Scroll.offset / slotFullSize);

    let typeIndex = firstVisibleRow * slot.columns;

    for (let row = 0; row < visibleRows + 1; row++) {
        for (let col = 0; col < slot.columns; col++) {
            if (typeIndex >= typeEntries.length) break;

            const drawX = pad.Position.x + pad.Outline.Size + col * slotFullSize;
            const drawY = pad.Position.y + pad.Outline.Size + row * slotFullSize - (pad.Scroll.offset % slotFullSize);

            const [name, data] = typeEntries[typeIndex];

            ctx.fillStyle = slot.Body;
            ctx.fillRect(drawX, drawY, slot.size, slot.size);

            ctx.strokeStyle = slot.Outline.Color;
            ctx.lineWidth = slot.Outline.Size;
            ctx.strokeRect(drawX, drawY, slot.size, slot.size);

            const img = images[data.image];
            if (img) {
                ctx.drawImage(img, drawX, drawY, slot.size, slot.size);
            } else {
                ctx.fillStyle = "red";
                ctx.fillRect(drawX + 4, drawY + 4, slot.size - 8, slot.size - 8);
            }

            typeIndex++;
        }
    }

    if (Debug.Cursor.x && Debug.Cursor.y && EditorPad.Selected) {
        const mouse = { x: Debug.Cursor.x, y: Debug.Cursor.y };
        const worldX = Math.floor((Debug.Camera.world.x - Debug.Camera.screen.x + mouse.x) / World.TileSize);
        const worldY = Math.floor((Debug.Camera.world.y - Debug.Camera.screen.y + mouse.y) / World.TileSize);

        const tileType = Structures.Types[EditorPad.Selected];
        if (tileType) {
            const img = images[tileType.image];
            if (img) {
                ctx.globalAlpha = 0.5;
                ctx.drawImage(
                    img,
                    worldX * World.TileSize - Debug.Camera.world.x + Debug.Camera.screen.x,
                    worldY * World.TileSize - Debug.Camera.world.y + Debug.Camera.screen.y,
                    World.TileSize * tileType.size,
                    World.TileSize * tileType.size
                );
                ctx.globalAlpha = 1;
            }
        }
    }

    ctx.restore();
}



canvas.addEventListener("mousedown", (e) => {
    if (Stats.Floor !== "TestArea") return;

    const pad = EditorPad;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (
        mouseX >= pad.Position.x &&
        mouseX <= pad.Position.x + pad.Size &&
        mouseY >= pad.Position.y &&
        mouseY <= pad.Position.y + pad.Size
    ) {
        const slot = pad.Slots;
        const slotFullSize = slot.size + slot.gap;
        const col = Math.floor((mouseX - pad.Position.x - pad.Outline.Size) / slotFullSize);
        const row = Math.floor((mouseY - pad.Position.y - pad.Outline.Size + pad.Scroll.offset) / slotFullSize);

        const typeEntries = Object.entries(Structures.Types);
        const index = row * slot.columns + col;

        if (index >= 0 && index < typeEntries.length) {
            EditorPad.Selected = typeEntries[index][0];
        }
        return;
    }

    if (!EditorPad.Selected) return;

    const worldX = Math.floor((Debug.Camera.world.x - Debug.Camera.screen.x + mouseX) / World.TileSize);
    const worldY = Math.floor((Debug.Camera.world.y - Debug.Camera.screen.y + mouseY) / World.TileSize);

    const type = Structures.Types[EditorPad.Selected];
    if (!type) return;

    BuildTile({ x: worldX, y: worldY }, EditorPad.Selected);
});

function BuildTile(Position, TileKey) {
    const type = Structures.Types[TileKey];
    if (!type) return;

    const startX = Position.x;
    const startY = Position.y;

    for (let y = 0; y < type.size; y++) {
        for (let x = 0; x < type.size; x++) {
            const tx = startX + x;
            const ty = startY + y;
            if (layout[ty]?.[tx] !== undefined && layout[ty][tx] !== -1) {
                return;
            }
        }
    }

    for (let y = 0; y < type.size; y++) {
        if (!layout[startY + y]) layout[startY + y] = [];
    }

    for (let y = 0; y < type.size; y++) {
        for (let x = 0; x < type.size; x++) {
            const tx = startX + x;
            const ty = startY + y;
            layout[ty][tx] = type.id;

            const worldX = tx * World.TileSize;
            const worldY = ty * World.TileSize;

            Structures.Tiles.push({
                type: TileKey,
                x: tx,
                y: ty,
                origin: x === 0 && y === 0,
                originPos: { x: startX, y: startY },
                worldX,
                worldY,
                layer: type.layer,
                hitbox: {
                    type: "rect",
                    x: worldX + World.TileSize / 2,
                    y: worldY + World.TileSize / 2,
                    width: World.TileSize,
                    height: World.TileSize,
                    solid: type.solid
                }
            });
        }
    }

}

function DrawInventory() {
    const size = 64 
    const padding = 10
    const startX = canvas.width / 2 - (size * Player.Inventory.maxSlots) / 2
    const startY = canvas.height - 150

    
    ctx.fillStyle = "rgba(0,0,0,0.7)"
    ctx.fillRect(startX - padding, startY - padding, size * Player.Inventory.maxSlots + padding * 2, size + padding * 2)

    
    for (let i = 0; i < Player.Inventory.maxSlots; i++) {
        const slot = Player.Inventory.items[i]
        ctx.strokeStyle = "white"
        ctx.strokeRect(startX + i * size, startY, size, size)

        if (slot) {
            const img = images[slot.item.image] || createPlaceholder(size)
            ctx.drawImage(img, startX + i * size, startY, size, size)
        }
    }
}

function TrackPlayer() {
    Debug.Camera.world.x = Player.position.x;
    Debug.Camera.world.y = Player.position.y;
}

function ShowUI() {
    Healthbar()
    Money()
    Floor()
    Points()
    DrawInventory()
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

function UpdateEnemies() {
    for (let enemy of Enemies) {
        const dx = Player.position.x - enemy.position.x
        const dy = Player.position.y - enemy.position.y
        const distance = Math.hypot(dx, dy)

        if (distance < enemy.aggroRange) { // seuraa pelaajaa
            const dirX = dx / distance
            const dirY = dy / distance

            enemy.velocity.x += dirX * enemy.speed
            enemy.velocity.y += dirY * enemy.speed
        }

        // hidastetaan liike hiukan
        enemy.velocity.x *= 0.9
        enemy.velocity.y *= 0.9

        enemy.position.x += enemy.velocity.x
        enemy.position.y += enemy.velocity.y
    }
}

function EnemyCombat() {
    const playerHitbox = TrackPlayerHitbox()
    for (let enemy of Enemies) {
        const enemyHitbox = {
            type: "circle",
            x: enemy.position.x,
            y: enemy.position.y,
            radius: enemy.hitbox.radius
        }

        if (Collision(playerHitbox, enemyHitbox)) {
            const now = Date.now()
            if (!enemy.lastHit) enemy.lastHit = 0

            if (now - enemy.lastHit > 800) {
                Stats.Health -= 10
                enemy.lastHit = now
            }
        }
    }
}

function gameloop() {

    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.save()

    TrackPlayer()
    Effect()
    Void()
    MovePlayer()
    UpdateEnemies()
    EnemyCombat()
    for (let layerKey in Layers) {
        DrawStructures(Layers[layerKey])
    }

    DrawWorldItems();
    DrawEnemies();
    DrawPlayer()
    
    if (DebugEnabled) DebugMode()
    if (Stats.Floor === "TestArea") EditorMode()

    ShowUI()
   
    PickupCheck();

    DrawSelection()

    ctx.restore()

    requestAnimationFrame(gameloop)
}

