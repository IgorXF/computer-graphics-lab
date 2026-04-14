// main.js

import './style.css'; // Importa os estilos no padrão Vite
import * as THREE from 'three'; // Importa a biblioteca Three.js instalada via npm

// Desativa o ColorManagement moderno para evitar que as cores fiquem "lavadas".
THREE.ColorManagement.enabled = false;

const cena = new THREE.Scene();
// Define a cor de fundo simulando um espaço profundo (azul muito escuro).
cena.background = new THREE.Color(0x02040d);

// Campo de estrelas procedural para preencher o espaço ao redor do mundo.
function criarCampoDeEstrelas() {
  const quantidadeEstrelas = 2500;
  const raioMinimo = 80;
  const raioMaximo = 220;
  const posicoes = new Float32Array(quantidadeEstrelas * 3);

  for (let i = 0; i < quantidadeEstrelas; i++) {
    const i3 = i * 3;
    const raio = raioMinimo + Math.random() * (raioMaximo - raioMinimo);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    posicoes[i3] = raio * Math.sin(phi) * Math.cos(theta);
    posicoes[i3 + 1] = raio * Math.cos(phi);
    posicoes[i3 + 2] = raio * Math.sin(phi) * Math.sin(theta);
  }

  const geometriaEstrelas = new THREE.BufferGeometry();
  geometriaEstrelas.setAttribute('position', new THREE.BufferAttribute(posicoes, 3));

  const materialEstrelas = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.45,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9
  });

  return new THREE.Points(geometriaEstrelas, materialEstrelas);
}

const campoDeEstrelas = criarCampoDeEstrelas();
cena.add(campoDeEstrelas);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 7, 22);
camera.lookAt(0, 1, 0); 

const renderizador = new THREE.WebGLRenderer({ antialias: true }); 
renderizador.setSize(window.innerWidth, window.innerHeight);
renderizador.shadowMap.enabled = true; 
renderizador.shadowMap.type = THREE.PCFSoftShadowMap; 
// Retorna o espaço de cor para o padrão antigo (Linear) para manter a intensidade das cores originais.
renderizador.outputColorSpace = THREE.LinearSRGBColorSpace;
document.body.appendChild(renderizador.domElement); 

// ============================================================================
// GERAÇÃO PROCEDURAL DE TEXTURAS (PARA NÃO DEPENDER DE ARQUIVOS EXTERNOS)
// ============================================================================

// --- TEXTURA DO SOL (superfície incandescente granulada com manchas laranja) ---
function criarTexturaSol() {
  const TAMANHO = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TAMANHO;
  const ctx = canvas.getContext('2d');

  // Gradiente de base: centro branco-quente ate vermelho escuro nas bordas.
  const gradiente = ctx.createRadialGradient(TAMANHO/2, TAMANHO/2, 0, TAMANHO/2, TAMANHO/2, TAMANHO/2);
  gradiente.addColorStop(0.00, '#fffde4');
  gradiente.addColorStop(0.15, '#ffe566');
  gradiente.addColorStop(0.45, '#ff9a00');
  gradiente.addColorStop(0.75, '#e85d00');
  gradiente.addColorStop(1.00, '#7a1500');
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, TAMANHO, TAMANHO);

  // Manchas solares e cintilacoes procedurais.
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * TAMANHO;
    const y = Math.random() * TAMANHO;
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

