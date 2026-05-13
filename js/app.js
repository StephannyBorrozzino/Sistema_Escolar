/* ==================== Local Storage ==========================*/
const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

/* ==================== Data Atual ==========================*/
function getHoje() {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

/* ==================== NAVEGAÇÃO ==================================*/

function navegacaoHome() {
    document.getElementById('registroPresenca').classList.add('esconde');
    document.getElementById('listagemAlunos').classList.add('esconde');
    document.getElementById('listagemSalas').classList.add('esconde');
    document.getElementById('home').classList.remove('esconde');
    carregarHome();
}

function navegacaoListagemAlunos() {
    document.getElementById('home').classList.add('esconde');
    document.getElementById('registroPresenca').classList.add('esconde');
    document.getElementById('listagemSalas').classList.add('esconde');
    document.getElementById('listagemAlunos').classList.remove('esconde');
    atualizarFiltroSala();
    atualizarSelectSala();
    atualizarSelectRelatorioIndividual();
    listarAlunos();
}

function navegacaoRegistroPresenca() {
    document.getElementById('home').classList.add('esconde');
    document.getElementById('listagemAlunos').classList.add('esconde');
    document.getElementById('listagemSalas').classList.add('esconde');
    document.getElementById('registroPresenca').classList.remove('esconde');
    atualizarFiltroSala();
    atualizarSelectSala();
}

function navegacaoListagemSalas() {
    document.getElementById('home').classList.add('esconde');
    document.getElementById('registroPresenca').classList.add('esconde');
    document.getElementById('listagemAlunos').classList.add('esconde');
    document.getElementById('listagemSalas').classList.remove('esconde');
    listarSalas();
    atualizarSelectRelatorioSala();
}

/* ==================== INFORMAÇÕES HOME ==================================*/
function totalAlunos() {
    return getData("alunos").length;
}

function totalSalas() {
    return getData("salas").length;
}

function totalPresencas() {
    return getData("presencas").length;
}

function alunosBaixaFrequencia() {
    const alunos = getData("alunos");
    const presencas = getData("presencas");

    let ranking = [];

    alunos.forEach(aluno => {

        const registros = presencas.filter(
            p => p.alunoId == aluno.id
        );

        let pres = 0;
        let faltas = 0;

        registros.forEach(r => {
            const ultimo = getUltimoEstado(r.historico);

            if (ultimo) {
                ultimo.presente ? pres++ : faltas++;
            }
        });

        const total = pres + faltas;

        const percentual = total > 0 ?
            (pres / total) * 100 :
            0;

        ranking.push({
            nome: aluno.nome,
            percentual
        });
    });

    ranking.sort((a, b) => a.percentual - b.percentual);

    return ranking.slice(0, 5);
}

function resumoSalasHome() {
    const salas = getData("salas");
    const alunos = getData("alunos");
    const presencas = getData("presencas");

    if (salas.length === 0) {
        document.getElementById("melhorSala").innerText =
            "Nenhuma sala cadastrada";

        document.getElementById("piorSala").innerText =
            "Nenhuma sala cadastrada";

        return;
    }

    let rankingSalas = [];

    salas.forEach(sala => {

        const alunosSala = alunos.filter(
            a => a.selectId == sala.id
        );

        let totalPresencas = 0;
        let totalFaltas = 0;

        alunosSala.forEach(aluno => {

            const registrosAluno = presencas.filter(
                p => p.alunoId == aluno.id
            );

            registrosAluno.forEach(registro => {

                const ultimo = getUltimoEstado(registro.historico);

                if (ultimo) {
                    if (ultimo.presente) {
                        totalPresencas++;
                    } else {
                        totalFaltas++;
                    }
                }
            });
        });

        const total = totalPresencas + totalFaltas;

        const percentual = total > 0 ?
            (totalPresencas / total) * 100 :
            0;

        rankingSalas.push({
            nome: sala.nome,
            percentual
        });
    });

    rankingSalas.sort((a, b) => b.percentual - a.percentual);

    const melhorSala = rankingSalas[0];
    const piorSala = rankingSalas[rankingSalas.length - 1];

    document.getElementById("melhorSala").innerText =
        `🏆 ${melhorSala.nome} — ${melhorSala.percentual.toFixed(1)}%`;

    document.getElementById("piorSala").innerText =
        `⚠️ ${piorSala.nome} — ${piorSala.percentual.toFixed(1)}%`;
}

function carregarHome() {
    document.getElementById("totalAlunos").innerText = totalAlunos();
    document.getElementById("totalSalas").innerText = totalSalas();
    document.getElementById("totalPresencas").innerText = totalPresencas();

    const ranking = alunosBaixaFrequencia();
    const ul = document.getElementById("rankingFaltas");

    ul.innerHTML = "";

    ranking.forEach(aluno => {
        ul.innerHTML += `
            <li>
                ${aluno.nome} — ${aluno.percentual.toFixed(1)}%
            </li>
        `;
    });


    resumoSalasHome();
}

/* ==================== CRUD SALAS ==================================*/
function criarSala() {
    const nome = document.getElementById("nomeSala").value;

    if (!nome.trim()) return alert("Digite um nome válido!");

    const salas = getData("salas");

    for (let s of salas) {
        if (s.nome === nome) {
            return alert("Já existe uma sala com esse nome!");
        }
    }

    salas.push({ id: Date.now(), nome });

    setData("salas", salas);

    atualizarSelectSala();
    atualizarFiltroSala();

    document.getElementById("nomeSala").value = "";
    atualizarSelectRelatorioSala();
    listarSalas();
}

function listarSalas() {
    const salas = getData("salas");
    const lista = document.getElementById("listaSalas");

    if (salas.length === 0) {
        lista.innerHTML = `
        <tr>
            <td colspan="3" class="text-center">Nenhuma sala cadastrado</td>
        </tr>
    `;
        return;
    }

    let html = "";

    salas.forEach(s => {
        html += `
            <tr>
                <td>${s.nome}</td>
                <td><button class="btn-atualizarSala btn btn-primary" data-id="${s.id}">Atualizar</button></td>
                <td><button class="btn-deletarSala btn btn-danger" data-id="${s.id}">Deletar</button></td>
            </tr>
        `;
    });

    lista.innerHTML = html;
}

const modalSala = new bootstrap.Modal(
    document.getElementById("atualizarSala"),
);

let salaEditandoId;

document.getElementById("listaSalas").addEventListener("click", (e) => {
    const idSala = Number(e.target.dataset.id);

    if (e.target.classList.contains("btn-deletarSala")) {

        const confirmar = confirm(
            "Essa sala será removida e TODOS os alunos dela também serão excluídos.\n\nDeseja continuar?"
        );

        if (!confirmar) return;

        let alunos = getData("alunos");
        let salas = getData("salas");

        alunos = alunos.filter(a => a.selectId != idSala);
        salas = salas.filter(s => s.id !== idSala);

        setData("alunos", alunos);
        setData("salas", salas);

        atualizarSelectRelatorioSala();
        listarSalas();
        listarAlunos();
    }

    if (e.target.classList.contains("btn-atualizarSala")) {
        let salas = getData("salas");
        const sala = salas.find(s => s.id === idSala);
        if (!sala) {
            return alert("Sala inválida!");
        }

        salaEditandoId = idSala;

        document.getElementById("modalNomeSala").value = sala.nome

        modalSala.show();
    }
});

function atualizarSala() {
    const salas = getData("salas");
    const sala = salas.find(a => a.id === salaEditandoId);
    if (!sala) {
        return alert("Sala inválida!");
    }

    if (!sala) return;

    const nome = document.getElementById("modalNomeSala").value;

    if (!nome.trim()) return alert("Nome inválido!");

    const jaExiste = salas.some(s =>
        s.nome.toLowerCase() === nome.toLowerCase() &&
        s.id !== salaEditandoId
    );

    if (jaExiste) {
        return alert("Já existe uma sala com esse nome!");
    }

    sala.nome = nome;

    setData("salas", salas);

    atualizarSelectRelatorioSala();
    listarSalas();

    modalSala.hide();

    salaEditandoId = null;
}

/* ====================== SELECTS ============================= */
function atualizarSelectSala() {
    const salas = getData("salas");
    const select = document.getElementById("selectSala");

    select.innerHTML = `<option value="" selected disabled>Selecione uma sala</option>`;
    salas.forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.nome}</option>`
    });
}

function atualizarFiltroSala() {
    const salas = getData("salas");
    const select = document.getElementById("filtroSala");

    select.innerHTML = `<option value="" selected disabled>Selecione uma sala</option>`;
    salas.forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.nome}</option>`
    });
}

