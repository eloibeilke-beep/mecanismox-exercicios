// ================= DATABASE =================
const SUPABASE_URL = "https://looralwrgiubwqvpwipa.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb3JhbHdyZ2l1YndxdnB3aXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjkzOTgsImV4cCI6MjA5MjgwNTM5OH0.ncSSZqooWZlUcp_UZylNcrzRzCzUCuB7eRZfeM4f310";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const DB = {
  async getPacientes() {
    const { data, error } = await _supabase
      .from("pacientes")
      .select("*")
      .order("nome", { ascending: true });
    if (error) console.error("Erro ao buscar pacientes:", error);
    return data || [];
  },

  async savePaciente(paciente) {
    const { data, error } = await _supabase
      .from("pacientes")
      .upsert(paciente)
      .select();
    if (error) console.error("Erro ao salvar paciente:", error);
    return data;
  },

  async deletePaciente(id) {
    const { error } = await _supabase.from("pacientes").delete().eq("id", id);
    if (error) console.error("Erro ao excluir:", error);
  },

  async getHistorico(pacienteId) {
    const { data, error } = await _supabase
      .from("historico")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("created_at", { ascending: false });
    return data || [];
  },

  async addHistorico(item) {
    const { error } = await _supabase.from("historico").insert(item);
    if (error) console.error("Erro ao adicionar histórico:", error);
  },
};

// Função auxiliar para criar uma pausa (delay) entre ações
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ================= NORMALIZAR NÚMERO =================
function normalizarNumero(numero) {
  numero = numero.replace(/\D/g, "");

  if (numero.startsWith("5549")) {
    let resto = numero.substring(4);

    if (resto.length > 9 && resto.startsWith("9")) {
      numero = "5549" + resto.substring(1);
    }
  }
  return numero;
}

// ================= PACIENTES =================
let pacientes = [];
let editIndex = -1;
let editId = null;

// ATUALIZA LISTA DE PACIENTES COM ORDENAÇÃO E FILTRO
async function atualizarListaPacientes(filtro = "") {
  pacientes = await DB.getPacientes();
  let pacientesFiltrados = pacientes.filter(
    (p) => p && p.nome && p.nome.toLowerCase().includes(filtro.toLowerCase()),
  );

  const selectPacientes = document.getElementById("pacientes");
  selectPacientes.innerHTML = "";

  pacientesFiltrados.forEach((p) => {
    const option = document.createElement("option");
    option.value = p.id;
    option.textContent = `${p.nome} (${p.numero})`;
    selectPacientes.appendChild(option);
  });

  renderHistorico();
}

// ADICIONAR PACIENTE
async function addPaciente() {
  let nome = document.getElementById("nome").value.trim();
  let numero = normalizarNumero(document.getElementById("numero").value.trim());

  if (!nome || !numero) {
    alert("Preencha nome e número");
    return;
  }

  const payload = { nome, numero };
  if (editId) {
    payload.id = editId;
    editId = null;
  } else {
    // Novo paciente
  }

  await DB.savePaciente(payload);
  await atualizarListaPacientes();
  document.getElementById("nome").value = "";
  document.getElementById("numero").value = "";
  toggleBotoes(false);
}

// EDITAR PACIENTE
function editarPaciente() {
  const select = document.getElementById("pacientes");
  if (select.value === "") return alert("Selecione um paciente para editar");
  const paciente = pacientes.find((p) => p.id === select.value);
  document.getElementById("nome").value = paciente.nome;
  document.getElementById("numero").value = paciente.numero;
  editId = paciente.id;
  toggleBotoes(true);
}

// EXCLUIR PACIENTE
async function excluirPaciente() {
  const select = document.getElementById("pacientes");
  if (select.value === "") return alert("Selecione um paciente para excluir");
  const id = select.value;
  const paciente = pacientes.find((p) => p.id === id);

  if (confirm(`Excluir paciente ${paciente.nome}?`)) {
    await DB.deletePaciente(id);
    await atualizarListaPacientes();
    toggleBotoes(false);
  }
}

