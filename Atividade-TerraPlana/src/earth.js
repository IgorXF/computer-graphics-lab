import './style.css'; 
import * as THREE from 'three'; 


const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000); //campo de visão, proporção da tela, e distância mínima e máxima de visão
const renderer = new THREE.WebGLRenderer({ antialias: true }); //renderizador para desenhar a imagem
renderer.setSize(window.innerWidth, window.innerHeight); //ocupa o tamanho exato da janela do navegador
document.body.appendChild(renderer.domElement); 

//fundo com estrelas
const estrelaGeometry = new THREE.BufferGeometry(); //Buffer para carregar muitos dados de uma vez
const starPositions = new Float32Array(5000 * 3); 
for (let i = 0; i < starPositions.length; i++) { 
  starPositions[i] = (Math.random() - 0.5) * 300; 
}
estrelaGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3)); //coloca no Buffer os numeros aleatorios
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12 }); 
const estrelas = new THREE.Points(estrelaGeometry, starMaterial); 
scene.add(estrelas); 

//Textura do Sol
function criarTexturaSol() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const gradBase = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  gradBase.addColorStop(0.00, '#fffde4');
  gradBase.addColorStop(0.15, '#ffe566');
  gradBase.addColorStop(0.45, '#ff9a00');
  gradBase.addColorStop(0.75, '#e85d00');
  gradBase.addColorStop(1.00, '#7a1500');
  ctx.fillStyle = gradBase;
  ctx.fillRect(0, 0, 512, 512);

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

//Textura da Terra
function criarTexturaTerra() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a4f8a';
  ctx.fillRect(0, 0, 512, 512);

  const continentes = [
    [160, 180,  80, 55,  0.3,  '#4a7c3f'], 
    [175, 290,  45, 65,  0.1,  '#5a8a40'], 
    [290, 160,  70, 50, -0.2,  '#6b8c45'], 
    [310, 250,  55, 80,  0.0,  '#5e7a38'], 
    [380, 170,  75, 55,  0.4,  '#7a9a50'], 
    [415, 280,  40, 30,  0.2,  '#6b8c45'], 
    [105, 460,  60, 25,  0.5,  '#8aaa60'], 
  ];

  continentes.forEach(([cx, cy, rx, ry, rot, cor]) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.ellipse(3, 3, rx + 4, ry + 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = cor;
    ctx.fill();

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

    ctx.beginPath();
    ctx.ellipse(0, -ry * 0.55, rx * 0.5, ry * 0.22, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220, 240, 200, 0.25)';
    ctx.fill();

    ctx.restore();
  });

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


//cria o sol
const geometrySol = new THREE.SphereGeometry(0.7, 64, 64); 
const materialSol = new THREE.MeshBasicMaterial({ map: criarTexturaSol() }); 
const sol = new THREE.Mesh(geometrySol, materialSol); 
scene.add(sol); 

//efeito de luz em volta do sol
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


//iluminação que o sol faz na Terra
const luzSol = new THREE.PointLight(0xfff4cc, 3.0, 80); //cor, intensidade e alcance
scene.add(luzSol); 

//ilimunação na parte escura da terra 
const luzAmbiente = new THREE.AmbientLight(0x111122, 1.0); 
scene.add(luzAmbiente); 


//cria a Terra
const geometryTerra = new THREE.SphereGeometry(0.2, 64, 64); 
const materialTerra = new THREE.MeshPhongMaterial({ map: criarTexturaTerra() });
const terra = new THREE.Mesh(geometryTerra, materialTerra); 
scene.add(terra); 

//linha de órbita formada por varios pontos
const raioOrbita = 2.5; 
const pontosOrbita = []; 
for (let i = 0; i <= 256; i++) { 
  const angulo = (i / 256) * Math.PI * 2; 
  pontosOrbita.push(new THREE.Vector3(Math.cos(angulo) * raioOrbita, 0, Math.sin(angulo) * raioOrbita));
}
const linhaOrbita = new THREE.Line( //conecta os pontos numa linha
  new THREE.BufferGeometry().setFromPoints(pontosOrbita),
  new THREE.LineBasicMaterial({ color: 0x88aacc, opacity: 0.3, transparent: true })
);
scene.add(linhaOrbita); 

//posições da câmera
camera.position.x = 0; 
camera.position.y = 3;   
camera.position.z = 4; 
camera.lookAt(0, 0, 0);  

//variáveis para controlar as transformações lineares
let anguloTranslacao = 0; 
const velocidadeTranslacaoTerra = 0.01; 
const velocidadeRotacaoTerra = 0.005; 
const velocidadeRotacaoSol = 0.002;


//loop principal de animação que roda 60 vezes por segundo sem parar
function animate() {
  requestAnimationFrame(animate); 

  //rotação
  sol.rotation.y   += velocidadeRotacaoSol;           
  terra.rotation.y += velocidadeRotacaoTerra; 

  //translação
  anguloTranslacao += velocidadeTranslacaoTerra; //angulo aumenta a cada frame
  //atualiza X e Z para ter o movimento circular em volta do sol
  terra.position.x = Math.cos(anguloTranslacao) * raioOrbita; //posição horizontal
  terra.position.z = Math.sin(anguloTranslacao) * raioOrbita; //profundidade

  renderer.render(scene, camera);
}

animate(); 


//responsividade na tela ao maximizar ou redimensionar a tela 
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight; 
  camera.updateProjectionMatrix(); 
  renderer.setSize(window.innerWidth, window.innerHeight); 
});