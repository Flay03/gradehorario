class ProfessorPanel {
    static atualizarLista() {
        if (!window.sistemaGrade) return;
        
        const lista = document.getElementById('listaProfessores');
        if (lista) {
            lista.innerHTML = sistemaGrade.professores.map(prof => prof.toDraggableHTML()).join('');
        }
    }

    static atualizarListaFiltrada(professoresFiltrados) {
        const lista = document.getElementById('listaProfessores');
        if (lista) {
            lista.innerHTML = professoresFiltrados.map(prof => prof.toDraggableHTML()).join('');
        }
    }

    static criarItemProfessorCompacto(professor) {
        const cargaAtual = window.sistemaGrade ? window.sistemaGrade.obterCargaDiariaProfessor(professor.id) : 0;
        
        return `
            <div class="professor-item compact-item" 
                 draggable="true"
                 ondragstart="if(window.sistemaGrade) window.sistemaGrade.dragStart(event, 'professor', '${professor.id}')"
                 oncontextmenu="if(window.sistemaGrade) { window.sistemaGrade.mostrarMenuContextoProfessor(event, '${professor.id}'); return false; }"
                 data-id="${professor.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold" style="font-size: 0.8em;">${professor.nome}</span>
                    <span class="badge bg-primary" style="font-size: 0.6em;">
                        ${cargaAtual}
                    </span>
                </div>
                <div style="font-size: 0.7em; color: #6c757d;">
                    ${professor.obterDisciplinasNomes().substring(0, 30)}...
                </div>
            </div>
        `;
    }
}

window.ProfessorPanel = ProfessorPanel;