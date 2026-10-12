function abrirModal(conteudo) {
    document.getElementById('modalContent').innerHTML = conteudo;
    document.getElementById('modalOverlay').classList.add('active');
}

function fecharModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}