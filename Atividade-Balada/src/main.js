import * as THREE from 'three';

// 1. Configuração do ambiente
const cena = new THREE.Scene();
cena.background = new THREE.Color(0x050505); // Fundo escuro (quase preto)

// Configurando a câmera (PerspectiveCamera)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);
camera.lookAt(0, 0, 0);

// Configurando o renderizador
const renderizador = new THREE.WebGLRenderer({ antialias: true });
renderizador.setSize(window.innerWidth, window.innerHeight);
// Habilitando sombras para maior realismo
renderizador.shadowMap.enabled = true;
renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderizador.domElement);

// Ajuste do CSS do body via JavaScript para remover margens
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

// 2. Iluminação
// Luz ambiente branca (intensidade baixa para clima de balada)
const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.1); 
cena.add(luzAmbiente);

// Luz direcional amarela
const luzDirecional = new THREE.DirectionalLight(0xffff00, 0.5);
luzDirecional.position.set(0, 10, 5);
luzDirecional.castShadow = true;
cena.add(luzDirecional);

// Criando exatamente 3 luzes adicionais coloridas (PointLights)
function criarLuzDeBalada(cor) {
    // Nova API física do Three.js geralmente usa intensidade maior para destacar
    const luz = new THREE.PointLight(cor, 50, 20, 2); 
    luz.castShadow = true;
    
    // Objeto para representar a lâmpada/fonte de luz visualmente
    const geometriaLampada = new THREE.SphereGeometry(0.3, 16, 16);
    const materialLampada = new THREE.MeshBasicMaterial({ color: cor });
    const lampada = new THREE.Mesh(geometriaLampada, materialLampada);
    luz.add(lampada);
    
    return luz;
}

const luzVermelha = criarLuzDeBalada(0xff0000);
const luzVerde = criarLuzDeBalada(0x00ff00);
const luzAzul = criarLuzDeBalada(0x0000ff);

cena.add(luzVermelha);
cena.add(luzVerde);
cena.add(luzAzul);

// 4. Objetos da cena no centro (em movimento)
// Objeto 1: CylinderGeometry (Geometria em formato de cilindro) com MeshLambertMaterial
const geometriaCilindro = new THREE.CylinderGeometry(1.5, 1.5, 3.5, 32);
const materialCilindro = new THREE.MeshLambertMaterial({ 
    color: 0x8800ff, // Roxo neon
});
const cilindro = new THREE.Mesh(geometriaCilindro, materialCilindro);
cilindro.position.set(-3.5, 2.5, 0);
cilindro.castShadow = true;
cena.add(cilindro);

// Objeto 2: DodecahedronGeometry (Outra geometria complexa) com MeshPhongMaterial (Brilho/Shininess)
const geometriaDodecaedro = new THREE.DodecahedronGeometry(2.5);
const materialDodecaedro = new THREE.MeshPhongMaterial({ 
    color: 0x00ffff, // Ciano neon
    shininess: 150,  // Alto brilho visível
    specular: 0xffffff // Reflexo de luz branco
});
const dodecaedro = new THREE.Mesh(geometriaDodecaedro, materialDodecaedro);
dodecaedro.position.set(3.5, 2.5, 0);
dodecaedro.castShadow = true;
cena.add(dodecaedro);

// 7. Extras (Opcional)
// Adicionando um chão (Plano)
const geometriaPlano = new THREE.PlaneGeometry(50, 50);
const materialPlano = new THREE.MeshStandardMaterial({ 
    color: 0x111111,
    roughness: 0.8,
    metalness: 0.2
});
const plano = new THREE.Mesh(geometriaPlano, materialPlano);
plano.rotation.x = -Math.PI / 2; // Deita o plano
plano.receiveShadow = true;
cena.add(plano);

// Grade estilo cyberpunk / balada neon no chão
const grade = new THREE.GridHelper(50, 50, 0xff00ff, 0x444444);
grade.position.y = 0.01; // Levemente acima do chão (evitar z-fighting)
cena.add(grade);

// Ajuste responsivo: se o usuário redimensionar a janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
});

// 5. Animação
const relogio = new THREE.Clock();

function animar() {
    requestAnimationFrame(animar);

    const tempo = relogio.getElapsedTime();

    // Rotação contínua dos objetos (efeito balada/disco)
    cilindro.rotation.x += 0.01;
    cilindro.rotation.y += 0.02;

    dodecaedro.rotation.x -= 0.01;
    dodecaedro.rotation.y += 0.015;

    // 3. Comportamento das luzes: Movimento e Piscar
    
    // As 3 luzes coloridas se movem automaticamente (movimento circular / ondas)
    // Luz vermelha: Círculo amplo ao redor
    luzVermelha.position.x = Math.sin(tempo) * 8;
    luzVermelha.position.z = Math.cos(tempo) * 8;
    luzVermelha.position.y = 4 + Math.sin(tempo * 2) * 2;

    // Luz verde: Movimento em sentido oposto e mais interno
    luzVerde.position.x = Math.cos(tempo * 1.2) * 5;
    luzVerde.position.z = Math.sin(tempo * 1.2) * 5;
    luzVerde.position.y = 3 + Math.cos(tempo * 3) * 2;

    // Luz azul: Movimento em formato de oito (Lissajous)
    luzAzul.position.x = Math.sin(tempo * 0.8) * 10;
    luzAzul.position.z = Math.sin(tempo * 1.6) * 5;
    luzAzul.position.y = 5 + Math.sin(tempo) * 2;

    // As luzes piscam: variando sua intensidade ao longo do tempo com funções seno/cosseno
    // Intensidade base multiplicada pelo valor absoluto do seno para o efeito de pulsação
    const intensidadeMaxima = 150;
    luzVermelha.intensity = Math.abs(Math.sin(tempo * 4)) * intensidadeMaxima;
    luzVerde.intensity = Math.abs(Math.cos(tempo * 5)) * intensidadeMaxima;
    luzAzul.intensity = Math.abs(Math.sin(tempo * 6)) * intensidadeMaxima;

    // Renderizando a cena a cada frame
    renderizador.render(cena, camera);
}

// Inicia o loop de animação
animar();
