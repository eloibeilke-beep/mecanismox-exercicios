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

  async getBiblioteca() {
    const { data, error } = await _supabase
      .from("biblioteca_exercicios")
      .select("*")
      .order("categoria", { ascending: true });
    return data || [];
  }
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
let exercicios = {};

async function carregarBibliotecaDeExercicios() {
  const rawData = await DB.getBiblioteca();
  
  // Transforma os dados do banco no formato que o app já usa
  exercicios = rawData.reduce((acc, curr) => {
    if (!acc[curr.categoria]) acc[curr.categoria] = [];
    acc[curr.categoria].push({
      nome: curr.nome,
      video: curr.video_url,
      rep: curr.reps
    });
    return acc;
  }, {});

  // Atualiza o select de aberrâncias na tela
  const selAberrancia = document.getElementById("aberrancia");
  selAberrancia.innerHTML = '<option value="">Selecione uma aberrância</option>';
  Object.keys(exercicios).forEach((ab) => {
    const option = document.createElement("option");
    option.value = ab;
    option.textContent = ab;
    selAberrancia.appendChild(option);
  });
}

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
async function enviarMensagem() {
  const selectPacientes = document.getElementById("pacientes");
  if (selectPacientes.value === "") return alert("Selecione o paciente");

  const paciente = pacientes.find((p) => p.id === selectPacientes.value);
  const mensagem = document.getElementById("mensagemExtra").value.trim();

  if (!mensagem) return alert("Digite uma mensagem");

  const btn = document.querySelector("button[onclick='enviarMensagem()']");
  const textoOriginal = btn.textContent;
  btn.disabled = true;
  btn.textContent = "⏳ Enviando...";

  try {
    // Registro comercial de envio
    await _supabase.from("logs_envios").insert([
      {
        paciente_id: paciente.id,
        tipo_mensagem: "texto",
        status: "enviado_manual",
      },
    ]);

    const url = `whatsapp://send?phone=${paciente.numero}&text=${encodeURIComponent(mensagem)}`;
    window.open(url, "wa_window");
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
  } finally {
    btn.disabled = false;
    btn.textContent = textoOriginal;
  }
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

      if (!enviado) {
        // Fallback: Se a API falhar ou não estiver configurada, usa o modo manual
        window.open(
          `whatsapp://send?phone=${paciente.numero}&text=${encodeURIComponent(mensagem)}`,
          "wa_window",
        );
      }

      // Aguarda o tempo necessário para dar tempo de enviar um por um na fila
      if (index < selecionados.length - 1) {
        const tempoEspera = enviado ? 4000 : 10000; // 4s para API, 10s para manual (WhatsApp Desktop)
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
document.addEventListener("DOMContentLoaded", async () => {
  await carregarBibliotecaDeExercicios();

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
