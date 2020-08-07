// ==UserScript==
// @name         Consertando os horários do SIGAA UnB
// @namespace    https://github.com/luthierycosta
// @version      1.1.5
// @icon         https://github.com/luthierycosta/ConsertandoHorariosSIGAA/blob/master/images/icon.png?raw=true
// @description  Traduz as informações de horários das turmas no SIGAA (novo sistema da UnB), de formato pouco entendível, por dias e horas escritas por extenso.
// @author       Luthiery Costa
// @supportURL   https://github.com/luthierycosta
// @match        https://sig.unb.br/sigaa/*
// @grant        none
// @noframes
// ==/UserScript==

'use strict';

/** Dicionário para mapear os números aos dias da semana */
const mapaDias = {
    2: 'SEG',
    3: 'TER',
    4: 'QUA',
    5: 'QUI',
    6: 'SEX',
    7: 'SAB'
}

/** Dicionário para mapear o turno e horário à faixas de horário */
const mapaHorarios = {
    'M1': {inicio: '08:00', fim: '08:55'},
    'M2': {inicio: '08:55', fim: '09:50'},
    'M3': {inicio: '10:00', fim: '10:55'},
    'M4': {inicio: '10:55', fim: '11:50'},
    'M5': {inicio: '12:00', fim: '12:55'},
    'T1': {inicio: '12:55', fim: '13:50'},
    'T2': {inicio: '14:00', fim: '14:55'},
    'T3': {inicio: '14:55', fim: '15:50'},
    'T4': {inicio: '16:00', fim: '16:55'},
    'T5': {inicio: '16:55', fim: '17:50'},
    'T6': {inicio: '18:00', fim: '18:55'},
    'T7': {inicio: '18:55', fim: '19:50'},
    'N1': {inicio: '19:00', fim: '19:50'},
    'N2': {inicio: '19:50', fim: '20:40'},
    'N3': {inicio: '20:50', fim: '21:40'},
    'N4': {inicio: '21:40', fim: '22:30'}
}

/** Dicionário para mapear os dias às colunas da tabela/grade horária */
const mapaDiasPosicao = {
    '2': 1,
    '3': 2,
    '4': 3,
    '5': 4,
    '6': 5,
    '7': 6
}

/** Dicionário para mapear as faixas de horário às linhas da tabela/grade horária */
const mapaHorariosPosicao = {
    'M1': 1,
    'M2': 2,
    'M3': 3,
    'M4': 4,
    'M5': 5,
    'T1': 6,
    'T2': 7,
    'T3': 8,
    'T4': 9,
    'T5': 10,
    'T6': 11,
    'T7': 12,
    'N1': 12,
    'N2': 13,
    'N3': 14,
    'N4': 15
}

/** Padrão regex que reconhece o formato de horário do SIGAA */
const padraoSigaa = /\b([2-7]{1,5})([MTN])([1-7]{1,7})\b/gm;

/**
 * Função que recebe o horário do SIGAA e retorna o texto traduzido através do dicionário acima
 *
 * @param {*} match     O horário completo reconhecido pelo regex
 * @param {*} g1        O primeiro grupo de captura do regex - no caso, o(s) dígito(s) do dia da semana
 * @param {*} g2        O segundo grupo de captura do regex - no caso, a letra do turno
 * @param {*} g3        O terceiro grupo de captura do regex - no caso, o conjunto de dígitos dos horários
 */
function mapeiaTexto(match, g1, g2, g3) {
    let hora_inicio = mapaHorarios[`${g2}${g3.charAt(0)}`].inicio;
    let hora_fim    = mapaHorarios[`${g2}${g3.charAt(g3.length-1)}`].fim;
    let retorno = [];
    for (let dia of g1)    // Para cada dia do horário (geralmente é só 1 por string)
        retorno.push(`${mapaDias[dia]} ${hora_inicio}-${hora_fim}`);
    
    return retorno.join(' ');
}

