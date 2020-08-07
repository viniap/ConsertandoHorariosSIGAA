/** Limpa o excesso de células, causado pelos rowspans, que ficam á direita da tabela.
 *  Está neste arquivo pois ele é executado após a DOM ter sido redenrizada, o que é 
 *  necessário para saber a propriedade offsetWidth, que foi o método escolhido para
 *  remover o excesso de células.
 **/
if(document.getElementById("turmas-portal") != null){
    let table = document.querySelector("#turmas-portal").children[2];
    let tableBodyChildren = table.children[0].children;

    for(let i = 0; i < tableBodyChildren.length; i++) {
        let tableRowChildren = tableBodyChildren[i].children;
        for(let j = 0; j < tableRowChildren.length; j++) {
            if(tableRowChildren[j].offsetWidth <= 2) {
                tableRowChildren[j].classList.add("remove");
            }
        }
    }
}