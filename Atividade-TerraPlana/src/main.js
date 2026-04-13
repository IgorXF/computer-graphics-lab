// src/main.js
import * as THREE from 'three';

// 1. Configuração da Cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510); // Fundo bem escuro simulando o espaço

// 2. Configuração da Câmera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
// Posicionada para ver a superfície e a borda do disco, como na imagem
camera.position.set(0, 5, 12);
camera.lookAt(0, 1.5, 0); // Olhando ligeiramente para cima do disco para ver Sol/Lua

// 3. Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// Habilitar sombras para dar mais realismo
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// 4. Iluminação
// Luz ambiente para ver o que está na sombra
const ambientLight = new THREE.AmbientLight(0x404040, 1.0); 
scene.add(ambientLight);

// Luz do Sol (PointLight amarela e forte)
const sunLight = new THREE.PointLight(0xfffca3, 15, 100); 
sunLight.castShadow = true;
scene.add(sunLight);

// Luz da Lua (PointLight cinza e fraca)
const moonLight = new THREE.PointLight(0x808080, 0.5, 50); 
scene.add(moonLight);

// 5. Função para criar uma Textura Procedural Realista
function createFlatEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Oceano Azul
  ctx.fillStyle = '#004777';
  ctx.fillRect(0, 0, 1024, 1024);

  // Muralha de Gelo (Borda Branca)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.arc(512, 512, 500, 0, Math.PI * 2);
  ctx.stroke();

  // Continentes Verdes e Marrons (Manchas Irregulares)
  ctx.fillStyle = '#105020'; // Verde escuro
  const continents = [
    {x: 300, y: 300, r: 150}, {x: 700, y: 700, r: 120}, {x: 200, y: 700, r: 100},
    {x: 800, y: 300, r: 130}, {x: 512, y: 512, r: 80} // Polo Norte
  ];
  continents.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Mais detalhes de cor
  ctx.fillStyle = '#307040'; // Verde mais claro
  ctx.beginPath();
  ctx.arc(350, 250, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a6f3a'; // Verde vibrante
  ctx.beginPath();
  ctx.arc(650, 750, 90, 0, Math.PI * 2);
  ctx.fill();

  // Neve/Polo central (Polo Norte)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(512, 512, 50, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

// 6. Criando a Terra Plana como um Cilindro para ter borda
// CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
const diskGeometry = new THREE.CylinderGeometry(4, 4, 0.2, 64);

// Materiais para as faces do cilindro: [face lateral, face inferior, face superior]
const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Borda preta
const bottomMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 }); // Parte inferior escura
const topMaterial = new THREE.MeshStandardMaterial({ 
  map: createFlatEarthTexture(),
  roughness: 0.8
});

const materials = [edgeMaterial, bottomMaterial, topMaterial];
const disk = new THREE.Mesh(diskGeometry, materials);

// O Cilindro começa em pé. Rotacionamos para deitar no plano horizontal.
disk.rotation.x = -Math.PI / 2;
disk.receiveShadow = true;
scene.add(disk);

// 7. Criando o Sol e a Lua
// Sol (Branco e brilhante)
const sunGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); 
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Lua (Cinza escura)
const moonGeometry = new THREE.SphereGeometry(0.2, 32, 32);
const moonMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 1 }); 
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.castShadow = true;
scene.add(moon);

// Parâmetros da Órbita
const orbitRadius = 5.5; // Distância do centro
const orbitAltitude = 3.0; // Altitude fixa e positiva acima do disco

// 8. Responsividade da Janela
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 9. Loop de Animação
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // --- Rotação da Terra ---
  // A rotação do disco é em torno do seu centro local (eixo Z após a rotação do disco)
  disk.rotation.z += 0.1 * clock.getDelta(); 

  // --- Órbita do Sol ---
  const sunSpeed = elapsedTime * 0.8;
  sun.position.x = orbitRadius * Math.cos(sunSpeed);
  sun.position.z = orbitRadius * Math.sin(sunSpeed);
  // Altitude fixa acima do disco, como na imagem
  sun.position.y = orbitAltitude;
  
  // A luz do sol deve acompanhar a malha do sol
  sunLight.position.copy(sun.position);

  // --- Órbita da Lua ---
  // A Lua fica do lado oposto ao Sol, adicionando Math.PI (180 graus) ao ângulo
  const moonSpeed = sunSpeed + Math.PI;
  moon.position.x = orbitRadius * Math.cos(moonSpeed);
  moon.position.z = orbitRadius * Math.sin(moonSpeed);
  // Altitude fixa
  moon.position.y = orbitAltitude;

  // A luz da lua deve acompanhar a malha da lua
  moonLight.position.copy(moon.position);

  renderer.render(scene, camera);
}

animate();