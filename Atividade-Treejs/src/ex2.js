import * as THREE from 'three';

// 1. Configuração da Cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Fundo preto

// 2. Configuração da Câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Afastamos a câmera no eixo Z para enxergar toda a trajetória do cubo
camera.position.z = 8; 

// 3. Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. Criando o Cubo Verde
// BoxGeometry(largura, altura, profundidade)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Cor Verde Chapada
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 5. Parâmetros da Órbita (Translação)
let angle = 0;           // O ângulo inicial (em radianos)
const radius = 3.5;      // O raio do círculo (distância do centro)
const orbitSpeed = 0.01; // Velocidade da translação (movimento circular)
const spinSpeed = 0.01;  // Velocidade da rotação (giro do próprio cubo)

// 6. Loop de Animação
function animate() {
    requestAnimationFrame(animate);

    // --- ROTAÇÃO ---
    // O cubo gira em torno do seu próprio eixo local
    cube.rotation.x += spinSpeed;
    cube.rotation.y += spinSpeed;

    // --- TRANSLAÇÃO (Órbita) ---
    // Incrementamos o ângulo a cada frame
    angle += orbitSpeed;
    
    // Calculamos a nova posição usando Seno e Cosseno para formar um círculo
    // Math.cos lida com o eixo horizontal (X) e Math.sin com o vertical (Y)
    cube.position.x = radius * Math.cos(angle);
    cube.position.y = radius * Math.sin(angle);

    // Renderizar a cena com as novas posições/rotações
    renderer.render(scene, camera);
}

animate();

// 7. Responsividade da Janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});