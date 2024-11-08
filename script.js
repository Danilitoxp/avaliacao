import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGzGqcgOZNYrFq-1pWv6ds_X69S2Anqk8",
  authDomain: "avaliacoes-c586a.firebaseapp.com",
  projectId: "avaliacoes-c586a",
  storageBucket: "avaliacoes-c586a.firebasestorage.app",
  messagingSenderId: "430101660288",
  appId: "1:430101660288:web:8f5a4483eb277cf84c9c65"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Dados dos vendedores com o caminho para as fotos
const vendedores = [
  { nome: 'Wesley', pontos: 0, foto: 'Vendedores/Wesley Sa.jpg', id: 'wesley' },
  { nome: 'Murilo', pontos: 0, foto: 'Vendedores/Murilo Henrique.jpg', id: 'murilo' },
  { nome: 'Valéria', pontos: 0, foto: 'Vendedores/Valeria.jpg', id: 'valeria' },
  { nome: 'Mateus', pontos: 0, foto: 'Vendedores/Mateus.jpg', id: 'mateus' },
  { nome: 'Leandro', pontos: 0, foto: 'Vendedores/Leandro.jpg', id: 'leandro' },
  { nome: 'Tatiane', pontos: 0, foto: 'Vendedores/Tatiane.jpg', id: 'tatiane' },
  { nome: 'Deives', pontos: 0, foto: 'Vendedores/Deives.jpg', id: 'deives' },
  { nome: 'Gustavo', pontos: 0, foto: 'Vendedores/Gustavo.jpg', id: 'gustavo' },
  { nome: 'Victor', pontos: 0, foto: 'Vendedores/Victor.jpg', id: 'victor' },
  { nome: 'Joao', pontos: 0, foto: 'Vendedores/Joao.jpg', id: 'joao' }
];

// Modal e lógica de senha
const modal = document.getElementById('password-modal');
const passwordInput = document.getElementById('password-input');
const passwordSubmit = document.getElementById('password-submit');
const passwordCancel = document.getElementById('password-cancel');

// Senha correta (pode ser alterada conforme necessário)
const correctPassword = "admin123"; 

// Exibe o modal para inserir a senha
document.addEventListener('keydown', (event) => {
  // Se pressionar 'A', alterna a visibilidade do modo admin
  if (event.key === 'A' || event.key === 'a') {
    if (document.body.classList.contains('admin-mode')) {
      document.body.classList.remove('admin-mode');
      gerarRanking(); // Regenera o ranking sem os botões
    } else {
      modal.style.display = 'flex';
    }
  }
});

// Verifica a senha inserida quando o botão de login é clicado
passwordSubmit.addEventListener('click', () => {
  loginAdmin();
});

// Verifica a senha ao pressionar 'Enter' no campo de senha
passwordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    loginAdmin();
  }
});

// Função para validar o login
function loginAdmin() {
  const enteredPassword = passwordInput.value;

  if (enteredPassword === correctPassword) {
    document.body.classList.add('admin-mode');
    modal.style.display = 'none'; // Fecha o modal
    gerarRanking(); // Regenera o ranking com os botões visíveis
  } else {
    alert("Senha incorreta!");
  }
}

// Fecha o modal se o usuário cancelar
passwordCancel.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Função para carregar os pontos dos vendedores do Firestore
async function carregarPontosDosVendedores() {
  for (let i = 0; i < vendedores.length; i++) {
    const vendedorRef = doc(db, "vendedores", vendedores[i].id);
    const vendedorDoc = await getDoc(vendedorRef);

    if (vendedorDoc.exists()) {
      vendedores[i].pontos = vendedorDoc.data().pontos || 0;
      vendedores[i].foto = vendedorDoc.data().foto || vendedores[i].foto; // Adiciona a URL da foto
    } else {
      console.log("Vendedor não encontrado: ", vendedores[i].id);
    }
  }

  gerarRanking(); // Após carregar os pontos, gera o ranking
}