function atualizarSelectRelatorioIndividual() {
    const alunos = getData("alunos");
    const salas = getData("salas")
    const select = document.getElementById("relatorioAlunoSelect");

    select.innerHTML = `<option value="" selected disabled>Selecione um aluno</option>`;
    alunos.forEach(a => {
        const sala = salas.find(s => s.id == a.selectId);
        select.innerHTML += `<option value="${a.id}">${a.nome} |${sala ? sala.nome : "Sala removida"}</option>`
    });
}

function atualizarSelectRelatorioSala() {
    const salas = getData("salas");
    const select = document.getElementById("relatorioSalaSelect");

    select.innerHTML = `<option value="" selected disabled>Selecione uma sala</option>`;
    salas.forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.nome}</option>`
    });
}

function atualizarSelectModal(idAtual) {
    const salas = getData("salas");
    const select = document.getElementById("modalSalaAluno");

    select.innerHTML = `<option value="" selected disabled>Selecione uma sala</option>`;
    salas.forEach(s => {
        select.innerHTML += `<option value="${s.id}" ${idAtual == s.id ? "selected" : ""}>${s.nome}</option>`
    });
}

/* ======================= CRUD ALUNO =================================== */
function cadastrarAluno() {
    const nome = document.getElementById("nomeAluno").value;
    const selectId = document.getElementById("selectSala").value;

    if (!nome.trim()) return alert("Digite um nome válido!");
    if (!selectId) return alert("Preencha a sala!");

    const alunos = getData("alunos");

    alunos.push({ id: Date.now(), nome, selectId });

    setData("alunos", alunos);

    atualizarSelectRelatorioIndividual();
    listarAlunos();

    document.getElementById("nomeAluno").value = "";
}

function listarAlunos() {
    const alunos = getData("alunos");
    const salas = getData("salas");
    const lista = document.getElementById("listaAlunos");

    if (alunos.length === 0) {
        lista.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">Nenhum aluno cadastrado</td>
        </tr>
    `;
        return;
    }

    let html = "";

    alunos.forEach(a => {
        const sala = salas.find(s => s.id == a.selectId);

        html += `
            <tr>
                <td>${a.nome}</td>
                <td>${sala?.nome || 'sem sala'}</td>
                <td><button class="btn-atualizarAluno btn btn-primary" data-id="${a.id}">Atualizar</button></td>
                <td><button class="btn-deletarAluno btn btn-danger" data-id="${a.id}">Deletar</button></td>
            </tr>
        `;
    });

    lista.innerHTML = html;
}

