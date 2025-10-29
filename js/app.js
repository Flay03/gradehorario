class Professor {
    constructor(id, nome, disciplinas = [], disponibilidade = [], cargaMaximaDiaria = 8) {
        this.id = id;
        this.nome = nome;
        this.disciplinas = disciplinas;
        this.disponibilidade = disponibilidade;
        this.cargaMaximaDiaria = cargaMaximaDiaria;
    }

    podeLecionar(dia, horario) {
        const dispDia = this.disponibilidade.find(d => d.dia === dia);
        return dispDia && dispDia.horarios.includes(horario);
    }

    toDraggableHTML() {
        const cargaAtual = window.sistemaGrade ? window.sistemaGrade.obterCargaDiariaProfessor(this.id) : 0;
        
        // CORREÇÃO: Usar window.sistemaGrade para garantir que existe
        return `
            <div class="professor-item" draggable="true" 
                 ondragstart="window.sistemaGrade.dragStart(event, 'professor', '${this.id}')"
                 oncontextmenu="window.sistemaGrade.mostrarMenuContextoProfessor(event, '${this.id}'); return false;"
                 data-id="${this.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>${this.nome}</strong>
                    <span class="badge bg-primary badge-carga">${cargaAtual}/${this.cargaMaximaDiaria}</span>
                </div>
                <div class="carga-indicator">
                    ${this.obterDisciplinasNomes()}
                </div>
            </div>
        `;
    }

    obterDisciplinasNomes() {
        if (!window.sistemaGrade || !window.sistemaGrade.disciplinas) return '';
        
        return this.disciplinas.map(discId => {
            const disc = window.sistemaGrade.disciplinas.find(d => d.id === discId);
            return disc ? disc.nome : '';
        }).filter(nome => nome).join(', ');
    }

    obterDisponibilidadeTexto() {
        const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
        return this.disponibilidade.map(disp => {
            const diaNome = dias[disp.dia] || `Dia ${disp.dia}`;
            const horarios = disp.horarios.join(', ');
            return `${diaNome}: ${horarios}`;
        }).join('; ');
    }
}
