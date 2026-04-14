
import './style.css'; 
import * as THREE from 'three';

// criação de uma cena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ─── FUNDO ESTRELADO ──────────────────────────────────────
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(5000 * 3);
for (let i = 0; i < starPositions.length; i++) {
  starPositions[i] = (Math.random() - 0.5) * 300;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12 });
const estrelas = new THREE.Points(starGeometry, starMaterial);
scene.add(estrelas);

// ─── TEXTURA DO SOL (canvas procedural) ───────────────────
function criarTexturaSol() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // gradiente de base — centro branco-quente até vermelho escuro nas bordas
  const gradBase = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  gradBase.addColorStop(0.00, '#fffde4');
  gradBase.addColorStop(0.15, '#ffe566');
  gradBase.addColorStop(0.45, '#ff9a00');
  gradBase.addColorStop(0.75, '#e85d00');
  gradBase.addColorStop(1.00, '#7a1500');
  ctx.fillStyle = gradBase;
  ctx.fillRect(0, 0, 512, 512);

  // manchas solares e cintilações procedurais
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 22 + 3;
    const alpha = Math.random() * 0.45;
    const gradMancha = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradMancha.addColorStop(0, `rgba(255, 230, 80, ${alpha})`);
    gradMancha.addColorStop(1, 'rgba(255, 120, 0, 0)');
    ctx.fillStyle = gradMancha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// ─── TEXTURA DA TERRA (canvas procedural) ─────────────────