const modalAluno = new bootstrap.Modal(
    document.getElementById("atualizarAluno"),
);

let alunoEditandoId;

document.getElementById("listaAlunos").addEventListener("click", (e) => {
    const idAluno = Number(e.target.dataset.id);

    if (e.target.classList.contains("btn-deletarAluno")) {
        const confirmar = confirm(
            "Esse aluno será removida e TODOS os registros de presenças dele também serão excluídos.\n\nDeseja continuar?"
        );

        if (!confirmar) return;

        let alunos = getData("alunos");
        let presencas = getData("presencas");

        alunos = alunos.filter(a => a.id !== idAluno);
        presencas = presencas.filter(p => p.alunoId !== idAluno);

        setData("alunos", alunos);
        setData("presencas", presencas);

        atualizarSelectRelatorioIndividual();
        listarAlunos();
    }

    if (e.target.classList.contains("btn-atualizarAluno")) {
        let alunos = getData("alunos");
        const aluno = alunos.find(a => a.id === idAluno);

        alunoEditandoId = idAluno;

        document.getElementById("modalNomeAluno").value = aluno.nome
        atualizarSelectModal(aluno.selectId);

        modalAluno.show();
    }
});

function atualizarAluno() {
    const alunos = getData("alunos");
    const aluno = alunos.find(a => a.id === alunoEditandoId);

    if (!aluno) return;

    const nome = document.getElementById("modalNomeAluno").value;
    const selectId = document.getElementById("modalSalaAluno").value;

    if (!nome.trim()) return alert("Nome inválido!");
    if (!selectId) return alert("Selecione uma sala!");

    aluno.nome = nome;
    aluno.selectId = selectId;

    setData("alunos", alunos);

    atualizarSelectRelatorioIndividual();
    listarAlunos();

    modalAluno.hide();

    alunoEditandoId = null;
}