/**
 * Função que recebe o horário do SIGAA e retorna, para cada dia, arrays contendo a linha, a coluna e o rowspan
 *
 * @param {*} match     O horário completo reconhecido pelo regex
 * @param {*} g1        O primeiro grupo de captura do regex - no caso, o(s) dígito(s) do dia da semana
 * @param {*} g2        O segundo grupo de captura do regex - no caso, a letra do turno
 * @param {*} g3        O terceiro grupo de captura do regex - no caso, o conjunto de dígitos dos horários
 */
function mapeiaTabela(match, g1, g2, g3) {
    let retorno = [];
    for (let dia of g1) {    // Para cada dia do horário (geralmente é só 1 por string)
        retorno.push([
            mapaDiasPosicao[dia], 
            mapaHorariosPosicao[`${g2}${g3.charAt(0)}`], 
            mapaHorariosPosicao[`${g2}${g3.charAt(g3.length-1)}`] - mapaHorariosPosicao[`${g2}${g3.charAt(0)}`] + 1
        ]);
    }
    return retorno;
}

/** Objeto TreeWalker que permite navegar por todos os campos de texto da página
*/
let treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

if(document.getElementById("turmas-portal") == null) { // não aplicar à página home
    /** Procura por todos os textos da página e, onde reconhecer o padrão de horário, chama a mapeiaTexto() */
    let node;
    while(node = treeWalker.nextNode()){
        node.textContent = node.textContent.replace(padraoSigaa,mapeiaTexto);
    }
}

