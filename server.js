function exportarDados() {
  const dados = {
    pacientes: DB.getPacientes(),
    historico: DB.getHistorico(),
  };
  fetch("/salvar-backup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  }).then(() => alert("Backup salvo na pasta do sistema!"));
}
