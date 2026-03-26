const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const messageEl = document.getElementById("message");
const startButton = document.getElementById("start-button");
const GOAL_SCORE = 1000;

const GROUND_Y = 338;
const PLAYER_X = 170;
const player = {
    y: GROUND_Y - 40,
    vy: 0,
    width: 96,
    height: 72,
    jumpPower: -11.2
};

let frame = 0;
let score = 0;
let running = false;
let cleared = false;
let speed = 4.6;
let obstacles = [];
let best = Number(localStorage.getItem("fishRideBest") || 0);

bestEl.textContent = String(best);

function resetGame() {
    frame = 0;
    score = 0;
    speed = 4.6;
    obstacles = [];
    cleared = false;
    player.y = GROUND_Y - 40;
    player.vy = 0;
    scoreEl.textContent = "0";
}

function startGame() {
    resetGame();
    running = true;
    messageEl.textContent = `がんばれ！お前のエラ呼吸をみせてみろ！`;
}

function stopGame() {
    running = false;
    if (score > best) {
        best = score;
        localStorage.setItem("fishRideBest", String(best));
        bestEl.textContent = String(best);
    }
    messageEl.textContent = `ゲームオーバー！学校に行こう。 Score: ${score} / Best: ${best}`;
}

function clearGame() {
    running = false;
    cleared = true;
    if (score > best) {
        best = score;
        localStorage.setItem("fishRideBest", String(best));
        bestEl.textContent = String(best);
    }
    messageEl.textContent = `雄物川にたどり着いたよ！ Score: ${score} / Best: ${best}`;
}

function jump() {
    const onGround = player.y >= GROUND_Y - 40;
    if (onGround) {
        player.vy = player.jumpPower;
    }
}

function spawnObstacle() {
    const h = 40 + Math.random() * 36;
    const w = 28 + Math.random() * 18;
    obstacles.push({
        x: canvas.width + 40,
        y: GROUND_Y - h,
        width: w,
        height: h
    });
}

function collideRect(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function updateGame() {
    if (!running) {
        return;
    }

    frame += 1;
    player.vy += 0.55;
    player.y += player.vy;

    if (player.y > GROUND_Y - 40) {
        player.y = GROUND_Y - 40;
        player.vy = 0;
    }

    if (frame % 88 === 0) {
        spawnObstacle();
    }

    speed += 0.0008;
    obstacles.forEach((obs) => {
        obs.x -= speed;
    });
    obstacles = obstacles.filter((obs) => obs.x + obs.width > -20);

    const hitBox = {
        x: PLAYER_X - 26,
        y: player.y - 30,
        width: 68,
        height: 64
    };

    for (const obs of obstacles) {
        if (collideRect(hitBox, obs)) {
            stopGame();
            break;
        }
    }

    if (running && frame % 7 === 0) {
        score += 1;
        scoreEl.textContent = String(score);
        if (score >= GOAL_SCORE) {
            clearGame();
        }
    }
}

function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#f3f6ff");
    grad.addColorStop(0.56, "#d9fff2");
    grad.addColorStop(1, "#bff0d8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 8; i += 1) {
        const x = ((frame * 0.35) + i * 160) % (canvas.width + 120) - 120;
        const y = 32 + (i % 3) * 24;
        ctx.beginPath();
        ctx.ellipse(x, y, 35, 14, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = "#97dfbb";
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    ctx.fillStyle = "#7ed4aa";
    ctx.fillRect(0, GROUND_Y + 20, canvas.width, canvas.height - GROUND_Y);

    if (cleared) {
        const riverY = GROUND_Y - 8;
        const riverH = 56;
        const riverGrad = ctx.createLinearGradient(0, riverY, 0, riverY + riverH);
        riverGrad.addColorStop(0, "#9be6ff");
        riverGrad.addColorStop(1, "#4fbef0");
        ctx.fillStyle = riverGrad;
        ctx.fillRect(0, riverY, canvas.width, riverH);

        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i += 1) {
            const y = riverY + 10 + i * 11;
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x <= canvas.width; x += 20) {
                ctx.lineTo(x, y + Math.sin((x + frame * 2.3) / 20) * 2.5);
            }
            ctx.stroke();
        }
    }
}

function drawBikeFish() {
    const x = PLAYER_X;
    const y = player.y;

    ctx.strokeStyle = "#5c5860";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x - 22, y + 25, 17, 0, Math.PI * 2);
    ctx.arc(x + 26, y + 25, 17, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 22, y + 25);
    ctx.lineTo(x + 4, y + 4);
    ctx.lineTo(x + 26, y + 25);
    ctx.lineTo(x + 1, y + 25);
    ctx.lineTo(x - 22, y + 25);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + 15, y - 5);
    ctx.moveTo(x - 1, y + 25);
    ctx.lineTo(x - 7, y + 8);
    ctx.stroke();

    ctx.fillStyle = "#ffa8cc";
    ctx.beginPath();
    ctx.ellipse(x, y - 10, 30, 19, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - 28, y - 12);
    ctx.lineTo(x - 50, y - 2);
    ctx.lineTo(x - 28, y + 3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffd86f";
    ctx.beginPath();
    ctx.ellipse(x + 2, y - 16, 9, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#3a3440";
    ctx.beginPath();
    ctx.arc(x + 15, y - 14, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawObstacles() {
    obstacles.forEach((obs) => {
        ctx.fillStyle = "#4fa06f";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = "#7ad89d";
        ctx.fillRect(obs.x + 5, obs.y + 6, obs.width - 10, obs.height - 12);

        ctx.fillStyle = "#ff6cab";
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, obs.y - 7, 7, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawOverlay() {
    if (running) {
        return;
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#6a5762";
    ctx.font = "600 36px 'Cormorant Garamond', serif";
    ctx.textAlign = "center";
    ctx.fillText(cleared ? "Goal! River Reached!" : "FISH! Ride", canvas.width / 2, 165);

    ctx.font = "600 20px 'Shippori Mincho', serif";
    ctx.fillText(
        cleared
            ? "Start / Restart で もう一度チャレンジ"
            : `Start / Restart または 画面クリックで開始 (Goal: ${GOAL_SCORE})`,
        canvas.width / 2,
        205
    );
}

function render() {
    drawBackground();
    drawObstacles();
    drawBikeFish();
    drawOverlay();
}

function gameLoop() {
    updateGame();
    render();
    requestAnimationFrame(gameLoop);
}

function onAction() {
    if (!running) {
        startGame();
        return;
    }
    jump();
}

startButton.addEventListener("click", startGame);
canvas.addEventListener("pointerdown", onAction);
window.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        onAction();
    }
});

gameLoop();
