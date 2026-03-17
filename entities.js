// entities.js - Luokat pelin dynaamisille olioille
import { enemyProjectiles } from './engine.js';
import { images } from './assets.js';
import { Debug, attributes } from './config.js';

export class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.veloicity = { x: 0, y: 0 }
        this.type = type;
        this.health = 100;
        this.speed = 2;
        this.size = 30;
        this.color = 'white';
        this.shootTimer = 0;
        this.specialAttackTimer = 0;
        this.phase = 'normal'; 
        this.isBoss = false;
        
        this.initType();
    }

    initType() {
        const types = {
            'Rookie': { health: 80, speed: 2.2, color: '#3498db' },
            'Gatekeeper': { health: 120, speed: 0.5, color: '#9b59b6' },
            'Taser': { health: 70, speed: 1.8, color: '#f1c40f' },
            'Techie': { health: 50, speed: 1.5, color: '#2ecc71' },
            'HR_Boss': { health: 1000, speed: 1.2, color: '#e74c3c', size: 80, isBoss: true },
            'Janitor': { health: 150, speed: 2.5, color: '#95a5a6' }
        };
        Object.assign(this, types[this.type] || {});
    }

    update(playerX, playerY) {
        let dx = playerX - this.x;
        let dy = playerY - this.y;
        let d = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx);

        if (this.isBoss) {
            this.handleBossAI(playerX, playerY, d, angle);
        } else if (this.type === 'Taser') {
            this.shootTimer++;
            if (this.shootTimer > 120) {
                this.shootEnemyProjectile(playerX, playerY);
                this.shootTimer = 0;
            }
            // Taser pitää etäisyyttä
            if (d < 200) this.move(angle, -1);
            else if (d > 250) this.move(angle, 1);
        } else {
            // Perusviholliset vain jahtaavat
            this.move(angle, 1);
        }
    }

    handleBossAI(px, py, d, angle) {
        this.shootTimer++;
        this.specialAttackTimer++;

        // 1. Sarjatuli (noin 2 sekunnin välein)
        if (this.shootTimer > 120) {
            this.shootEnemyProjectile(px, py);
            if (this.shootTimer > 140) this.shootTimer = 0;
        }

        // 2. Nova-hyökkäys (noin 5 sekunnin välein)
        if (this.specialAttackTimer > 300) {
            this.bossNovaAttack();
            this.specialAttackTimer = 0;
        }

        // 3. Liikkuminen: ryntää jos pelaaja on lähellä
        if (d < 150) {
            this.speed = 4; // Ryntäys
            this.move(angle, 1);
        } else {
            this.speed = 1.2; // Normaali hidas liike
            this.move(angle, 1);
        }
    }

    bossNovaAttack() {
        for (let i = 0; i < 12; i++) {
            let novaAngle = (Math.PI * 2 / 12) * i;
            enemyProjectiles.push(new EnemyProjectile(this.x, this.y, novaAngle));
        }
    }

    move(angle, direction) {
        this.x += Math.cos(angle) * this.speed * direction;
        this.y += Math.sin(angle) * this.speed * direction;
    }

    shootEnemyProjectile(px, py) {
        let angle = Math.atan2(py - this.y, px - this.x);
        enemyProjectiles.push(new EnemyProjectile(this.x, this.y, angle));
    }

    draw(ctx) {
        ctx.save();
        let imgName = this.isBoss ? "Guard" : "Employee"; 
        let img = images[imgName];

        if (img) {
            ctx.drawImage(img, this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
        ctx.restore();
    }
}

export class Projectile {
    constructor(x, y, angle, type) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.type = type;

        // oletusasetukset tyypin mukaan
        if (type === "Bullet") {
            this.speed = 10;
            this.size = 8;
            this.damage = 25;
            this.arc = Math.PI * 2
            
        } else if (type === "Slash") {
            this.speed = 0
            this.size = 100 * (1 + (Math.min(attributes.STR * 0.01, 8)))
            this.damage = 25 * (1 + (attributes.STR * 0.1))

            this.arc = Math.PI
            this.duration = 30
            this.progress = this.duration

            this.baseAngle = angle
        }
        this.alive = true; // onko projectile olemassa
    }
    
    update(walls) {
        
        if (this.type === "Bullet") {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
        }

        walls.forEach(wall => {
            if (this.x > wall.x && this.x < wall.x + wall.w &&
                this.y > wall.y && this.y < wall.y + wall.h) {
                this.alive = false;
            }
        });
    }
        
    draw(ctx) {
        ctx.save()

        if (this.type === "Bullet") {
            ctx.fillStyle = "yellow"
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, this.arc)
            ctx.fill();
        } else if (this.type === "Slash") {
            ctx.save()

            this.progress--

            if (this.progress <= 0) {
                this.alive = false
            }

            // animaation vaihe
            let t = 1 - (this.progress / this.duration)

            let start = this.baseAngle - this.arc / 2
            let end = this.baseAngle + this.arc / 2

            this.angle = start + (end - start) * t

            ctx.translate(Debug.Player.world.x, Debug.Player.world.y)
            ctx.rotate(this.angle)
            ctx.drawImage(images["BatSword"], 0, -this.size, this.size, this.size)
            ctx.restore()
        }
        
        
        ctx.restore()
    }
}

export class EnemyProjectile {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 5;
        this.size = 6;
        this.alive = true;
        this.damage = 10;
    }

    update(walls) {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        walls.forEach(wall => {
            if (this.x > wall.x && this.x < wall.x + wall.w &&
                this.y > wall.y && this.y < wall.y + wall.h) {
                this.alive = false;
            }
        });
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "#00ffff"; 
        ctx.shadowBlur = 10;
        ctx.shadowColor = "cyan";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}