// MOSTRA OU ESCONDE BOTÕES DE EDIÇÃO/EXCLUSÃO
function toggleBotoes(editando) {
  document.getElementById("btnSalvar").style.display = editando
    ? "none"
    : "block";
  document.getElementById("btnSalvarEdicao").style.display = editando
    ? "block"
    : "none";
  document.getElementById("btnExcluir").style.display = editando
    ? "block"
    : "none";
}

// ================= EXERCÍCIOS =================
const exercicios = {
  "QUEIXO RODADO": [
    {
      nome: "Isometria em rotação",
      video: "https://youtu.be/6WktWfRt4iE",
      rep: "2X 20 segundos de resistência para cada lado",
    },
    {
      nome: "Ante e Retroversão em Pé",
      video: "https://youtu.be/Gh4YNRy8OZ8",
      rep: "2X 16 repetições",
    },
    {
      nome: "Isometria em Anteriorização",
      video: "https://youtu.be/CF0F2ZoXNP0",
      rep: "2X 20 segundos de resistência para cada lado",
    },
    {
      nome: "Movimento Semicircular dos Ombros",
      video: "https://youtu.be/cfYiUvDyYBQ",
      rep: "2X 8 repetições",
    },
  ],

  "CABEÇA INCLINADA": [
    {
      nome: "Autoliberação da Lateral do Pescoço",
      video: "https://youtu.be/G-NoJC96jEc",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Mobilidade em Dorsiflexão",
      video: "https://youtu.be/rbmM_O_-QFk",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Isometria em Inclinação do Pescoço",
      video: "https://youtu.be/l8SLbkodYUw",
      rep: "2X 20 segundos de resistência para cada lado",
    },
    {
      nome: "Movimento Semicircular do Ombro",
      video: "https://youtu.be/cfYiUvDyYBQ",
      rep: "2X 10 repetições",
    },
  ],

  "CABEÇA FAT FAMILY": [
    {
      nome: "Protração e Retração Escapular",
      video: "https://youtu.be/jjo2kmBvETQ",
      rep: "2X 16 repetições",
    },
    {
      nome: "Pêndulo com a Perna",
      video: "https://youtu.be/rll3KLme2Xk",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Rotação Torácica na Parede",
      video: "https://youtu.be/oLQT6K0LwrA",
      rep: "2X 16 repetições cada lado",
    },
    {
      nome: "Posição Fetal",
      video: "https://youtu.be/cpkcC2mx6Lg",
      rep: "2X 16 repetições",
    },
  ],

  "QUEIXO ELEVADO": [
    {
      nome: "Alongamento do Gato",
      video: "https://youtu.be/tggvlRnGsJw",
      rep: "2X 16 repetições",
    },
    {
      nome: "Dissociação Pélvica",
      video: "https://youtu.be/ljaDFzRimp8",
      rep: "2X 14 repetições para cada lado",
    },
    {
      nome: "Autoliberação dos Eretores Cervicais",
      video: "https://youtu.be/O9WoNApOCNE",
      rep: "2X 14 repetições",
    },
    {
      nome: "Autoliberação dos Peitorais",
      video: "https://youtu.be/neez2X837Q4",
      rep: "2X 10 repetições",
    },
  ],

  "CLAVÍCULA COM PERNA DE V": [
    {
      nome: "Direção Joelho - Hálux",
      video: "https://youtu.be/D1sdwwgModo",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Rotação à posterior dos Ombros",
      video: "https://youtu.be/vzD-83Jtzeo",
      rep: "2X 16 repetições",
    },
    {
      nome: "Expansão Respiratória",
      video: "https://youtu.be/Iq34QAvrn6Q",
      rep: "2X 10 repetições",
    },
    {
      nome: "Autoliberação do Trapézio",
      video: "https://youtu.be/Lv9G2zqSsZY",
      rep: "2X 16 repetições",
    },
  ],

  "BIGODE DO UMBIGO": [
    {
      nome: "Balanço da Marcha",
      video: "https://youtu.be/L7qY_QQm8gc",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Expansão Diagonal",
      video: "https://youtu.be/l0CGB3sCApU",
      rep: "2X 12 repetições para cada lado",
    },
    {
      nome: "Mobilidade TQTL",
      video: "https://youtu.be/0o8NpVqrrrw",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Mobilidade Torácica",
      video: "https://youtu.be/AZX5nVlzoOw",
      rep: "2X 16 repetições para cada lado",
    },
  ],

  "VENTRE GIRADO PARA...": [
    {
      nome: "Equilíbrio Contralateral",
      video: "https://youtu.be/PPhNACpOGH8",
      rep: "2X 30 segundos para cada lado",
    },
    {
      nome: "Rotação Contralateral",
      video: "https://youtu.be/b6nSXnDgDrw",
      rep: "2X 24 repetições",
    },
    {
      nome: "Cotovelo Para a Coxa",
      video: "https://youtu.be/fHf8PgpPG_k",
      rep: "2X 12 repetições para cada lado",
    },
    {
      nome: "Subida no Degrau com Rotação",
      video: "https://youtu.be/NqV5OCW-NIo",
      rep: "2X 12 repetições para cada lado",
    },
  ],

  "LATERAL MAIS BAIXA PARA...": [
    {
      nome: "Deslocamento Pélvico Lateral",
      video: "https://youtu.be/FdxqZa1nCdU",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Inclinação em Semi Joelho",
      video: "https://youtu.be/09mOaaOltZ4",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Autoliberação do Diafragma",
      video: "https://youtu.be/BTswHzXUXXw",
      rep: "2X 14 repetições para cada lado",
    },
    {
      nome: "Ciclo Respiratório",
      video: "https://youtu.be/IFfugNVL80g",
      rep: "2X 14 repetições",
    },
  ],

  "PELVE MAIS ALTA A...": [
    {
      nome: "Planador",
      video: "https://youtu.be/TjjLaRRVPls",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Dissociação de Adutores",
      video: "https://youtu.be/zds4l12L3Ys",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Afastamento dos Joelhos",
      video: "https://youtu.be/44PRvRZDxjc",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Esfinge",
      video: "https://youtu.be/1ijlpffMZkg",
      rep: "2X 12 repetições",
    },
  ],

  "OMBRO ELEVADO": [
    {
      nome: "Autoliberação do Trapézio Superior",
      video: "https://youtu.be/Lv9G2zqSsZY",
      rep: "2X 16 repetições",
    },
    {
      nome: "Alongamento do Trapézio",
      video: "https://youtu.be/G-NoJC96jEc",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Rotação de Ombros",
      video: "https://youtu.be/vzD-83Jtzeo",
      rep: "2X 16 repetições",
    },
    {
      nome: "Depressão Escapular",
      video: "https://youtu.be/jjo2kmBvETQ",
      rep: "2X 16 repetições",
    },
  ],

  "OMBRO RODADO": [
    {
      nome: "Rotação Interna do Ombro",
      video: "https://youtu.be/vzD-83Jtzeo",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Alongamento do Peitoral",
      video: "https://youtu.be/neez2X837Q4",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Protração Escapular",
      video: "https://youtu.be/jjo2kmBvETQ",
      rep: "2X 16 repetições",
    },
    {
      nome: "Mobilidade Glenoumeral",
      video: "https://youtu.be/cfYiUvDyYBQ",
      rep: "2X 12 repetições",
    },
  ],

  "COTOVELO VALGIZADO": [
    {
      nome: "Extensão do Cotovelo",
      video: "https://youtu.be/D1sdwwgModo",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Pronação e Supinação",
      video: "https://youtu.be/rbmM_O_-QFk",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Alongamento do Bíceps",
      video: "https://youtu.be/tggvlRnGsJw",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Alongamento do Tríceps",
      video: "https://youtu.be/neez2X837Q4",
      rep: "2X 20 segundos para cada lado",
    },
  ],

  "COTOVELO VARIZIZADO": [
    {
      nome: "Flexão do Cotovelo",
      video: "https://youtu.be/D1sdwwgModo",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Supinação Resistida",
      video: "https://youtu.be/rbmM_O_-QFk",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Alongamento do Pronador",
      video: "https://youtu.be/tggvlRnGsJw",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Mobilidade do Cotovelo",
      video: "https://youtu.be/cfYiUvDyYBQ",
      rep: "2X 12 repetições",
    },
  ],

  "PUNHO DESVIADO": [
    {
      nome: "Flexão e Extensão do Punho",
      video: "https://youtu.be/D1sdwwgModo",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Desvio Radial e Ulnar",
      video: "https://youtu.be/rbmM_O_-QFk",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Alongamento dos Flexores",
      video: "https://youtu.be/tggvlRnGsJw",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Alongamento dos Extensores",
      video: "https://youtu.be/neez2X837Q4",
      rep: "2X 20 segundos para cada lado",
    },
  ],

  "JOELHO VALGIZADO": [
    {
      nome: "Fortalecimento do Glúteo Médio",
      video: "https://youtu.be/44PRvRZDxjc",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Afastamento dos Joelhos",
      video: "https://youtu.be/44PRvRZDxjc",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Alongamento do Adutor",
      video: "https://youtu.be/zds4l12L3Ys",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Mobilidade do Joelho",
      video: "https://youtu.be/ljaDFzRimp8",
      rep: "2X 16 repetições",
    },
  ],

  "JOELHO VARIZIZADO": [
    {
      nome: "Fortalecimento do Vasto Medial",
      video: "https://youtu.be/D1sdwwgModo",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Alongamento do Tensor da Fáscia Lata",
      video: "https://youtu.be/FdxqZa1nCdU",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Mobilidade em Abdução",
      video: "https://youtu.be/44PRvRZDxjc",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Estabilização do Joelho",
      video: "https://youtu.be/ljaDFzRimp8",
      rep: "2X 16 repetições",
    },
  ],

  "PÉ PRONADO": [
    {
      nome: "Fortalecimento do Tibial Anterior",
      video: "https://youtu.be/D1sdwwgModo",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Alongamento do Sóleo",
      video: "https://youtu.be/rbmM_O_-QFk",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Mobilidade do Tornozelo",
      video: "https://youtu.be/tggvlRnGsJw",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Fortalecimento do Arco Plantar",
      video: "https://youtu.be/cfYiUvDyYBQ",
      rep: "2X 16 repetições",
    },
  ],

  "PÉ SUPINADO": [
    {
      nome: "Fortalecimento do Fibular",
      video: "https://youtu.be/D1sdwwgModo",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Alongamento do Tibial Anterior",
      video: "https://youtu.be/rbmM_O_-QFk",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Mobilidade em Inversão",
      video: "https://youtu.be/tggvlRnGsJw",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Estabilização do Tornozelo",
      video: "https://youtu.be/cfYiUvDyYBQ",
      rep: "2X 16 repetições",
    },
  ],

  "BATE A PORTA DO CARRO P/ UM DOS LADOS E A PELVE GIRA OU O TRONCO INCLINA": [
    {
      nome: "Planador",
      video: "https://youtu.be/TjjLaRRVPls",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Mobilidade TFL",
      video: "https://youtu.be/bfd0QVxP9Is",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Deslocamento Pélvico Lateral",
      video: "https://youtu.be/FdxqZa1nCdU",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Esfinge",
      video: "https://youtu.be/1ijlpffMZkg",
      rep: "2X 12 repetições",
    },
  ],

  "UMBIGO NÃO ACOMPANHA O GIRO DO TRONCO": [
    {
      nome: "Equilíbrio Contralateral",
      video: "https://youtu.be/PPhNACpOGH8",
      rep: "2X 30 segundos para cada lado",
    },
    {
      nome: "Rotação Contralateral",
      video: "https://youtu.be/b6nSXnDgDrw",
      rep: "2X 24 repetições",
    },
    {
      nome: "Cotovelo Para a Coxa",
      video: "https://youtu.be/fHf8PgpPG_k",
      rep: "2X 12 repetições para cada lado",
    },
    {
      nome: "Subida no Degrau com Rotação",
      video: "https://youtu.be/NqV5OCW-NIo",
      rep: "2X 12 repetições para cada lado",
    },
  ],

  "TÍBIA NÃO VAI PARA DORSIFLEXÃO": [
    {
      nome: "Mobilidade TFL",
      video: "https://youtu.be/bfd0QVxP9Is",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Balanço para Tornozelo",
      video: "https://youtu.be/IVcua4JDuDA",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Autoliberação dos Fibulares",
      video: "https://youtu.be/5e9SJnUWfzg",
      rep: "2X 10 repetições (ciclo) para cada lado",
    },
    {
      nome: "Alongamento dos Fibulares",
      video: "https://youtu.be/UvEEkZWfJrI",
      rep: "2X 20 segundos para cada lado",
    },
  ],

  "PÉ NÃO PRONA": [
    {
      nome: "Mobilidade em Dorsiflexão",
      video: "https://youtu.be/1XN8qntLZY8",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Mobilidade de Tornozelo Frente a Parede",
      video: "https://youtu.be/PZTJ1QdkL7M",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Joelho ao Hálux",
      video: "https://youtu.be/ERSnwnPYp5o",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Autoliberação do Tibial Anterior",
      video: "https://youtu.be/6Hp2hxlJemY",
      rep: "2X 18 repetições para cada lado",
    },
  ],

  "PÉ NÃO SUPINA": [
    {
      nome: "Caminhada Frontal nos Calcanhares",
      video: "https://youtu.be/vzHktXCUsro",
      rep: "2X 14 repetições",
    },
    {
      nome: "Joelho ao Hálux",
      video: "https://youtu.be/ERSnwnPYp5o",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Elasticidade para o TFL",
      video: "https://youtu.be/feL6n_Voejw",
      rep: "2X 18 repetições para cada lado",
    },
    {
      nome: "Alongamento Para Panturrilha",
      video: "https://youtu.be/l_FrFliCB90",
      rep: "2X 20 segundos para cada lado",
    },
  ],

  "TIBIA/TORNOZELO RODA PARA MEDIAL": [
    {
      nome: "Abraçar Joelho Alternado",
      video: "https://youtu.be/ob8dq-31S2o",
      rep: "2X 16 repetições",
    },
    {
      nome: "Flexão de Quadril",
      video: "https://youtu.be/I4r7iOavmAA",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Mobilidade GOC",
      video: "https://youtu.be/V_KLjtsEx0M",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Agachamento Isométrico na Parede",
      video: "https://youtu.be/ZWzDvosYakA",
      rep: "2X 20 segundos",
    },
  ],

  "TIBIA/TORNOZELO RODA PARA LATERAL": [
    {
      nome: "Abraçar Joelho Alternado",
      video: "https://youtu.be/ob8dq-31S2o",
      rep: "2X 16 repetições",
    },
    {
      nome: "Flexão de Quadril",
      video: "https://youtu.be/I4r7iOavmAA",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Mobilidade GOC",
      video: "https://youtu.be/V_KLjtsEx0M",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Agachamento Isométrico na Parede",
      video: "https://youtu.be/ZWzDvosYakA",
      rep: "2X 20 segundos",
    },
  ],

  "NÃO VAI PARA ANTE": [
    {
      nome: "Fortalecimento Para os Glúteos",
      video: "https://youtu.be/3MdZmPCUFx0",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Estabilidade Lombar",
      video: "https://youtu.be/pVwVeGDi4kY",
      rep: "2X 10 repetições para cada lado",
    },
    {
      nome: "Elasticidade para Piriforme",
      video: "https://youtu.be/VHzrfXBiaSo",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Elasticidade para quadríceps",
      video: "https://youtu.be/j6R44TZZfpw",
      rep: "2X 16 repetições para cada lado",
    },
  ],

  "NÃO VAI PARA RETRO": [
    {
      nome: "Abraçar Joelho Alternado",
      video: "https://youtu.be/ob8dq-31S2o",
      rep: "2X 16 repetições",
    },
    {
      nome: "Flexão de Quadril",
      video: "https://youtu.be/I4r7iOavmAA",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Mobilidade GOC",
      video: "https://youtu.be/V_KLjtsEx0M",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Agachamento Isométrico na Parede",
      video: "https://youtu.be/ZWzDvosYakA",
      rep: "2X 20 segundos",
    },
  ],

  "COSTELA NÃO ABRE": [
    {
      nome: "Deslocamento Pélvico Lateral",
      video: "https://youtu.be/FdxqZa1nCdU",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Inclinação em Semi Joelho",
      video: "https://youtu.be/09mOaaOltZ4",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Autoliberação do Diafragma",
      video: "https://youtu.be/BTswHzXUXXw",
      rep: "2X 14 repetições para cada lado",
    },
    {
      nome: "Ciclo Respiratório",
      video: "https://youtu.be/IFfugNVL80g",
      rep: "2X 14 repetições",
    },
  ],

  "RESPIRAÇÃO PARADOXAL": [
    {
      nome: "Deslocamento Pélvico Lateral",
      video: "https://youtu.be/FdxqZa1nCdU",
      rep: "2X 20 segundos para cada lado",
    },
    {
      nome: "Inclinação em Semi Joelho",
      video: "https://youtu.be/09mOaaOltZ4",
      rep: "2X 16 repetições para cada lado",
    },
    {
      nome: "Autoliberação do Diafragma",
      video: "https://youtu.be/BTswHzXUXXw",
      rep: "2X 14 repetições para cada lado",
    },
    {
      nome: "Ciclo Respiratório",
      video: "https://youtu.be/IFfugNVL80g",
      rep: "2X 14 repetições",
    },
  ],
};