// Função para atualizar ou criar o documento no Firestore
async function atualizarPontosFirestore(vendedorId, pontos) {
  const vendedorRef = doc(db, "vendedores", vendedorId);
  const vendedorDoc = await getDoc(vendedorRef);

  // Se o documento não existir, cria-o com os pontos
  if (!vendedorDoc.exists()) {
    // Cria o documento com pontos iniciais, se necessário
    await setDoc(vendedorRef, { pontos: pontos, foto: vendedores.find(v => v.id === vendedorId).foto });
  } else {
    // Se o documento existir, atualiza os pontos
    await updateDoc(vendedorRef, { pontos: increment(pontos) });
  }
}

// Função para enviar imagem para o Firebase Storage e retornar a URL
async function enviarImagemParaStorage(vendedorId, foto) {
  const storageRef = ref(storage, foto);
  const file = new File([foto], vendedorId + '.jpg', { type: 'image/jpeg' });

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Atualiza a URL da foto no Firestore
    await updateDoc(doc(db, "vendedores", vendedorId), {
      foto: downloadURL
    });

    return downloadURL;
  } catch (error) {
    console.error("Erro ao enviar a imagem para o Firebase Storage:", error);
    return null;
  }
}

// Função para gerar o ranking
function gerarRanking() {
  const rankingList = document.getElementById('ranking-list');
  rankingList.innerHTML = '';

  // Ordena os vendedores por pontos em ordem decrescente
  vendedores.sort((a, b) => b.pontos - a.pontos);

  vendedores.forEach((vendedor, index) => {
    const listItem = document.createElement('li');
    listItem.classList.add('ranking-item');
    if (index === 0) listItem.classList.add('first-place');

    // Ícone de posição
    const positionIcon = document.createElement('div');
    positionIcon.classList.add('position');
    positionIcon.textContent = index + 1;

    // Foto do vendedor
    const foto = document.createElement('img');
    foto.src = vendedor.foto;
    foto.alt = `Foto de ${vendedor.nome}`;
    foto.style.width = '50px';
    foto.style.height = '50px';
    foto.style.borderRadius = '50%';
    foto.style.marginRight = '10px';

    // Nome do vendedor
    const name = document.createElement('div');
    name.classList.add('name');
    name.textContent = vendedor.nome;

    // Pontuação do vendedor
    const points = document.createElement('div');
    points.classList.add('points');
    points.innerHTML = `<span class="icon">⭐</span> ${vendedor.pontos} pontos`;

    // Botões para adicionar ou diminuir pontos (visíveis apenas para administrador)
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    
    // Botão para aumentar pontos
    const addButton = document.createElement('button');
    addButton.classList.add('control-button');
    addButton.innerHTML = '<span class="material-icons">add</span>';
    addButton.style.display = document.body.classList.contains('admin-mode') ? 'inline-block' : 'none'; // Só exibe se admin-mode estiver ativo
    addButton.addEventListener('click', async () => {
      if (document.body.classList.contains('admin-mode')) {
        vendedor.pontos += 1; 
        await atualizarPontosFirestore(vendedor.id, 1);
        gerarRanking(); 
      }
    });

    // Botão para diminuir pontos
    const removeButton = document.createElement('button');
    removeButton.classList.add('control-button');
    removeButton.innerHTML = '<span class="material-icons">remove</span>';
    removeButton.style.display = document.body.classList.contains('admin-mode') ? 'inline-block' : 'none'; // Só exibe se admin-mode estiver ativo
    removeButton.addEventListener('click', async () => {
      if (document.body.classList.contains('admin-mode')) {
        vendedor.pontos -= 1; 
        await atualizarPontosFirestore(vendedor.id, -1);
        gerarRanking();
      }
    });

    buttonContainer.appendChild(addButton);
    buttonContainer.appendChild(removeButton);

    // Adiciona os elementos ao item da lista
    listItem.appendChild(positionIcon);
    listItem.appendChild(foto);
    listItem.appendChild(name);
    listItem.appendChild(points);
    listItem.appendChild(buttonContainer);

    rankingList.appendChild(listItem);
  });
}

// Carrega os dados dos vendedores ao inicializar a página
window.onload = carregarPontosDosVendedores;
