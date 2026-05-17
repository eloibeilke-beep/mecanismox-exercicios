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
    if (error) console.error("Erro ao buscar biblioteca:", error);
    return data || [];
  },
};

// Função auxiliar para criar uma pausa (delay) entre ações
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Função para mostrar o temporizador visual na tela
let pipWindow = null;

async function mostrarTemporizador(ms) {
  const container = document.getElementById("temporizador-container");
  const span = document.getElementById("segundos-timer");
  let segundosRestantes = Math.ceil(ms / 1000);

  container.style.display = "block";
  container.classList.add("timer-fixo");

  // Ajustes de dimensões para garantir que o texto caiba perfeitamente
  container.style.width = "190px";
  container.style.height = "36px";
  container.style.lineHeight = "36px";
  container.style.padding = "10px";
  container.style.fontSize = "12px";
  container.style.textAlign = "center"; // Centraliza o texto

  span.textContent = segundosRestantes;

  // Tenta abrir em modo Picture-in-Picture (Sempre no topo) se o navegador permitir
  if (window.documentPictureInPicture) {
    try {
      pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 190,
        height: 50, // Aumentado para garantir espaço interno
      });
      // Move o timer para a janela flutuante
      pipWindow.document.body.append(container);
      container.classList.remove("timer-fixo");
      container.style.display = "flex";
    } catch (e) {
      console.log("PiP não iniciado ou recusado.");
    }
  }

  return new Promise((resolve) => {
    const intervalo = setInterval(() => {
      segundosRestantes--;
      span.textContent = segundosRestantes;

      if (segundosRestantes <= 0) {
        clearInterval(intervalo);
        if (pipWindow) {
          pipWindow.close();
          document.body.append(container); // Devolve o elemento para a página
          pipWindow = null;
        }
        container.style.display = "none";
        window.focus(); // Tenta trazer o foco de volta para o navegador
        resolve();
      }
    }, 1000);
  });
}

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
      rep: curr.reps,
    });
    return acc;
  }, {});

  // Atualiza o select de aberrâncias na tela
  const selAberrancia = document.getElementById("aberrancia");
  selAberrancia.innerHTML =
    '<option value="">Selecione uma aberrância</option>';
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

  const categoria = sel.value;
  if (!categoria) return;

  exercicios[categoria].forEach((ex, i) => {
    if (ex.nome) {
      // Extrair ID do vídeo para a miniatura
      const videoId = ex.video.split('v=')[1]?.split('&')[0] || ex.video.split('/').pop();
      const thumbUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

      div.innerHTML += `
        <div class="card-ex" onclick="toggleExercicio(this)">
          <img src="${thumbUrl}" alt="Thumbnail">
          <input type="checkbox" name="exercicio" value="${i}" onclick="event.stopPropagation()">
          <b>${ex.nome}</b>
          <small>${ex.rep}</small>
        </div>
      `;
    }
  });
}