/* =================== CHAMADAS ===================================== */

let chamadaAtiva = false;

function carregarChamada() {
    const alunos = getData("alunos");
    const salas = getData("salas")
    const presencas = getData("presencas");

    const salaId = document.getElementById("filtroSala").value;
    const data = document.getElementById("dataChamada").value;
    const container = document.getElementById("chamada");

    if (!salaId) return alert("Preencha a sala");
    if (!data) return alert("Preencha a data da chamada");

    ocultarJustificativas();

    chamadaAtiva = true;
    document.getElementById("filtroSala").disabled = true;
    document.getElementById("dataChamada").disabled = true;

    const sala = salas.find(s => s.id == salaId);
    if (!sala) {
        return alert("Sala inválida!");
    }

    const partes = data.split("-");
    const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;

    const alunosSala = alunos.filter(a => a.selectId == salaId);

    container.innerHTML = "";
    document.getElementById("txtChamadaInfo").innerText = `Data: ${dataFormatada} | Sala: ${sala.nome}`

    alunosSala.forEach(a => {

        const registro = presencas.find(
            p => p.alunoId == a.id && p.data == data
        );

        let ultimo = null;

        if (registro && registro.historico.length > 0) {
            ultimo = registro.historico[registro.historico.length - 1];
        }

        let presente = null;

        if (ultimo) {
            presente = ultimo.presente;
        }

        const presenteChecked = presente === true ? "checked" : "";
        const ausenteChecked = presente === false ? "checked" : "";

        const classe = presente === true ? "presente" : presente === false ? "ausente" : "";

        container.innerHTML += `
            <tr class="${classe}">
                <td>${a.nome}</td>

                <td class="text-center">

                    <div class="form-check form-check-inline">
                        <input
                            class="form-check-input"
                            type="radio"
                            name="aluno${a.id}"
                            id="presente${a.id}"
                            value="true"
                            ${presenteChecked}
                            onchange="marcarPresenca(${a.id}, true)"
                        >

                        <label
                            class="form-check-label"
                            for="presente${a.id}"
                        >
                            Presente
                        </label>
                    </div>

                    <div class="form-check form-check-inline">
                        <input
                            class="form-check-input"
                            type="radio"
                            name="aluno${a.id}"
                            id="ausente${a.id}"
                            value="false"
                            ${ausenteChecked}
                            onchange="marcarPresenca(${a.id}, false)"
                        >

                        <label
                            class="form-check-label"
                            for="ausente${a.id}"
                        >
                            Ausente
                        </label>
                    </div>

                </td>
            </tr>
        `;
    });
}

function resetChamada() {
    chamadaAtiva = false;

    document.getElementById("filtroSala").disabled = false;
    document.getElementById("dataChamada").disabled = false;

    document.getElementById("chamada").innerHTML = "";
    document.getElementById("txtChamadaInfo").innerText = "";
    ocultarJustificativas();
}

