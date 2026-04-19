// main.js

import './style.css'; 
import * as THREE from 'three';

// Desativa o ColorManagement moderno para evitar que as cores fiquem "lavadas".
THREE.ColorManagement.enabled = false;

// criação de uma cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02040d);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 7, 22);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true }); 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
// Retorna o espaço de cor para o padrão antigo (Linear) para manter a intensidade das cores originais.
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
document.body.appendChild(renderer.domElement); 

// ─── FUNDO ESTRELADO ──────────────────────────────────────
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(2500 * 3);
const raioMinimo = 80;
const raioMaximo = 220;

for (let i = 0; i < 2500; i++) {
  const i3 = i * 3; // Índice base para o array 1D que armazena os vértices (cada vértice tem 3 coordenadas: x, y, z)
  const raio = raioMinimo + Math.random() * (raioMaximo - raioMinimo); // Sorteia uma distância aleatória do centro entre o raio mínimo e máximo
  const theta = Math.random() * Math.PI * 2; // Sorteia o ângulo azimutal (longitude) entre 0 e 2 PI (esfera completa)
  const phi = Math.acos(2 * Math.random() - 1); // Sorteia o ângulo polar (latitude), usando distribuição uniforme na superfície esférica

  // Converte coordenadas esféricas (raio, theta, phi) para cartesianas (x, y, z)
  starPositions[i3] = raio * Math.sin(phi) * Math.cos(theta); // Calcula a posição X (eixo horizontal) usando trigonometria espacial
  starPositions[i3 + 1] = raio * Math.cos(phi); // Calcula a posição Y (eixo vertical / elevação) a partir do ângulo polar
  starPositions[i3 + 2] = raio * Math.sin(phi) * Math.sin(theta); // Calcula a posição Z (profundidade)
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.45,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.9
});
const estrelas = new THREE.Points(starGeometry, starMaterial);
scene.add(estrelas);

// ─── TEXTURA DO SOL (canvas procedural) ───────────────────
function criarTexturaSol() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // gradiente de base: centro branco-quente até vermelho escuro nas bordas.
  const gradiente = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  gradiente.addColorStop(0.00, '#fffde4');
  gradiente.addColorStop(0.15, '#ffe566');
  gradiente.addColorStop(0.45, '#ff9a00');
  gradiente.addColorStop(0.75, '#e85d00');
  gradiente.addColorStop(1.00, '#7a1500');
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, 512, 512);

  // manchas solares e cintilações procedurais.
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 22 + 3;
    const alpha = Math.random() * 0.45;
    const gradienteMancha = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradienteMancha.addColorStop(0, `rgba(255, 230, 80, ${alpha})`);
    gradienteMancha.addColorStop(1, 'rgba(255, 120, 0, 0)');
    ctx.fillStyle = gradienteMancha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// ─── TEXTURA DA LUA (canvas procedural) ───────────────────
