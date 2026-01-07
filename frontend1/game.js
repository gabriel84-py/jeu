// Configuration du jeu
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');

// Ajuster la taille du canvas
canvas.width = 800;
canvas.height = 600;

// État du jeu
let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
let score = 0;
let health = 100;
let keys = {};
let mouse = { x: 0, y: 0 };

// Personnage
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 5,
    color: '#4CAF50'
};

// Projectiles
const bullets = [];

// Zombies
const zombies = [];
let zombieSpawnTimer = 0;
let zombieSpawnInterval = 60; // Frames entre chaque spawn

// Particules pour les effets
const particles = [];

// Classe Bullet
class Bullet {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.speed = 10;
        this.color = '#FFD700';
        
        // Calculer la direction
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Classe Zombie
class Zombie {
    constructor() {
        // Spawn depuis un côté aléatoire
        const side = Math.floor(Math.random() * 4);
        switch(side) {
            case 0: // Haut
                this.x = Math.random() * canvas.width;
                this.y = -30;
                break;
            case 1: // Droite
                this.x = canvas.width + 30;
                this.y = Math.random() * canvas.height;
                break;
            case 2: // Bas
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 30;
                break;
            case 3: // Gauche
                this.x = -30;
                this.y = Math.random() * canvas.height;
                break;
        }
        
        this.radius = 25;
        this.speed = 1 + Math.random() * 1.5;
        this.color = '#8B4513';
        this.health = 1;
    }
    
    update() {
        // Se diriger vers le joueur
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    
    draw() {
        // Corps du zombie
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Yeux rouges
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(this.x - 8, this.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Classe Particle
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 30;
        this.maxLife = 30;
        this.color = color;
        this.size = Math.random() * 4 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Gestion des entrées
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault();
        shoot();
    }
    if (e.key === 'Enter' && gameState === 'menu') {
        startGame();
    }
    if (e.key === 'Enter' && gameState === 'gameOver') {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
    if (gameState === 'playing') {
        shoot();
    } else if (gameState === 'menu') {
        startGame();
    } else if (gameState === 'gameOver') {
        resetGame();
    }
});

// Fonction de tir
function shoot() {
    const bullet = new Bullet(player.x, player.y, mouse.x, mouse.y);
    bullets.push(bullet);
}

// Fonction pour démarrer le jeu
function startGame() {
    gameState = 'playing';
    score = 0;
    health = 100;
    zombies.length = 0;
    bullets.length = 0;
    particles.length = 0;
    zombieSpawnTimer = 0;
    zombieSpawnInterval = 60;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
}

// Fonction pour réinitialiser le jeu
function resetGame() {
    startGame();
}

// Mise à jour du jeu
function update() {
    if (gameState !== 'playing') return;
    
    // Déplacement du joueur
    if (keys['w'] || keys['arrowup']) {
        player.y = Math.max(player.radius, player.y - player.speed);
    }
    if (keys['s'] || keys['arrowdown']) {
        player.y = Math.min(canvas.height - player.radius, player.y + player.speed);
    }
    if (keys['a'] || keys['arrowleft']) {
        player.x = Math.max(player.radius, player.x - player.speed);
    }
    if (keys['d'] || keys['arrowright']) {
        player.x = Math.min(canvas.width - player.radius, player.x + player.speed);
    }
    
    // Mise à jour des zombies
    zombieSpawnTimer++;
    if (zombieSpawnTimer >= zombieSpawnInterval) {
        zombies.push(new Zombie());
        zombieSpawnTimer = 0;
        // Augmenter la difficulté progressivement
        if (zombieSpawnInterval > 20) {
            zombieSpawnInterval = Math.max(20, zombieSpawnInterval - 0.5);
        }
    }
    
    zombies.forEach((zombie, zombieIndex) => {
        zombie.update();
        
        // Collision avec le joueur
        const dx = player.x - zombie.x;
        const dy = player.y - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.radius + zombie.radius) {
            health -= 0.5;
            if (health <= 0) {
                gameState = 'gameOver';
            }
        }
    });
    
    // Mise à jour des projectiles
    bullets.forEach((bullet, bulletIndex) => {
        bullet.update();
        
        // Vérifier les collisions avec les zombies
        zombies.forEach((zombie, zombieIndex) => {
            const dx = bullet.x - zombie.x;
            const dy = bullet.y - zombie.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < bullet.radius + zombie.radius) {
                // Collision détectée
                zombies.splice(zombieIndex, 1);
                bullets.splice(bulletIndex, 1);
                score += 10;
                
                // Créer des particules
                for (let i = 0; i < 8; i++) {
                    particles.push(new Particle(zombie.x, zombie.y, '#FF4500'));
                }
            }
        });
        
        // Supprimer les projectiles hors écran
        if (bullet.x < 0 || bullet.x > canvas.width || 
            bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(bulletIndex, 1);
        }
    });
    
    // Mise à jour des particules
    particles.forEach((particle, index) => {
        particle.update();
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
    
    // Mise à jour de l'affichage
    scoreElement.textContent = `Score: ${score}`;
    healthElement.textContent = `Vie: ${Math.max(0, Math.floor(health))}`;
}

// Rendu du jeu
function draw() {
    // Effacer le canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === 'menu') {
        // Écran de menu
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ZOMBIE SURVIVAL', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '24px Arial';
        ctx.fillText('Appuyez sur ENTER ou cliquez pour commencer', canvas.width / 2, canvas.height / 2 + 50);
        ctx.font = '18px Arial';
        ctx.fillText('WASD ou Flèches: Déplacer | Clic ou Espace: Tirer', canvas.width / 2, canvas.height / 2 + 100);
    } else if (gameState === 'gameOver') {
        // Écran de game over
        ctx.fillStyle = '#FF0000';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '32px Arial';
        ctx.fillText(`Score Final: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '24px Arial';
        ctx.fillText('Appuyez sur ENTER ou cliquez pour rejouer', canvas.width / 2, canvas.height / 2 + 80);
    } else if (gameState === 'playing') {
        // Dessiner les particules
        particles.forEach(particle => particle.draw());
        
        // Dessiner les zombies
        zombies.forEach(zombie => zombie.draw());
        
        // Dessiner les projectiles
        bullets.forEach(bullet => bullet.draw());
        
        // Dessiner le joueur
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Dessiner une ligne vers la souris pour indiquer la direction
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// Boucle de jeu
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Démarrer le jeu
gameLoop();