/* =================== PRESENÇA ======================================= */

const modalJustificativa = new bootstrap.Modal(
    document.getElementById("JustificativaChamada"),
);

let justificativaEditandoId;
let justificativaEditandoPresente;

function podeAlterarData(dataSelecionada) {
    const hoje = new Date();
    const data = new Date(dataSelecionada + "T23:59:59");

    return hoje <= data;
}

function marcarPresenca(alunoId, presente) {
    const data = document.getElementById("dataChamada").value;

    if (!data) return alert("Selecione a data da chamada");

    if (!podeAlterarData(data)) {
        justificativaEditandoId = alunoId;
        justificativaEditandoPresente = presente;
        carregarChamada();
        modalJustificativa.show();
        return;
    }

    let presencas = getData("presencas");

    let registro = presencas.find(
        p => p.alunoId == alunoId && p.data == data
    );

    if (!registro) {
        registro = {
            alunoId,
            data,
            historico: []
        };
        presencas.push(registro);
    }

    const ultimo = registro.historico[registro.historico.length - 1];

    if (!ultimo || ultimo.presente !== presente) {
        registro.historico.push({
            presente,
            timestamp: Date.now()
        });
    }
    setData("presencas", presencas);

    const linha = document.getElementById(`presente${alunoId}`).closest("tr");
    linha.classList.remove("presente", "ausente");
    linha.classList.add(presente ? "presente" : "ausente");
}

function justificarAlteracaoChamada() {
    const justificativa = document.getElementById("modalJustificativaChamada").value;

    if (!justificativa.trim()) {
        return alert("A justificativa é obrigatória!");
    }

    const alunoId = justificativaEditandoId;
    const presente = justificativaEditandoPresente;
    const data = document.getElementById("dataChamada").value;

    let presencas = getData("presencas");

    let registro = presencas.find(
        p => p.alunoId == alunoId && p.data == data
    );

    if (!registro) {
        registro = {
            alunoId,
            data,
            historico: []
        };
        presencas.push(registro);
    }

    registro.historico.push({
        presente,
        timestamp: Date.now(),
        justificativa
    });

    setData("presencas", presencas);

    modalJustificativa.hide();
    document.getElementById("modalJustificativaChamada").value = "";
    carregarChamada();
}

function mostrarJustificativas() {
    const presencas = getData("presencas");
    const alunos = getData("alunos");

    document.getElementById('divJustificativas').classList.remove('esconde');

    let html = "";

    presencas.forEach(p => {

        const aluno = alunos.find(a => a.id == p.alunoId);

        const partes = p.data.split("-");
        const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;

        p.historico.forEach(h => {

            if (h.justificativa) {
                html += `
                    <div class="card p-2 mb-2">
                        <strong>Aluno:</strong> ${aluno?.nome || "Desconhecido"} <br>
                        <strong>Data:</strong> ${dataFormatada} <br>
                        <strong>Status:</strong> ${h.presente ? "Presente (alterado)" : "Falta (alterado)"} <br>
                        <strong>Justificativa:</strong> ${h.justificativa}
                    </div>
                `;
            }

        });

    });

    document.getElementById("listaJustificativas").innerHTML = html;
}

function ocultarJustificativas() {
    document.getElementById('divJustificativas').classList.add('esconde');
}

/*  ====================== RELATORIOS ================================== */

function getUltimoEstado(historico) {
    if (!historico || historico.length === 0) return null;
    return historico[historico.length - 1];
}

