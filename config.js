// config.js - Pelin globaali tila ja asetukset

export let isGameOver = false;

export let Stats = {
    MaxHealth: 100,
    Health: 100,
    Money: 100,
    Floor: 0,
    Points: 0
};

export let keys = {};

export let Debug = {
    Player: {
        size: 64,
        world: { x: 0, y: 0 },
        screen: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    },
    Camera: {
        world: { x: 0, y: 0 },
        screen: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        offset: { x: 0, y: 0, distance: 0, max: Infinity },
    },
    Cursor: {
        x: 0,
        y: 0
    }
};

export let Startup = {
    Progress: 0,
    Progressbar: {
        fluid: {
            width: 800,
            height: 100,
            color: "lime",
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        },
        text: {
            font: "Arial",
            size: 80,
            color: "white"
        }
    }
};

export let UI = {
    Healthbar: {
        fluid: {
            width: 400,
            height: 30,
            color: "red",
            x: window.innerWidth / 2,
            y: window.innerHeight / 1.25
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
            x: window.innerWidth / 1.1,
            y: window.innerHeight * 0.3
        },
        icon: {
            size: 128,
            imageName: "Money"
        }
    },
    Floor: {
        text: {
            font: "Arial",
            color: "white",
            size: 40,
            x: window.innerWidth / 1.05,
            y: window.innerHeight * 0.1
        }
    },
    Points: {
        text: {
            font: "Arial",
            color: "white",
            size: 40,
            x: window.innerWidth / 1.05,
            y: window.innerHeight * 0.2
        }
    },
    Debug: {
        Player: { font: "Arial", color: "white", size: 20 },
        Camera: {
            font: "Arial",
            color: "white",
            size: 40,
            location: { x: 20, y: 20 }
        },
        Cursor: { font: "Arial", color: "white", size: 16 }
    }
};

// Funktio isGameOver-tilan muuttamiseen mista tahansa tiedostosta
export function setGameOver(value) {
    isGameOver = value;
}