function criarTexturaLua() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base cinza média.
  ctx.fillStyle = '#cccccc';
  ctx.fillRect(0, 0, 1024, 1024);

  // Adiciona ruído de superfície (granulação cinza escuro).
  ctx.fillStyle = 'rgba(150, 150, 150, 0.2)'; 
  for(let i = 0; i < 60000; i++) {
    ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
  }

  // Adiciona crateras circulares procedurais aleatórias.
  for(let i = 0; i < 200; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const raio = Math.random() * 30 + 5;
    const profundidade = Math.random() * 0.2 + 0.05;
    
    // Desenha uma cratera: sombra interna e borda brilhante.
    const gradiente = ctx.createRadialGradient(x, y, raio * 0.7, x, y, raio);
    gradiente.addColorStop(0, `rgba(100, 100, 100, ${profundidade})`); 
    gradiente.addColorStop(1, 'rgba(200, 200, 200, 0)'); 
    ctx.fillStyle = gradiente;
    ctx.beginPath(); ctx.arc(x, y, raio, 0, Math.PI * 2); ctx.fill();
    
    // Borda brilhante sutil.
    ctx.strokeStyle = `rgba(230, 230, 230, ${profundidade * 0.3})`;
    ctx.beginPath(); ctx.arc(x, y, raio, 0, Math.PI * 2); ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

// ─── TEXTURA DA TERRA PLANA (canvas procedural) ───────────
function criarTexturaTerra() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.beginPath();
  ctx.arc(1024, 1024, 1023, 0, Math.PI * 2);
  ctx.clip();

  const gradienteOceano = ctx.createRadialGradient(1024, 1024, 0, 1024, 1024, 1024);
  gradienteOceano.addColorStop(0, '#3a9ad9');
  gradienteOceano.addColorStop(0.6, '#1a6fa8');
  gradienteOceano.addColorStop(1, '#0a3355');
  ctx.fillStyle = gradienteOceano; 
  ctx.fillRect(0, 0, 2048, 2048);

  function desenharMassaDeTerra(pontos, cor = '#4e9e3a') {
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.moveTo(pontos[0][0] * 2048, pontos[0][1] * 2048);
    for (let i = 1; i < pontos.length; i++) {
      ctx.lineTo(pontos[i][0] * 2048, pontos[i][1] * 2048);
    }
    ctx.closePath();
    ctx.fill();
  }

  function desenharTerraEliptica(centroX, centroY, raioX, raioY, rotacao, cor = '#4e9e3a') {
    ctx.fillStyle = cor;
    ctx.save(); 
    ctx.translate(centroX * 2048, centroY * 2048); 
    ctx.rotate(rotacao || 0);
    ctx.beginPath(); 
    ctx.ellipse(0, 0, raioX * 2048, raioY * 2048, 0, 0, Math.PI * 2);
    ctx.fill(); 
    ctx.restore();
  }

  // Groenlândia
  desenharTerraEliptica(0.43, 0.30, 0.038, 0.055, -0.3, '#c8e8d0');

  // América do Norte
  desenharMassaDeTerra([
    [0.16, 0.30], [0.20, 0.24], [0.26, 0.20], [0.32, 0.20], [0.37, 0.23],
    [0.40, 0.28], [0.40, 0.34], [0.37, 0.40], [0.34, 0.45], [0.30, 0.48],
    [0.25, 0.50], [0.20, 0.47], [0.16, 0.41], [0.14, 0.35]
  ]);
  desenharTerraEliptica(0.28, 0.50, 0.018, 0.030, 0.15); 
  desenharTerraEliptica(0.13, 0.26, 0.038, 0.028, 0.3); 

  // América Central
  desenharMassaDeTerra([
    [0.28, 0.50], [0.32, 0.49], [0.34, 0.52], [0.32, 0.56], [0.29, 0.55], [0.27, 0.52]
  ]);

  // América do Sul
  desenharMassaDeTerra([
    [0.26, 0.55], [0.31, 0.53], [0.36, 0.55], [0.39, 0.61],
    [0.39, 0.68], [0.36, 0.74], [0.31, 0.77], [0.27, 0.74],
    [0.24, 0.68], [0.23, 0.61], [0.24, 0.57]
  ]);

  // Islândia
  desenharTerraEliptica(0.47, 0.26, 0.022, 0.016, 0.2, '#6ab86a');

  // Europa
  desenharMassaDeTerra([
    [0.49, 0.23], [0.53, 0.20], [0.58, 0.20], [0.61, 0.23],
    [0.62, 0.27], [0.60, 0.31], [0.57, 0.33], [0.53, 0.33],
    [0.50, 0.30], [0.48, 0.27]
  ]);
  desenharMassaDeTerra([[0.48, 0.30], [0.52, 0.29], [0.53, 0.34], [0.50, 0.36], [0.47, 0.34], [0.47, 0.31]]); 
  desenharMassaDeTerra([[0.54, 0.32], [0.56, 0.31], [0.57, 0.36], [0.55, 0.39], [0.53, 0.36]]); 
  desenharMassaDeTerra([[0.52, 0.18], [0.55, 0.15], [0.58, 0.16], [0.58, 0.21], [0.55, 0.23], [0.52, 0.21]]); 
  desenharMassaDeTerra([[0.58, 0.28], [0.63, 0.27], [0.66, 0.30], [0.65, 0.34], [0.60, 0.34], [0.57, 0.31]]); 

  // África
  desenharMassaDeTerra([
    [0.49, 0.34], [0.55, 0.32], [0.61, 0.33], [0.65, 0.37],
    [0.67, 0.44], [0.66, 0.52], [0.63, 0.59], [0.59, 0.65],
    [0.54, 0.67], [0.49, 0.65], [0.46, 0.59], [0.45, 0.51],
    [0.46, 0.43], [0.47, 0.37]
  ]);
  desenharTerraEliptica(0.65, 0.62, 0.014, 0.030, 0.2); 

  // Ásia
  desenharMassaDeTerra([
    [0.60, 0.21], [0.66, 0.18], [0.73, 0.16], [0.79, 0.17],
    [0.83, 0.20], [0.85, 0.25], [0.84, 0.31], [0.81, 0.36],
    [0.76, 0.38], [0.70, 0.39], [0.64, 0.36], [0.60, 0.31],
    [0.58, 0.26]
  ]);
  desenharMassaDeTerra([[0.66, 0.18], [0.72, 0.14], [0.78, 0.14], [0.82, 0.17], [0.79, 0.17]]); 
  desenharMassaDeTerra([[0.62, 0.35], [0.67, 0.34], [0.69, 0.40], [0.66, 0.45], [0.62, 0.43], [0.60, 0.38]]); 
  desenharMassaDeTerra([[0.67, 0.38], [0.73, 0.37], [0.75, 0.43], [0.72, 0.50], [0.67, 0.48], [0.65, 0.43]]); 
  desenharMassaDeTerra([[0.76, 0.38], [0.81, 0.36], [0.83, 0.41], [0.80, 0.46], [0.76, 0.45], [0.74, 0.41]]); 
  desenharTerraEliptica(0.84, 0.27, 0.012, 0.030, -0.3); 
  desenharTerraEliptica(0.86, 0.30, 0.010, 0.022, -0.2);
  desenharTerraEliptica(0.71, 0.51, 0.009, 0.012, 0); 
  desenharTerraEliptica(0.81, 0.45, 0.012, 0.025, 0.3); 

  // Oceania
  desenharMassaDeTerra([
    [0.76, 0.60], [0.83, 0.57], [0.87, 0.58], [0.88, 0.64],
    [0.85, 0.69], [0.79, 0.70], [0.75, 0.66], [0.74, 0.62]
  ]);
  desenharTerraEliptica(0.82, 0.71, 0.012, 0.014, 0); 
  desenharTerraEliptica(0.90, 0.66, 0.012, 0.022, -0.3); 
  desenharTerraEliptica(0.89, 0.70, 0.010, 0.018, -0.2); 
  desenharTerraEliptica(0.79, 0.55, 0.030, 0.016, 0.4); 

  // Anel de Gelo da Borda
  const gradienteAnelGelo = ctx.createRadialGradient(1024, 1024, 2048 * 0.40, 1024, 1024, 1024);
  gradienteAnelGelo.addColorStop(0, 'rgba(210, 235, 255, 0)');
  gradienteAnelGelo.addColorStop(0.70, 'rgba(210, 235, 255, 0.0)');
  gradienteAnelGelo.addColorStop(0.85, 'rgba(220, 240, 255, 0.5)');
  gradienteAnelGelo.addColorStop(0.95, 'rgba(240, 250, 255, 0.88)');
  gradienteAnelGelo.addColorStop(1, 'rgba(255, 255, 255, 1)');
  ctx.fillStyle = gradienteAnelGelo;
  ctx.beginPath(); 
  ctx.arc(1024, 1024, 1023, 0, Math.PI * 2); 
  ctx.fill();

  ctx.restore(); 

  return new THREE.CanvasTexture(canvas);
}