// CARREGA EXERCÍCIOS DE ACORDO COM A ABERRÂNCIA SELECIONADA
function carregarExercicios() {
  const div = document.getElementById("exercicios");
  const sel = document.getElementById("aberrancia");
  div.innerHTML = "";

  const key = sel.value;
  if (!key) return;

  exercicios[key].forEach((ex, i) => {
    if (ex.nome) {
      div.innerHTML += `
        <label style="display:block; margin:4px">
          <input type="checkbox" name="exercicio" value="${i}"> <b>${ex.nome}</b> - <small>${ex.rep}</small>
        </label>
      `;
    } else if (ex.nota) {
      div.innerHTML += `
        <p style="color:red; font-weight:bold; margin:4px;">${ex.nota}</p>
      `;
    }
  });
}

// FILTRA ABERRÂNCIAS POR INICIAIS
function filtrarAberrancia() {
  const filtro = document
    .getElementById("buscaraberrancia")
    .value.trim()
    .toUpperCase();
  const lista = document.getElementById("listaAberrancia");
  const selAberrancia = document.getElementById("aberrancia");

  lista.innerHTML = "";

  if (!filtro) {
    lista.style.display = "none";
    return;
  }

  const opcoes = Array.from(selAberrancia.options).filter((opt) =>
    opt.text.toUpperCase().startsWith(filtro),
  );

  if (opcoes.length === 0) {
    lista.style.display = "none";
    return;
  }

  opcoes.forEach((opt, idx) => {
    const div = document.createElement("div");
    div.textContent = opt.text;
    div.dataset.value = opt.value;
    div.dataset.index = idx;
    div.onclick = () => selecionarAberrancia(opt.value);
    lista.appendChild(div);
  });

  lista.style.display = "block";
}