/** Cria uma grade horária na página home */
if (document.getElementById("turmas-portal") != null) { // nesse caso a página carregada é a home do portal
    /** Armazena a tabela original, que será resetada depois, e adiciona uma classe para estilização */
    let originalTable = document.querySelector("#turmas-portal").children[2];
    originalTable.setAttribute("class", "timetable");

    /** Armazena as linhas da tabela original */
    let originalRows = originalTable.children[1].children;

    /** Títulos das colunas da primeira linha da tabela que será construída */
    let header = ['Horário', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    /** Preenche o array info com arrays, onde cada array, 
     * que representa uma disciplina, conterá o nome, o local e o horário 
     **/
    let info = [];
    for(let i = 0; i < originalRows.length; i++) {
        if(originalRows[i].offsetHeight > 0) { // caso a linha não esteja vazia (?)
            info.push([
                originalRows[i].children[0].children[0], // elemento clicável
                originalRows[i].children[1].textContent,
                originalRows[i].children[2].children[0].textContent
            ]);
        }
    }

    /** Cria o corpo da nova tabela e adiciona uma classe para estilização */
    let TBody = document.createElement("table").createTBody();
    TBody.setAttribute("class", "table-body");

    /** Cria e preenche as células da primeira linha com o array header, 
     * adiciona uma classe, e coloca dentro do tbody 
     **/
    let TRow = document.createElement("tr");
    for(let i = 0; i < header.length; i++) {
        let THeader = document.createElement("th");
        THeader.setAttribute("class", "table-header");
        THeader.innerText = header[i];
        TRow.appendChild(THeader);
    }
    TBody.appendChild(TRow);
    
    /** Cria o resto das linhas e colunas e preenche a primeira coluna com os 
     * horários e o resto com espaços em branco 
     **/
    let mapaHorariosArray = Object.entries(mapaHorarios);
    for(let i = 0; i < Object.keys(mapaHorarios).length; i++) {
        if(i != 12){ // adicionar apenas um dos horários duplicados T7 e N1
            let TRowData = document.createElement("tr");
            TRowData.setAttribute("class", "table-row");
            for(let j = 0; j < header.length; j++) {
                let TData = document.createElement("td");
                TData.setAttribute("class", "table-data");
                TData.innerHTML = "&nbsp;"; // espaço em branco
                if(j == 0) { // preencher apenas a primeira coluna com os horários
                    TData.innerHTML = `${mapaHorariosArray[i][1].inicio}` + "<br />" + "|" + "<br />" + `${mapaHorariosArray[i][1].fim}`;
                    TData.classList.add("h");
                }
                TRowData.appendChild(TData);
            }
            TBody.appendChild(TRowData);
        }
    }
    
    /** Cria array (positions) de arrays, onde cada array é uma aula no formato 
     * -> [coluna, linha, rowspan, info[disciplina, local]] 
     **/
    let positions = [];
    for(let i = 0; i < info.length; i++) { //para cada disciplina
        let schedules = info[i][2].split(" ");
        for(let j = 0; j < schedules.length; j++) { //para cada código de horário
            let rx = /\b([2-7]{1,5})([MTN])([1-7]{1,7})\b/gm;;
            let parts = rx.exec(schedules[j]);
            let result = mapeiaTabela(parts[0], parts[1], parts[2], parts[3]);
            for(let k = 0; k < result.length; k++) {
                result[k].push([info[i][0], info[i][1]]);
                positions.push(result[k]);
            }
        }
    }

    /** Ordena o array positions com a linha como primeira prioridade e a coluna como segunda prioridade */
    let sortedPositions = positions.sort(function(a, b) {
        if (a[1] == b[1]) {
            return a[0] - b[0];
        }
        return a[1] - b[1];
    });

    /** Cria array multidimensional booleano com número de linhas e colunas da tabela e registra
     * quais células serão "empurradas" pelo rowspan, para tratamento de erro de posicionamento.
     **/
    let rowspanMap = Array(Object.keys(mapaHorarios).length).fill(null).map(() => Array(header.length - 1).fill(false));
    for(let i = 0; i < rowspanMap.length; i++) {
        for(let j = 0; j < rowspanMap[0].length; j++) {
            for(let k = 0; k < sortedPositions.length; k++) {
                if(sortedPositions[k][1] == (i+1) && sortedPositions[k][0] == (j+1)) {
                    if(sortedPositions[k][2] > 1) { // se rowspan = 1, não afeta a célula de baixo
                        for(let m = 1; m < sortedPositions[k][2]; m++) {
                            rowspanMap[i+m][j] = true; // célula afetada por rowspan
                        }
                    }
                }
            }
        }
    }

    /** Preenche a tabela com as aulas, levando em conta os desvios causados pelo rowspan */
    for(let i = 0; i < sortedPositions.length; i++) {
        let row = rowspanMap[sortedPositions[i][1] - 1]; // linha em que a aula será incluída
        /** Conta o número de rowspans à esquerda do horário da aula para posterior 
         * deslocamento que irá compensar os deslocamentos gerados pelo rowspan
         **/
        let rowspanCounter = 0;
        let j = 0;
        while(j < row.length && j != (sortedPositions[i][0] - 1)) {
            if(row[j] == true) {
                rowspanCounter++;
                console.log(rowspanCounter)
            }
            j++;
        }
        /** Insere na célula o elemento clicável e o local, e adiciona classe para estilização */
        TBody.children[sortedPositions[i][1]].children[sortedPositions[i][0] - rowspanCounter].innerHTML = sortedPositions[i][3][0].outerHTML + "<br> Local: " + sortedPositions[i][3][1];
        TBody.children[sortedPositions[i][1]].children[sortedPositions[i][0] - rowspanCounter].setAttribute("rowspan", `${sortedPositions[i][2]}`);
        TBody.children[sortedPositions[i][1]].children[sortedPositions[i][0] - rowspanCounter].classList.add("d");
    }

    /** Incorpora o corpo criado à tabela */
    originalTable.innerHTML = TBody.outerHTML;
}
else if (document.getElementsByClassName("listagem").length != 0) { // nesse caso é uma das páginas abaixo
    let colunas = document.getElementsByClassName("listagem")[0].tHead.children[0].children;
    let url = window.location.href;
    for (let coluna of colunas) {
        if (coluna.innerText.includes("Horário")) {
            coluna.width =  url.includes("graduacao/matricula/turmas_curriculo.jsf")              ? "35%" :
                            url.includes("graduacao/matricula/turmas_equivalentes_curriculo.jsf") ? "13%" :
                            url.includes("graduacao/matricula/turmas_extra_curriculo.jsf")        ? "12%" :
                            url.includes("portais/discente/turmas.jsf")                           ? "34%" :
                            url.includes("public/turmas/listar.jsf")                              ? "13%" :
                            coluna.width;
        }
    }
}