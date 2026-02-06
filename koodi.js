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
            image: "../Kuvat/Equipment/Money.png"
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
    
    ctx.fillText(
        `${Stats.Money}`,
        UI.Money.text.x,
        UI.Money.text.y
    )
}

function ShowUI() {
    Healthbar()
    Money()
    // kesken
}

ShowUI()
