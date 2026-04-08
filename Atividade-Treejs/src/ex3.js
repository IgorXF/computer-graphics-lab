// src/main.js
import * as THREE from 'three';

// ─── Cena ─────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// ─── Câmera ortográfica (visão 2D frontal) ────────────────────────────────────
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 10;
const camera = new THREE.OrthographicCamera(
  (-frustumSize * aspect) / 2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  -frustumSize / 2,
  0.1,
  100
);
camera.position.z = 10;

// ─── Renderizador ─────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ─── Limites do campo ─────────────────────────────────────────────────────────
const halfW = (frustumSize * aspect) / 2; // ex: ~8.9
const halfH = frustumSize / 2;            // 5

// ─── Paddle esquerdo ──────────────────────────────────────────────────────────
const paddleGeo = new THREE.PlaneGeometry(0.3, 2);
const paddleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

const paddleLeft = new THREE.Mesh(paddleGeo, paddleMat);
paddleLeft.position.set(-halfW + 1.5, 0, 0);
scene.add(paddleLeft);

// ─── Paddle direito ───────────────────────────────────────────────────────────
const paddleRight = new THREE.Mesh(paddleGeo, paddleMat);
paddleRight.position.set(halfW - 1.5, 0, 0);
scene.add(paddleRight);

// ─── Bolinha vermelha ─────────────────────────────────────────────────────────
const ballGeo = new THREE.CircleGeometry(0.18, 32);
const ballMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const ball = new THREE.Mesh(ballGeo, ballMat);
ball.position.set(0, 0, 0);
scene.add(ball);

// ─── Estado da bolinha ────────────────────────────────────────────────────────
const ballSpeed = 5;
let vx = ballSpeed;
let vy = ballSpeed * 0.6;

// ─── IA simples dos paddles ───────────────────────────────────────────────────
const paddleSpeed = 4;
const paddleHalfH = 1;      // metade da altura do paddle
const paddleBound = halfH - paddleHalfH;

// ─── Clock ────────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

// ─── Responsividade ───────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const a = window.innerWidth / window.innerHeight;
  camera.left   = (-frustumSize * a) / 2;
  camera.right  = ( frustumSize * a) / 2;
  camera.top    =  frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Loop de animação ─────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  // Mover bolinha
  ball.position.x += vx * dt;
  ball.position.y += vy * dt;

  // Rebater nas paredes superior/inferior
  if (ball.position.y >= halfH - 0.18) {
    ball.position.y = halfH - 0.18;
    vy = -Math.abs(vy);
  }
  if (ball.position.y <= -halfH + 0.18) {
    ball.position.y = -halfH + 0.18;
    vy = Math.abs(vy);
  }

  // Rebater no paddle esquerdo
  if (
    vx < 0 &&
    ball.position.x <= paddleLeft.position.x + 0.25 &&
    ball.position.x >= paddleLeft.position.x - 0.15 &&
    Math.abs(ball.position.y - paddleLeft.position.y) < paddleHalfH + 0.18
  ) {
    vx = Math.abs(vx);
    // pequena variação no ângulo conforme onde bateu no paddle
    const hit = (ball.position.y - paddleLeft.position.y) / paddleHalfH;
    vy = hit * ballSpeed;
  }

  // Rebater no paddle direito
  if (
    vx > 0 &&
    ball.position.x >= paddleRight.position.x - 0.25 &&
    ball.position.x <= paddleRight.position.x + 0.15 &&
    Math.abs(ball.position.y - paddleRight.position.y) < paddleHalfH + 0.18
  ) {
    vx = -Math.abs(vx);
    const hit = (ball.position.y - paddleRight.position.y) / paddleHalfH;
    vy = hit * ballSpeed;
  }

  // Reset se sair pelas laterais
  if (ball.position.x > halfW + 1 || ball.position.x < -halfW - 1) {
    ball.position.set(0, 0, 0);
    vx = ball.position.x > 0 ? -ballSpeed : ballSpeed;
    vy = (Math.random() - 0.5) * ballSpeed;
  }

  // IA: paddles seguem a bolinha suavemente
  const followLeft  = ball.position.y - paddleLeft.position.y;
  const followRight = ball.position.y - paddleRight.position.y;

  paddleLeft.position.y  += Math.sign(followLeft)  * Math.min(paddleSpeed * dt, Math.abs(followLeft));
  paddleRight.position.y += Math.sign(followRight) * Math.min(paddleSpeed * dt, Math.abs(followRight));

  // Clampar paddles dentro do campo
  paddleLeft.position.y  = THREE.MathUtils.clamp(paddleLeft.position.y,  -paddleBound, paddleBound);
  paddleRight.position.y = THREE.MathUtils.clamp(paddleRight.position.y, -paddleBound, paddleBound);

  renderer.render(scene, camera);
}

animate();