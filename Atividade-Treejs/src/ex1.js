import * as THREE from 'three';

// 1. Configuração da Cena
const scene = new THREE.Scene();

// 2. Configuração da Câmera
// Ajuste de câmera: Posicionei a câmera para criar uma projeção simétrica
// dos eixos X e Z, mantendo uma visualização clara dos objetos.
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 5, 5);
camera.lookAt(scene.position);
camera.up.set(0, 1, 0);

// 3. Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. Ajudante de Eixos (AxesHelper)
// Verde (Y), Azul (Z), Vermelho (X)
// A nova posição da câmera cria a simetria desejada.
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 5. Esfera (Rosa no centro da cena)
const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// A esfera fica na origem (0,0,0) por padrão
scene.add(sphere);

// 6. Cubo (Azul, no canto superior esquerdo)
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const cube = new THREE.Mesh(boxGeometry, boxMaterial);
// Mantivemos a posição relativa
cube.position.set(-2, 1.2, -0.01); 
// Mantivemos a rotação original para ver 3 faces
cube.rotation.set(0.5, 0.6, 0);
scene.add(cube);

// 7. Plano (Verde, à direita)
// Mantemos o tamanho proporcionalmente reduzido (4, 4)
const planeGeometry = new THREE.PlaneGeometry(4, 4);
const planeMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x00ff00,
  side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// Mantivemos a posição relativa
plane.position.set(1.7, 2, -2);
plane.rotation.y = Math.PI / 35; // menos inclinado
plane.rotation.x = -0.19; // leve inclinação para criar um efeito visual interessante
plane.rotation.z = 3.15; // leve rotação para criar um efeito visual interessante
scene.add(plane);

// 8. Responsividade da Janela
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 9. Loop de Animação/Renderização
// Cena estática
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();