// --- TEXTURA DA LUA (superfície cinza granulada com crateras) ---
function criarTexturaLua() {
  const TAMANHO = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TAMANHO;
  const ctx = canvas.getContext('2d');

  // Base cinza média.
  ctx.fillStyle = '#cccccc';
  ctx.fillRect(0, 0, TAMANHO, TAMANHO);

  // Adiciona ruído de superfície (granulação cinza escuro).
  ctx.fillStyle = 'rgba(150, 150, 150, 0.2)'; 
  for(let i=0; i<60000; i++) {
    ctx.fillRect(Math.random() * TAMANHO, Math.random() * TAMANHO, 2, 2);
  }

  // Adiciona crateras circulares procedurais aleatórias.
  for(let i=0; i<200; i++) {
    const x = Math.random() * TAMANHO;
    const y = Math.random() * TAMANHO;
    const raio = Math.random() * 30 + 5;
    const profundidade = Math.random() * 0.2 + 0.05;
    
    // Desenha uma cratera: sombra interna e borda brilhante.
    const gradiente = ctx.createRadialGradient(x, y, raio*0.7, x, y, raio);
    gradiente.addColorStop(0, `rgba(100, 100, 100, ${profundidade})`); // Centro escuro
    gradiente.addColorStop(1, 'rgba(200, 200, 200, 0)'); // Borda sutil
    ctx.fillStyle = gradiente;
    ctx.beginPath(); ctx.arc(x, y, raio, 0, Math.PI*2); ctx.fill();
    
    // Borda brilhante sutil.
    ctx.strokeStyle = `rgba(230, 230, 230, ${profundidade*0.3})`;
    ctx.beginPath(); ctx.arc(x, y, raio, 0, Math.PI*2); ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

const texturaSol = criarTexturaSol();
const texturaLua = criarTexturaLua();

// ============================================================================
// GERAÇÃO PROCEDURAL DA TEXTURA DA TERRA PLANA (VIA CANVAS 2D) 
// ============================================================================

const TAMANHO_TEXTURA_TERRA = 2048; 
const elementoCanvas2DTerra = document.createElement('canvas');
elementoCanvas2DTerra.width = elementoCanvas2DTerra.height = TAMANHO_TEXTURA_TERRA;
const contexto2DTerra = elementoCanvas2DTerra.getContext('2d');

contexto2DTerra.save();
contexto2DTerra.beginPath();
contexto2DTerra.arc(TAMANHO_TEXTURA_TERRA / 2, TAMANHO_TEXTURA_TERRA / 2, TAMANHO_TEXTURA_TERRA / 2 - 1, 0, Math.PI * 2);
contexto2DTerra.clip();

const gradienteOceano = contexto2DTerra.createRadialGradient(
  TAMANHO_TEXTURA_TERRA / 2, TAMANHO_TEXTURA_TERRA / 2, 0, 
  TAMANHO_TEXTURA_TERRA / 2, TAMANHO_TEXTURA_TERRA / 2, TAMANHO_TEXTURA_TERRA / 2
);
gradienteOceano.addColorStop(0, '#3a9ad9');
gradienteOceano.addColorStop(0.6, '#1a6fa8');
gradienteOceano.addColorStop(1, '#0a3355');
contexto2DTerra.fillStyle = gradienteOceano; 
contexto2DTerra.fillRect(0, 0, TAMANHO_TEXTURA_TERRA, TAMANHO_TEXTURA_TERRA);

function desenharMassaDeTerra(pontos, cor = '#4e9e3a') {
  contexto2DTerra.fillStyle = cor;
  contexto2DTerra.beginPath();
  contexto2DTerra.moveTo(pontos[0][0] * TAMANHO_TEXTURA_TERRA, pontos[0][1] * TAMANHO_TEXTURA_TERRA);
  for (let i = 1; i < pontos.length; i++) {
    contexto2DTerra.lineTo(pontos[i][0] * TAMANHO_TEXTURA_TERRA, pontos[i][1] * TAMANHO_TEXTURA_TERRA);
  }
  contexto2DTerra.closePath();
  contexto2DTerra.fill();
}

function desenharTerraEliptica(centroX, centroY, raioX, raioY, rotacao, cor = '#4e9e3a') {
  contexto2DTerra.fillStyle = cor;
  contexto2DTerra.save(); 
  contexto2DTerra.translate(centroX * TAMANHO_TEXTURA_TERRA, centroY * TAMANHO_TEXTURA_TERRA); 
  contexto2DTerra.rotate(rotacao || 0);
  contexto2DTerra.beginPath(); 
  contexto2DTerra.ellipse(0, 0, raioX * TAMANHO_TEXTURA_TERRA, raioY * TAMANHO_TEXTURA_TERRA, 0, 0, Math.PI * 2);
  contexto2DTerra.fill(); 
  contexto2DTerra.restore();
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
const gradienteAnelGelo = contexto2DTerra.createRadialGradient(
  TAMANHO_TEXTURA_TERRA / 2, TAMANHO_TEXTURA_TERRA / 2, TAMANHO_TEXTURA_TERRA * 0.40, 
  TAMANHO_TEXTURA_TERRA / 2, TAMANHO_TEXTURA_TERRA / 2, TAMANHO_TEXTURA_TERRA / 2
);
gradienteAnelGelo.addColorStop(0, 'rgba(210, 235, 255, 0)');
gradienteAnelGelo.addColorStop(0.70, 'rgba(210, 235, 255, 0.0)');
gradienteAnelGelo.addColorStop(0.85, 'rgba(220, 240, 255, 0.5)');
gradienteAnelGelo.addColorStop(0.95, 'rgba(240, 250, 255, 0.88)');
gradienteAnelGelo.addColorStop(1, 'rgba(255, 255, 255, 1)');
contexto2DTerra.fillStyle = gradienteAnelGelo;
contexto2DTerra.beginPath(); 
contexto2DTerra.arc(TAMANHO_TEXTURA_TERRA / 2, TAMANHO_TEXTURA_TERRA / 2, TAMANHO_TEXTURA_TERRA / 2 - 1, 0, Math.PI * 2); 
contexto2DTerra.fill();

contexto2DTerra.restore(); 

const texturaTerra = new THREE.CanvasTexture(elementoCanvas2DTerra);

// ============================================================================
// 4. CONSTRUÇÃO DOS MESHES (OBJETOS 3D) DO MUNDO 
// ============================================================================

const RAIO_TERRA = 9;

const geometriaDisco = new THREE.CircleGeometry(RAIO_TERRA, 128);
const materialDisco = new THREE.MeshLambertMaterial({ map: texturaTerra, side: THREE.DoubleSide });
const terraDisco = new THREE.Mesh(geometriaDisco, materialDisco);
terraDisco.rotation.x = -Math.PI / 2; 
terraDisco.receiveShadow = true; 
cena.add(terraDisco);

const geometriaBorda = new THREE.CylinderGeometry(RAIO_TERRA, RAIO_TERRA, 0.6, 128, 1, true);
const materialBorda = new THREE.MeshStandardMaterial({ color: 0x0a1f33, roughness: 0.7, metalness: 0.2 });
const bordaLateral = new THREE.Mesh(geometriaBorda, materialBorda);
bordaLateral.position.y = -0.3; 
cena.add(bordaLateral);

const geometriaBase = new THREE.CircleGeometry(RAIO_TERRA, 128);
const materialBase = new THREE.MeshBasicMaterial({ color: 0x081c2c });
const baseInferior = new THREE.Mesh(geometriaBase, materialBase);
baseInferior.rotation.x = Math.PI / 2; 
baseInferior.position.y = -0.6; 
cena.add(baseInferior);

// ============================================================================
// 5. SOL E ILUMINAÇÃO
// ============================================================================

const geometriaSol = new THREE.SphereGeometry(2.5, 64, 64);
const materialSol = new THREE.MeshBasicMaterial({ map: texturaSol }); 
const sol = new THREE.Mesh(geometriaSol, materialSol);
cena.add(sol);

// Halo do Sol (sprite procedural com brilho aditivo).
const canvasGlow = document.createElement('canvas');
canvasGlow.width = canvasGlow.height = 128;
const ctxGlow = canvasGlow.getContext('2d');
const gradGlow = ctxGlow.createRadialGradient(64, 64, 0, 64, 64, 64);
gradGlow.addColorStop(0, 'rgba(255, 200, 50, 0.6)');
gradGlow.addColorStop(0.4, 'rgba(255, 130, 0, 0.25)');
gradGlow.addColorStop(1, 'rgba(255, 80, 0, 0)');
ctxGlow.fillStyle = gradGlow;
ctxGlow.fillRect(0, 0, 128, 128);

const haloSol = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvasGlow),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
haloSol.scale.set(8, 8, 1);
sol.add(haloSol);

const luzFocoSol = new THREE.SpotLight(0xffe8aa, 4.5, 200, Math.PI / 2.5, 0.4, 1);
luzFocoSol.castShadow = true; 
const alvoLuzFoco = new THREE.Object3D();
alvoLuzFoco.position.set(0, -1, 0); 
sol.add(alvoLuzFoco);
luzFocoSol.target = alvoLuzFoco;
sol.add(luzFocoSol);

// --- SOL AINDA MAIS FORTE PARA ILUMINAR A LUA ---
// Aumentei de 20 para 40 para garantir que a lua receba muita luz e brilhe forte
const luzRadialSol = new THREE.PointLight(0xffddaa, 40, 150, 1);
sol.add(luzRadialSol);

// ============================================================================
// 6. LUA - ATUALIZADA (Mais brilhante)
// ============================================================================

const geometriaLua = new THREE.SphereGeometry(0.6, 32, 32);
// Lua usa MeshStandardMaterial. 
// A cor base foi alterada para branco puro (0xffffff) para maximizar o brilho da textura.
const materialLua = new THREE.MeshStandardMaterial({ 
  map: texturaLua, 
  color: 0xffffff, // Antes era 0xdddddd (cinza), agora é branco puro para refletir mais luz
  roughness: 1.0 
}); 
const lua = new THREE.Mesh(geometriaLua, materialLua);
lua.castShadow = true;
cena.add(lua);

const luzInternaLua = new THREE.PointLight(0xaabbff, 0.01, 10, 1);
lua.add(luzInternaLua);

// ============================================================================
// 7. MOTOR DE ANIMAÇÃO E RESPONSIVIDADE - ATUALIZADO
// ============================================================================

const RAIO_ORBITA = 14;
const ALTURA_ORBITA = 6;
let tempoAnimacao = 0;

function animarCena() {
  requestAnimationFrame(animarCena); 
  
  tempoAnimacao += 0.004;
  
  // --- TERRA GIRANDO UM POUCO MAIS LENTA ---
  // Reduzido de 0.01 para 0.003 (gira num ritmo mais agradável)
  terraDisco.rotation.z += 0.003;

  sol.position.set(
    RAIO_ORBITA * Math.cos(tempoAnimacao), 
    ALTURA_ORBITA, 
    RAIO_ORBITA * Math.sin(tempoAnimacao)
  );
  
  lua.position.set(
    RAIO_ORBITA * Math.cos(tempoAnimacao + Math.PI), 
    ALTURA_ORBITA, 
    RAIO_ORBITA * Math.sin(tempoAnimacao + Math.PI)
  );

  renderizador.render(cena, camera);
}

animarCena();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderizador.setSize(window.innerWidth, window.innerHeight);
});