// ─── A TERRA PLANA ────────────────────────────────────────
const raioTerra = 9;

const geometryDisco = new THREE.CircleGeometry(raioTerra, 128); // parametros: raio, segmentos (quanto mais, mais suave fica a borda do disco)
const materialDisco = new THREE.MeshLambertMaterial({ map: criarTexturaTerra() });
const terraDisco = new THREE.Mesh(geometryDisco, materialDisco);
terraDisco.rotation.x = -Math.PI / 2; // Deixa a face superior do disco voltada para cima.
terraDisco.receiveShadow = true; 
scene.add(terraDisco);

const geometryBorda = new THREE.CylinderGeometry(raioTerra, raioTerra, 0.6, 128, 1, true); // parâmetros: raio superior, raio inferior, altura, segmentos radiais, segmentos de altura, aberto (true para não fechar as tampas)
const materialBorda = new THREE.MeshStandardMaterial({ color: 0x0a1f33, roughness: 0.7, metalness: 0.2 }); //parametros: cor, rugosidade (0 = superfície lisa, 1 = superfície áspera), metalicidade (0 = não metálico, 1 = metálico)
const bordaLateral = new THREE.Mesh(geometryBorda, materialBorda); // Cria a borda lateral do disco usando uma geometria de cilindro com as tampas abertas para formar uma "parede" circular.
bordaLateral.position.y = -0.3; 
scene.add(bordaLateral);

const geometryBase = new THREE.CircleGeometry(raioTerra, 128); // parâmetros: raio, segmentos (quanto mais, mais suave fica a borda do disco)
const materialBase = new THREE.MeshBasicMaterial({ color: 0x081c2c });
const baseInferior = new THREE.Mesh(geometryBase, materialBase);
baseInferior.rotation.x = Math.PI / 2; 
baseInferior.position.y = -0.6; 
scene.add(baseInferior);

// ─── SOL ──────────────────────────────────────────────────
const geometrySol = new THREE.SphereGeometry(2.5, 64, 64);
const materialSol = new THREE.MeshBasicMaterial({ map: criarTexturaSol() }); 
const sol = new THREE.Mesh(geometrySol, materialSol);
scene.add(sol);