function relatorioIndividualAluno() {

    const alunoId = document.getElementById("relatorioAlunoSelect").value;

    if (!alunoId) {
        return alert("Selecione um aluno!");
    }

    const presencas = getData("presencas");

    const registrosAluno = presencas.filter(
        p => p.alunoId == alunoId
    );

    let totalPresencas = 0;
    let totalFaltas = 0;
    let ultimoDiaPresente = "-";

    registrosAluno.forEach(registro => {

        const historico = registro.historico;

        if (historico.length > 0) {

            const ultimo = getUltimoEstado(historico);

            if (ultimo.presente) {
                totalPresencas++;
                ultimoDiaPresente = registro.data;
            } else {
                totalFaltas++;
            }
        }
    });

    const totalChamadas = totalPresencas + totalFaltas;

    let porcentagem = 0;

    if (totalChamadas > 0) {
        porcentagem = (totalPresencas / totalChamadas) * 100;
    }

    let dataFormatada = "Ainda não esteve presente.";

    if (ultimoDiaPresente && ultimoDiaPresente.includes("-")) {
        const partes = ultimoDiaPresente.split("-");

        if (partes.length === 3 && partes[0] && partes[1] && partes[2]) {
            dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }
    document.getElementById("RelatorioAlPorCemPrecenca").innerText = `${porcentagem.toFixed(1)}%`;

    document.getElementById("RelatorioAlTotalFaltas").innerText = totalFaltas;

    document.getElementById("RelatorioAlUltimoDiaPresente").innerText = dataFormatada;
}

function relatorioSala() {

    const salaId = document.getElementById("relatorioSalaSelect").value;

    if (!salaId) {
        return alert("Selecione uma sala!");
    }

    const alunos = getData("alunos");
    const presencas = getData("presencas");

    const alunosSala = alunos.filter(
        a => a.selectId == salaId
    );

    let somaPercentuais = 0;

    let ranking = [];

    alunosSala.forEach(aluno => {

        const registrosAluno = presencas.filter(
            p => p.alunoId == aluno.id
        );

        let presencasTotal = 0;
        let faltasTotal = 0;

        registrosAluno.forEach(registro => {

            const historico = registro.historico;

            if (historico.length > 0) {

                const ultimo = getUltimoEstado(historico);

                if (ultimo.presente) {
                    presencasTotal++;
                } else {
                    faltasTotal++;
                }
            }
        });

        const total = presencasTotal + faltasTotal;

        let percentual = 0;

        if (total > 0) {
            percentual = (presencasTotal / total) * 100;
        }

        somaPercentuais += percentual;

        ranking.push({
            nome: aluno.nome,
            percentual: percentual
        });
    });

    let mediaGeral = 0;

    if (alunosSala.length > 0) {
        mediaGeral = somaPercentuais / alunosSala.length;
    }

    ranking.sort((a, b) => b.percentual - a.percentual);

    let rankingTexto = "";

    ranking.forEach((r, i) => {

        let medalha = "";

        if (i === 0) medalha = "🥇 ";
        else if (i === 1) medalha = "🥈 ";
        else if (i === 2) medalha = "🥉 ";

        rankingTexto += `${medalha}${i + 1}º ${r.nome} — ${r.percentual.toFixed(1)}%\n`;
    });

    document.getElementById("RelatorioSalaMediaGeral").innerText =
        `${mediaGeral.toFixed(1)}%`;

    document.getElementById("RelatorioSalaRankingFreq").innerText =
        rankingTexto;
}

/*  ====================== EXPORTAR JSON ================================= */

function baixarJSON(nomeArquivo, dados) {
    const json = JSON.stringify(dados, null, 2);

    const blob = new Blob([json], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;

    a.click();

    URL.revokeObjectURL(url);
}

function exportarTodosDadosJSON() {
    baixarJSON("relatorio-escolar.json", {
        alunos: getData("alunos"),
        salas: getData("salas"),
        presencas: getData("presencas")
    });
}

function exportarAlunosJSON() {
    baixarJSON("alunos.json", {
        alunos: getData("alunos")
    });
}

function exportarSalasJSON() {
    baixarJSON("salas.json", {
        salas: getData("salas")
    });
}

function exportarPresencasJSON() {
    baixarJSON("presencas.json", {
        presencas: getData("presencas")
    });
}

/*  ====================== INIT ==================================== */
atualizarFiltroSala();
atualizarSelectSala();
listarAlunos();
listarSalas();
carregarHome();
