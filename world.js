// world.js - Pelimaailman staattiset rakenteet

export class Wall {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw(ctx) {
        ctx.fillStyle = "#444"; // Harmaa seinä
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 4;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    }

    // Tarkistaa osuuko jokin piste (pelaaja/ammus) seinään
    collides(px, py, pSize) {
        let half = pSize / 2;
        return (px + half > this.x && px - half < this.x + this.w &&
                py + half > this.y && py - half < this.y + this.h);
    }
}

// Luodaan valmis lista seinistä, jota engine.js ja renderer.js käyttävät
export let walls = [
    new Wall(-500, -500, 1000, 20),  // Yläseinä
    new Wall(-500, 480, 1000, 20),   // Alaseinä
    new Wall(-500, -500, 20, 1000),  // Vasen seinä
    new Wall(480, -500, 20, 1000)    // Oikea seinä
];