// halo do Sol (sprite procedural)
const canvasGlow = document.createElement('canvas');
canvasGlow.width = 128;
canvasGlow.height = 128;
const ctxGlow = canvasGlow.getContext('2d');
const gradGlow = ctxGlow.createRadialGradient(64, 64, 0, 64, 64, 64);
gradGlow.addColorStop(0, 'rgba(255, 200, 50, 0.6)');
gradGlow.addColorStop(0.4, 'rgba(255, 130, 0, 0.25)');
gradGlow.addColorStop(1, 'rgba(255, 80, 0, 0)');
ctxGlow.fillStyle = gradGlow;
ctxGlow.fillRect(0, 0, 128, 128);

const halo = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvasGlow),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
halo.scale.set(8, 8, 1);
sol.add(halo);

// ─── ILUMINAÇÃO ───────────────────────────────────────────
const luzFoco = new THREE.SpotLight(0xffe8aa, 4.5, 200, Math.PI / 2.5, 0.4, 1);
luzFoco.castShadow = true; 
const alvoLuzFoco = new THREE.Object3D();
alvoLuzFoco.position.set(0, -1, 0); 
sol.add(alvoLuzFoco);
luzFoco.target = alvoLuzFoco;
sol.add(luzFoco);

// SOL AINDA MAIS FORTE PARA ILUMINAR A LUA
const luzRadial = new THREE.PointLight(0xffddaa, 40, 150, 1);
sol.add(luzRadial);

// ─── LUA ──────────────────────────────────────────────────
const geometryLua = new THREE.SphereGeometry(0.6, 32, 32);
const materialLua = new THREE.MeshStandardMaterial({ 
  map: criarTexturaLua(), 
  color: 0xffffff, 
  roughness: 1.0 // Deixa a superfície da Lua completamente fosca para realçar os detalhes da textura.
}); 
const lua = new THREE.Mesh(geometryLua, materialLua);
lua.castShadow = true; // Permite que a Lua projete sombras na Terra e em si mesma para um efeito mais realista.
scene.add(lua);

const luzInternaLua = new THREE.PointLight(0xaabbff, 0.01, 10, 1); // Uma luz suave e fria dentro da Lua para realçar os detalhes da textura mesmo nas áreas sombreadas.
lua.add(luzInternaLua); // Adiciona a luz interna à Lua para iluminar suavemente os detalhes da textura, mesmo nas áreas que não recebem luz direta do Sol.

// ─── VARIÁVEIS PARA CONTROLAR AS TRANSFORMAÇÕES GEOMÉTRICAS ──────────
let anguloTranslacao = 0;
const velocidadeTranslacao = 0.004;
const velocidadeRotacao = 0.003;
const raioOrbita = 14;
const alturaOrbita = 6;

function animate() {
  requestAnimationFrame(animate); // Solicita a próxima frame de animação, criando um loop contínuo.
  
  anguloTranslacao += velocidadeTranslacao; // Incrementa o ângulo a cada frame para gerar um movimento contínuo ao longo do tempo
  
  // 1. ROTAÇÃO
  terraDisco.rotation.z += velocidadeRotacao; // Adiciona o incremento de rotação ao eixo Z da Terra, fazendo-a girar em si mesma

  // 2. TRANSLAÇÃO
  // Mapeia o ângulo atual para coordenadas cartesianas (X, Z) formando uma órbita circular
  sol.position.x = Math.cos(anguloTranslacao) * raioOrbita; // X é determinado pelo cosseno do angulo multiplicado pela distância (raio)
  sol.position.y = alturaOrbita; // O Sol é mantido sempre em uma altura 'y' constante fixa acima da Terra
  sol.position.z = Math.sin(anguloTranslacao) * raioOrbita; // Z é determinado pelo seno do angulo multiplicado pelo raio
  
  // Usa o mesmo cálculo do Sol, mas adiciona Math.PI (180 graus) ao ângulo para manter a Lua posicionada no oposto diametral exato
  lua.position.x = Math.cos(anguloTranslacao + Math.PI) * raioOrbita; // Calcula o eixo X no lado diretamente oposto ao Sol
  lua.position.y = alturaOrbita; // A Lua também é mantida na mesma altura de órbita constante
  lua.position.z = Math.sin(anguloTranslacao + Math.PI) * raioOrbita; // Calcula o eixo Z em contraposição ao Sol

  renderer.render(scene, camera); // Desenha o frame final na tela baseado na posição atual de todos os objetos renderizados pela câmera
}

animate();

// ─── REDIMENSIONAMENTO ────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});