function criarTexturaTerra() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // oceano base
  ctx.fillStyle = '#1a4f8a';
  ctx.fillRect(0, 0, 512, 512);

  // continentes — formas orgânicas procedurais
  const continentes = [
    // [cx, cy, rx, ry, rotação, cor]
    [160, 180,  80, 55,  0.3,  '#4a7c3f'], // América do Norte
    [175, 290,  45, 65,  0.1,  '#5a8a40'], // América do Sul
    [290, 160,  70, 50, -0.2,  '#6b8c45'], // Europa / África topo
    [310, 250,  55, 80,  0.0,  '#5e7a38'], // África
    [380, 170,  75, 55,  0.4,  '#7a9a50'], // Ásia
    [415, 280,  40, 30,  0.2,  '#6b8c45'], // Oceania
    [105, 460,  60, 25,  0.5,  '#8aaa60'], // Antártida (topo)
  ];

  continentes.forEach(([cx, cy, rx, ry, rot, cor]) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // sombra / costa
    ctx.beginPath();
    ctx.ellipse(3, 3, rx + 4, ry + 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fill();

    // terra principal
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = cor;
    ctx.fill();

    // relevo interno — manchas mais escuras
    for (let i = 0; i < 18; i++) {
      const bx = (Math.random() - 0.5) * rx * 1.4;
      const by = (Math.random() - 0.5) * ry * 1.4;
      const br = Math.random() * 14 + 4;
      const ba = Math.random() * 0.35;
      ctx.beginPath();
      ctx.ellipse(bx, by, br, br * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(30, 60, 20, ${ba})`;
      ctx.fill();
    }

    // neve / vegetação mais clara nas bordas superiores
    ctx.beginPath();
    ctx.ellipse(0, -ry * 0.55, rx * 0.5, ry * 0.22, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220, 240, 200, 0.25)';
    ctx.fill();

    ctx.restore();
  });

  // nuvens procedurais sobre o oceano e continentes
  ctx.globalAlpha = 0.55;
  for (let i = 0; i < 80; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const cr = Math.random() * 35 + 10;
    const gradNuvem = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    gradNuvem.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradNuvem.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradNuvem;
    ctx.beginPath();
    ctx.ellipse(cx, cy, cr, cr * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // calotas polares
  const gradNorte = ctx.createRadialGradient(256, 0, 0, 256, 0, 80);
  gradNorte.addColorStop(0, 'rgba(240, 248, 255, 0.95)');
  gradNorte.addColorStop(1, 'rgba(200, 230, 255, 0)');
  ctx.fillStyle = gradNorte;
  ctx.fillRect(0, 0, 512, 80);

  const gradSul = ctx.createRadialGradient(256, 512, 0, 256, 512, 80);
  gradSul.addColorStop(0, 'rgba(240, 248, 255, 0.95)');
  gradSul.addColorStop(1, 'rgba(200, 230, 255, 0)');
  ctx.fillStyle = gradSul;
  ctx.fillRect(0, 435, 512, 77);

  return new THREE.CanvasTexture(canvas);
}

// ─── SOL ──────────────────────────────────────────────────
const geometrySol = new THREE.SphereGeometry(0.5, 64, 64);
const materialSol = new THREE.MeshBasicMaterial({ map: criarTexturaSol() });
const sol = new THREE.Mesh(geometrySol, materialSol);
scene.add(sol);

// halo do Sol (sprite procedural)
const canvasGlow = document.createElement('canvas');
canvasGlow.width = canvasGlow.height = 128;
const ctxGlow = canvasGlow.getContext('2d');
const gradGlow = ctxGlow.createRadialGradient(64, 64, 0, 64, 64, 64);
gradGlow.addColorStop(0,   'rgba(255, 200, 50, 0.6)');
gradGlow.addColorStop(0.4, 'rgba(255, 130,  0, 0.25)');
gradGlow.addColorStop(1,   'rgba(255,  80,  0, 0)');
ctxGlow.fillStyle = gradGlow;
ctxGlow.fillRect(0, 0, 128, 128);
const halo = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvasGlow),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
);
halo.scale.set(2.8, 2.8, 1);
sol.add(halo);

// ─── ILUMINAÇÃO ───────────────────────────────────────────
const luzSol = new THREE.PointLight(0xfff4cc, 3.0, 80);
scene.add(luzSol);
const luzAmbiente = new THREE.AmbientLight(0x111122, 1.0);
scene.add(luzAmbiente);

// ─── A TERRA ──────────────────────────────────────────────
const geometryTerra = new THREE.SphereGeometry(0.2, 64, 64);
const materialTerra = new THREE.MeshPhongMaterial({
  map: criarTexturaTerra(),
  specular: new THREE.Color(0x226688),
  shininess: 40,
});
const terra = new THREE.Mesh(geometryTerra, materialTerra);
scene.add(terra);

// ─── LINHA DE ÓRBITA ──────────────────────────────────────
const raioOrbita = 2.5;
const pontosOrbita = [];
for (let i = 0; i <= 256; i++) {
  const angulo = (i / 256) * Math.PI * 2;
  pontosOrbita.push(new THREE.Vector3(
    Math.cos(angulo) * raioOrbita,
    0,
    Math.sin(angulo) * raioOrbita
  ));
}
const linhaOrbita = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(pontosOrbita),
  new THREE.LineBasicMaterial({ color: 0x88aacc, opacity: 0.3, transparent: true })
);
scene.add(linhaOrbita);

// ─── POSIÇÕES DA CÂMERA ───────────────────────────────────
camera.position.x = 2.2;
camera.position.y = 3;
camera.position.z = 2.2;
camera.lookAt(0, 0, 0);

// ─── VARIÁVEIS PARA CONTROLAR AS TRANSFORMAÇÕES GEOMÉTRICAS ──────────
let anguloTranslacao = 0;
const velocidadeTranslacao = 0.01;
const velocidadeRotacao = 0.005;

function animate() {
  requestAnimationFrame(animate);

  // 1. ROTAÇÃO
  sol.rotation.y   += 0.002;           // rotação lenta do Sol no próprio eixo
  terra.rotation.y += velocidadeRotacao; // a Terra rotaciona em torno do próprio eixo Y

  // 2. TRANSLAÇÃO
  // Atualizamos as coordenadas X e Z no espaço para descrever um movimento circular
  // (aplicando as fórmulas paramétricas do círculo)
  anguloTranslacao += velocidadeTranslacao;
  terra.position.x = Math.cos(anguloTranslacao) * raioOrbita;
  terra.position.z = Math.sin(anguloTranslacao) * raioOrbita;

  renderer.render(scene, camera);
}
animate();

// ─── REDIMENSIONAMENTO ────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});