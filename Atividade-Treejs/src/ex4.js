// src/main.js
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.ConeGeometry(1.2, 2, 4);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
const pyramid = new THREE.Mesh(geometry, material);

pyramid.rotation.x = 0.35;
pyramid.rotation.y = 0;

scene.add(pyramid);

function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.0015;
  const onda = Math.sin(time); // -1 → 1

  // Escala: de 0.4 (longe) até 1.8 (perto) — range moderado
  const pulseScale = 1.1 + onda * 0.7;
  pyramid.scale.set(pulseScale, pulseScale, pulseScale);

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});