function navegarAberrancia(e) {
  const lista = document.getElementById("listaAberrancia");
  const itens = lista.querySelectorAll("div");

  if (e.key === "ArrowDown") {
    e.preventDefault();
    const selecionado = lista.querySelector(".selecionado");
    if (!selecionado && itens.length > 0) {
      itens[0].classList.add("selecionado");
    } else if (selecionado) {
      const proximo = selecionado.nextElementSibling;
      if (proximo) {
        selecionado.classList.remove("selecionado");
        proximo.classList.add("selecionado");
      }
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const selecionado = lista.querySelector(".selecionado");
    if (selecionado) {
      const anterior = selecionado.previousElementSibling;
      if (anterior) {
        selecionado.classList.remove("selecionado");
        anterior.classList.add("selecionado");
      }
    }
  } else if (e.key === "Enter") {
    e.preventDefault();
    const selecionado = lista.querySelector(".selecionado");
    if (selecionado) {
      selecionarAberrancia(selecionado.dataset.value);
    }
  }
}

function selecionarAberrancia(value) {
  document.getElementById("aberrancia").value = value;
  document.getElementById("buscaraberrancia").value = "";
  document.getElementById("listaAberrancia").style.display = "none";
  carregarExercicios();
}

// ================= ENVIAR MENSAGEM =================
function enviarMensagem() {
  const selectPacientes = document.getElementById("pacientes");
  if (selectPacientes.value === "") return alert("Selecione o paciente");

  const paciente = pacientes.find((p) => p.id === selectPacientes.value);
  const mensagem = document.getElementById("mensagemExtra").value.trim();

  if (!mensagem) return alert("Digite uma mensagem");

  // Registro comercial de envio
  _supabase
    .from("logs_envios")
    .insert([
      {
        paciente_id: paciente.id,
        tipo_mensagem: "texto",
        status: "enviado_manual",
      },
    ])
    .then();

  // Usamos um nome de janela ("wa_window") para evitar abrir várias abas
  // e não interromper o script da página principal
  const url = `whatsapp://send?phone=${paciente.numero}&text=${encodeURIComponent(mensagem)}`;
  window.open(url, "wa_window");
}

// ================= ENVIAR VIDEOS =================
async function enviarVideos() {
  const selectPacientes = document.getElementById("pacientes");
  if (selectPacientes.value === "") return alert("Selecione o paciente");

  const paciente = pacientes.find((p) => p.id === selectPacientes.value);
  const aberrancia = document.getElementById("aberrancia").value;
  const selecionados = Array.from(
    document.querySelectorAll("#exercicios input[type='checkbox']:checked"),
  );

  if (!aberrancia) return alert("Selecione uma aberrancia");
  if (selecionados.length === 0)
    return alert("Selecione pelo menos um exercicio");

  // Desabilita o botão para evitar cliques duplos durante o processo longo
  const btnOriginal = document.querySelector(
    "button[onclick='enviarVideos()']",
  );
  btnOriginal.disabled = true;
  btnOriginal.textContent = "⏳ Enviando...";

  const nomesExercicios = [];

  try {
    for (const [index, checkbox] of selecionados.entries()) {
      const ex = exercicios[aberrancia][checkbox.value];
      nomesExercicios.push(ex.nome);

      // Log comercial para controle
      await _supabase.from("logs_envios").insert([
        {
          paciente_id: paciente.id,
          tipo_mensagem: "video",
          status: "processando_manual",
        },
      ]);

      // Melhoramos a formatação: O link deve estar isolado ao final para facilitar a miniatura
      const mensagem = `\u2705 *${ex.nome}*\n${ex.rep}\n\nAssista ao vídeo explicativo:\n${ex.video}`;

      btnOriginal.textContent = `⏳ Processando ${index + 1} de ${selecionados.length}...`;

      // Tentativa de envio automático (API)
      const enviado = await enviarViaAPI(paciente.numero, mensagem);

      // IMPORTANTE: Adicionamos um delay mesmo se enviado via API para o servidor respirar
      const tempoEspera = enviado ? 3000 : 6000;

      if (!enviado) {
        // Fallback: Se a API falhar ou não estiver configurada, usa o modo manual
        window.open(
          `whatsapp://send?phone=${paciente.numero}&text=${encodeURIComponent(mensagem)}`,
          "wa_window",
        );
      }

      // Aguarda o tempo necessário para processamento da miniatura antes de ir para o próximo
      if (index < selecionados.length - 1) {
        await delay(tempoEspera);
      }
    }
    alert(
      "Todos os links foram enviados para o WhatsApp. Verifique se clicou em enviar em cada um deles.",
    );
  } catch (err) {
    console.error("Erro no envio:", err);
  } finally {
    btnOriginal.disabled = false;
    btnOriginal.textContent = "🎥 Enviar Vídeos";
  }

  await DB.addHistorico({
    paciente_id: paciente.id,
    aberrancia,
    exercicios: nomesExercicios,
  });
  renderHistorico();
}

// FUNÇÃO PARA ENVIO AUTOMÁTICO VIA API (O QUE VOCÊ VAI VENDER)
async function enviarViaAPI(numero, mensagem) {
  const { data, error } = await _supabase.functions.invoke("enviar-whatsapp", {
    body: {
      numero: numero,
      mensagem: mensagem,
      // Aqui você passaria as chaves do seu cliente vindas da tabela 'configuracoes_venda'
    },
  });
  return !error;
}

// ================= HISTÓRICO =================
async function renderHistorico() {
  const selectPacientes = document.getElementById("pacientes");
  const historicoDiv = document.getElementById("historico");
  historicoDiv.innerHTML = "";

  if (selectPacientes.value === "") return;

  const h = await DB.getHistorico(selectPacientes.value);
  h.forEach((item) => {
    const div = document.createElement("div");
    div.style.marginBottom = "6px";
    div.innerHTML = `<b>${new Date(item.created_at).toLocaleDateString()}</b> - ${item.aberrancia}: ${item.exercicios.join(", ")}`;
    historicoDiv.appendChild(div);
  });
}

// ================= EXPORTAR DADOS =================
async function exportarDados() {
  const dados = {
    pacientes: await DB.getPacientes(),
    historico: [], // No Supabase o histórico é buscado por paciente, exportar tudo exigiria uma query global.
  };
  const json = JSON.stringify(dados, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert("Backup baixado com sucesso!");
}

// ================= IMPORTAR DADOS =================
async function importarDados(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const dados = JSON.parse(e.target.result);
      if (dados.pacientes) {
        for (const p of dados.pacientes) {
          await DB.savePaciente({ nome: p.nome, numero: p.numero });
        }
        await atualizarListaPacientes();
        alert("Dados importados com sucesso!");
      } else {
        alert("Arquivo inválido!");
      }
    } catch (error) {
      alert("Erro ao importar: " + error.message);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

// ================= INICIALIZAÇÃO =================
document.addEventListener("DOMContentLoaded", () => {
  const selAberrancia = document.getElementById("aberrancia");
  Object.keys(exercicios).forEach((ab) => {
    const option = document.createElement("option");
    option.value = ab;
    option.textContent = ab;
    selAberrancia.appendChild(option);
  });

  document.getElementById("btnSalvar").addEventListener("click", () => {
    addPaciente();
    toggleBotoes(false);
  });
  document.getElementById("btnSalvarEdicao").addEventListener("click", () => {
    addPaciente();
    toggleBotoes(false);
  });
  document.getElementById("btnExcluir").addEventListener("click", () => {
    excluirPaciente();
    toggleBotoes(false);
  });

  const btnEditar = document.createElement("button");
  btnEditar.textContent = "Editar";
  btnEditar.style.backgroundColor = "#f39c12";
  btnEditar.style.color = "white";
  btnEditar.style.width = "100%";
  btnEditar.style.marginTop = "6px";
  btnEditar.addEventListener("click", editarPaciente);
  document
    .querySelector(".sidebar")
    .insertBefore(btnEditar, document.getElementById("btnSalvarEdicao"));

  document.getElementById("pacientes").addEventListener("change", () => {
    renderHistorico();
    const selecionado = document.getElementById("pacientes").value !== "";
    btnEditar.style.display = selecionado ? "block" : "none";
    document.getElementById("btnExcluir").style.display = selecionado
      ? "block"
      : "none";
  });

  document.getElementById("buscarPaciente").addEventListener("input", (e) => {
    atualizarListaPacientes(e.target.value);
  });

  // Faz com que a mensagem selecionada no 'select' apareça no 'textarea' para edição
  document.getElementById("mensagemPadrao").addEventListener("change", (e) => {
    document.getElementById("mensagemExtra").value = e.target.value;
  });

  atualizarListaPacientes();
});
