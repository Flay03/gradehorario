class AlertPanel {
    static atualizarAlertas() {
        const alertas = document.getElementById('painelAlertas');
        if (!alertas || !window.sistemaGrade) return;

        let todosAlertas = [];
        const alertasUnicos = new Set();

        sistemaGrade.aulas.forEach(aula => {
            const validacao = ValidatorService.validarAulaCompleta(aula);
            
            validacao.alertas.forEach(alerta => {
                const professor = aula.getProfessor();
                const disciplina = aula.getDisciplina();
                const chaveAlerta = `${professor ? professor.nome : 'N/A'} - ${disciplina ? disciplina.nome : 'N/A'}: ${alerta}`;
                alertasUnicos.add(chaveAlerta);
            });
        });

        todosAlertas = Array.from(alertasUnicos).map(mensagem => ({
            tipo: 'aviso',
            mensagem: mensagem
        }));

        sistemaGrade.professores.forEach(professor => {
            const cargaAtual = sistemaGrade.obterCargaDiariaProfessor(professor.id);
            if (cargaAtual < 4 && cargaAtual > 0) {
                todosAlertas.push({
                    tipo: 'aviso',
                    mensagem: `${professor.nome} tem apenas ${cargaAtual} aulas (baixa carga)`
                });
            }
        });

        const todosItens = todosAlertas.slice(0, 20);

        alertas.innerHTML = todosItens.map(alerta => `
            <div class="alerta-item ${alerta.tipo}">${alerta.mensagem}</div>
        `).join('');

        if (todosItens.length === 0) {
            alertas.innerHTML = '<div class="alerta-item info">Nenhum conflito ou alerta encontrado</div>';
        }
    }

    static adicionarAlerta(mensagem, tipo = 'info') {
        const alertas = document.getElementById('painelAlertas');
        if (!alertas) return;

        const alertaItem = document.createElement('div');
        alertaItem.className = `alerta-item ${tipo}`;
        alertaItem.textContent = mensagem;
        
        alertas.insertBefore(alertaItem, alertas.firstChild);
        
        while (alertas.children.length > 20) {
            alertas.removeChild(alertas.lastChild);
        }
    }
}

window.AlertPanel = AlertPanel;