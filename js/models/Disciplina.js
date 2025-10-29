class Disciplina {
    constructor(id, nome, compartilhada = false, professores = [], permiteDoisProfessores = false) {
        this.id = id;
        this.nome = nome;
        this.compartilhada = compartilhada;
        this.professores = professores;
        this.permiteDoisProfessores = permiteDoisProfessores;
    }

    toDraggableHTML() {
        const professoresNomes = this.professores.map(profId => {
            const prof = window.sistemaGrade ? window.sistemaGrade.professores.find(p => p.id === profId) : null;
            return prof ? prof.nome : '';
        }).filter(nome => nome).join(', ');

        return `
            <div class="disciplina-item" draggable="true"
                 ondragstart="if(window.sistemaGrade) window.sistemaGrade.dragStart(event, 'disciplina', '${this.id}')"
                 data-id="${this.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>${this.nome}</strong>
                    <div>
                        ${this.compartilhada ? '<span class="badge bg-success">Compart.</span>' : ''}
                        ${this.permiteDoisProfessores ? '<span class="badge bg-warning">2 Profs</span>' : ''}
                    </div>
                </div>
                <div class="carga-indicator">${professoresNomes}</div>
            </div>
        `;
    }

    adicionarProfessor(professorId) {
        if (!this.professores.includes(professorId)) {
            this.professores.push(professorId);
        }
    }

    removerProfessor(professorId) {
        this.professores = this.professores.filter(id => id !== professorId);
    }

    podeTerDoisProfessores() {
        return this.permiteDoisProfessores;
    }
}