// Função para selecionar o card visualmente
function toggleExercicio(card) {
  const cb = card.querySelector('input');
  cb.checked = !cb.checked;
  card.classList.toggle('selected', cb.checked);
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

  const opcoes = Array.from(selAberrancia.options).filter(
    (opt) => opt.value !== "" && opt.text.toUpperCase().includes(filtro),
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
// Variáveis para controle de fila manual no celular
let filaManual = [];
let indiceManual = 0;
let pacienteAtualManual = null;
let aberranciaAtualManual = "";

async function enviarVideos() {
  // Se já existir uma fila em andamento, apenas executa o próximo passo
  if (filaManual.length > 0) {
    executarProximoManual();
    return;
  }

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

  const btnOriginal = document.querySelector(".btn-wa-vid");
  btnOriginal.disabled = true;
  btnOriginal.textContent = "⏳ Preparando...";

  const nomesExercicios = [];

  try {
    // 1. Verificar se a API está configurada
    const { data: config } = await _supabase.from("configuracoes_venda").select("*").limit(1).maybeSingle();
    const temAPI = config && config.gateway_url && config.gateway_url.includes("http");

    if (temAPI) {
      // MODO PROFISSIONAL: Envia bolhas separadas para garantir PREVIEWS/CARDS
      const cabecalho = `*Protocolo de Exercícios: ${aberrancia}*\n_Abaixo seguem os vídeos demonstrativos:_`;
      await enviarViaAPI(paciente.numero, cabecalho);
      await new Promise(r => setTimeout(r, 1500));

      for (const [index, checkbox] of selecionados.entries()) {
        const ex = exercicios[aberrancia][checkbox.value];
        nomesExercicios.push(ex.nome);

        btnOriginal.textContent = `🚀 Enviando ${index + 1}/${selecionados.length}...`;
        const msgVideo = `🎥 *${ex.nome}*\n${ex.rep}\n\n${ex.video}`;
        await enviarViaAPI(paciente.numero, msgVideo);

        // Delay crucial para o WhatsApp não agrupar e "matar" a miniatura
        if (index < selecionados.length - 1) await new Promise(r => setTimeout(r, 2000));
      }
      alert("Protocolo enviado com sucesso! Verifique os cards no WhatsApp.");
    } else {
      // MODO MANUAL MELHORADO: Envia um por um com intervalo para garantir o vídeo/card
      alert("Iniciando envio manual. Vou abrir os vídeos um por um para que todos apareçam com imagem. Aguarde o temporizador entre cada envio.");
      
      for (const [index, checkbox] of selecionados.entries()) {
        const ex = exercicios[aberrancia][checkbox.value];
        nomesExercicios.push(ex.nome);
        
        const msgVideo = `🎥 *${ex.nome}*\n${ex.rep}\n\n${ex.video}`;
        const url = `whatsapp://send?phone=${paciente.numero}&text=${encodeURIComponent(msgVideo)}`;
        
        window.open(url, "_blank");

        // Se não for o último, espera 8 segundos para o usuário enviar e o navegador não bloquear
        if (index < selecionados.length - 1) {
          btnOriginal.textContent = `⏳ Aguarde o próximo (${index + 2}/${selecionados.length})...`;
          await mostrarTemporizador(8000); 
        }
      }
    }

    // Log no banco de dados
    await _supabase.from("logs_envios").insert([{
      paciente_id: paciente.id,
      tipo_mensagem: "video_multiplo",
      status: temAPI ? "enviado_api" : "enviado_manual"
    }]);

    await DB.addHistorico({
      paciente_id: paciente.id,
      aberrancia,
      exercicios: nomesExercicios,
    });
    renderHistorico();

  } catch (err) {
    console.error("Erro no envio:", err);
  } finally {
    btnOriginal.disabled = false;
    btnOriginal.textContent = "🎥 Enviar Vídeos";
  }
}

// ================= CONFIGURAÇÕES API =================
async function carregarConfiguracoes() {
  const { data } = await _supabase.from("configuracoes_venda").select("*").limit(1).maybeSingle();
  if (data) {
    document.getElementById("cfgUrl").value = data.gateway_url || "";
    document.getElementById("cfgKey").value = data.gateway_key || "";
    document.getElementById("cfgInstancia").value = data.instancia_id || "";
  }
}

async function salvarConfiguracoes() {
  const payload = {
    id: '00000000-0000-0000-0000-000000000000', // ID fixo definido no setup.sql
    gateway_url: document.getElementById("cfgUrl").value.trim(),
    gateway_key: document.getElementById("cfgKey").value.trim(),
    instancia_id: document.getElementById("cfgInstancia").value.trim()
  };

  const { error } = await _supabase.from("configuracoes_venda").upsert(payload);
  
  if (error) {
    alert("Erro ao salvar: " + error.message);
  } else {
    alert("API configurada com sucesso! O envio agora será automático.");
    document.getElementById('configContent').style.display = 'none';
  }
}

// FUNÇÃO PARA ENVIO AUTOMÁTICO VIA API (O QUE VOCÊ VAI VENDER)
async function enviarViaAPI(numero, mensagem) {
  try {
    // Busca as credenciais da tabela configuracoes_venda
    const { data: config, error: configError } = await _supabase
      .from("configuracoes_venda")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (configError || !config || !config.gateway_url) return false;

    const { data, error } = await _supabase.functions.invoke(
      "enviar-whatsapp",
      {
        body: {
          numero: numero,
          mensagem: mensagem,
          gateway_url: config.gateway_url,
          gateway_key: config.gateway_key,
          instancia: config.instancia_id,
        },
      },
    );
    return !error;
  } catch (e) {
    return false;
  }
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
  await carregarConfiguracoes();

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
