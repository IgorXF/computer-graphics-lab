import './style.css';

const selectModelo = document.getElementById('sceneSelect');
const botaoAplicar = document.getElementById('aplicarModelo');
const info = document.getElementById('info');

const MODELOS = {
  flatEarth: {
    nome: 'FlatEarth',
    importer: () => import('./flatEarth.js')
  },
  earth: {
    nome: 'Earth',
    importer: () => import('./Earth.js')
  }
};

function obterModeloDaURL() {
  const params = new URLSearchParams(window.location.search);
  const modeloParam = params.get('modelo');
  return MODELOS[modeloParam] ? modeloParam : 'flatEarth';
}

function atualizarURL(modelo) {
  const params = new URLSearchParams(window.location.search);
  params.set('modelo', modelo);
  window.location.search = params.toString();
}

async function carregarModelo(modelo) {
  const config = MODELOS[modelo];
  info.textContent = `${config.nome} · Three.js`;

  try {
    await config.importer();
  } catch (erro) {
    console.error('Falha ao carregar o modelo selecionado:', erro);
    info.textContent = `Erro ao carregar ${config.nome}`;
  }
}

const modeloInicial = obterModeloDaURL();
selectModelo.value = modeloInicial;

botaoAplicar.addEventListener('click', () => {
  const modeloSelecionado = selectModelo.value;
  if (modeloSelecionado !== modeloInicial) {
    atualizarURL(modeloSelecionado);
  }
});

selectModelo.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    atualizarURL(selectModelo.value);
  }
});

carregarModelo(modeloInicial);
