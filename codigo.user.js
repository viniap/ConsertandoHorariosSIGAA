// ==UserScript==
// @name         Consertando os horários do SIGAA UnB
// @namespace    https://github.com/luthierycosta
// @version      1.0
// @icon         https://github.com/luthierycosta/ConsertandoHorariosSIGAA/blob/master/icon.png?raw=true
// @description  Traduz as informações de horários das turmas no SIGAA (novo sistema da UnB), de formato pouco entendível, por dias e horas escritas por extenso.
// @author       Luthiery Costa
// @supportURL   https://github.com/luthierycosta
// @match        https://sig.unb.br/sigaa/portais/*
// @grant        none
// @noframes
// ==/UserScript==

'use strict';

/** Cria dicionário para mapear os números e letras aos dias e horas reais */
const mapaDias = {
    2: 'SEG',
    3: 'TER',
    4: 'QUA',
    5: 'QUI',
    6: 'SEX',
    7: 'SAB'
}
const mapaHorarios = {
    'M1': {inicio: '08:00', fim: '08:50'},
    'M2': {inicio: '09:00', fim: '09:50'},
    'M3': {inicio: '10:00', fim: '10:50'},
    'M4': {inicio: '11:00', fim: '11:50'},
    'M5': {inicio: '12:00', fim: '12:50'},
    'T1': {inicio: '13:00', fim: '13:50'},
    'T2': {inicio: '14:00', fim: '14:50'},
    'T3': {inicio: '15:00', fim: '15:50'},
    'T4': {inicio: '16:00', fim: '16:50'},
    'T5': {inicio: '17:00', fim: '17:50'},
    'N1': {inicio: '19:00', fim: '19:50'},
    'N2': {inicio: '20:00', fim: '20:40'},
    'N3': {inicio: '20:50', fim: '21:40'},
    'N4': {inicio: '21:50', fim: '22:30'}
}

/** Padrão regex que reconhece o formato de horário do SIGAA */
const padraoSigaa = /\b([2-7])([MTN])([1-5]{1,5})\b/gm;

/**
 * Função que recebe o horário do SIGAA e retorna o texto traduzido através do dicionário acima
 *
 * @param {*} match     O horário completo reconhecido pelo regex
 * @param {*} g1        O primeiro grupo de captura do regex - no caso, o dígito do dia da semana
 * @param {*} g2        O segundo grupo de captura do regex - no caso, a letra do turno
 * @param {*} g3        O terceiro grupo de captura do regex - no caso, o conjunto de dígitos dos horários
 */
function mapeiaTexto(match, g1, g2, g3) {
    let dia         = mapaDias[g1];
    let hora_inicio = mapaHorarios[`${g2}${g3.charAt(0)}`].inicio;
    let hora_fim    = mapaHorarios[`${g2}${g3.charAt(g3.length-1)}`].fim;
    return `${dia}  ${hora_inicio}-${hora_fim}`;
}

/** Aumenta o tamanho da coluna dos horários, caso a página em questão seja a home do portal discente */
if (window.location.href == "https://sig.unb.br/sigaa/portais/discente/discente.jsf") {
    document
        .getElementById("turmas-portal")    // acessa a região Turmas do Semestre
        .children[2]                        // acessa a tabela com as matérias e horários
        .children[0]                        // acessa o cabeçalho da tabela
        .children[0]                        // acessa o cabeçalho da tabela dnv (?)
        .children[2]                        // acessa a coluna horário
        .width = "18%";
}

/** Objeto TreeWalker que permite navegar por todos os campos de texto da página
 * (copiado na cara dura do Stack Overflow)
 * https://stackoverflow.com/questions/39380229/replace-all-instance-of-a-string-in-a-webpage-on-click-javascript
*/
var treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

/** Procura por todos os textos da página e, onde reconhecer o padrão de horário, chama a mapeiaTexto() */
var element;
while(element = treeWalker.nextNode()){
    element.textContent = element.textContent.replace(padraoSigaa,mapeiaTexto);
 }