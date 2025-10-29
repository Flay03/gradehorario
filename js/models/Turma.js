class Turma {
    constructor(id, nome, periodo = 'MATUTINO', disciplinas = []) {
        this.id = id;
        this.nome = nome;
        this.periodo = periodo;
        this.disciplinas = disciplinas;
    }

    toDraggableHTML() {
        const aulasCount = window.sistemaGrade ? window.sistemaGrade.aulas.filter(aula => aula.turmaId === this.id).length : 0;
        const disciplinasCount = this.disciplinas.length;
        
        return `
            <div class="turma-item" data-id="${this.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>${this.nome}</strong>
                    <span class="badge bg-info">${aulasCount}a</span>
                </div>
                <div class="carga-indicator">
                    ${this.periodo} • ${disciplinasCount} disciplinas
                </div>
                <div class="mt-1">
                    <small>
                        <button class="btn btn-outline-secondary btn-sm w-100" 
                                onclick="if(window.sistemaGrade) window.sistemaGrade.abrirModalEditarTurma('${this.id}')">
                            Editar Disciplinas
                        </button>
                    </small>
                </div>
            </div>
        `;
    }

    obterDisciplinasComProfessores() {
        if (!window.sistemaGrade) return [];
        
        return this.disciplinas.map(item => {
            const disciplina = window.sistemaGrade.disciplinas.find(d => d.id === item.disciplinaId);
            const professor = window.sistemaGrade.professores.find(p => p.id === item.professorId);
            return {
                disciplina: disciplina,
                professor: professor,
                disciplinaId: item.disciplinaId,
                professorId: item.professorId
            };
        }).filter(item => item.disciplina !== undefined);
    }

    temDisciplina(disciplinaId) {
        return this.disciplinas.some(item => item.disciplinaId === disciplinaId);
    }

    adicionarDisciplina(disciplinaId, professorId) {
        if (!this.temDisciplina(disciplinaId)) {
            this.disciplinas.push({
                disciplinaId: disciplinaId,
                professorId: professorId
            });
        }
    }

    removerDisciplina(disciplinaId) {
        this.disciplinas = this.disciplinas.filter(item => item.disciplinaId !== disciplinaId);
    }

    obterProfessorDaDisciplina(disciplinaId) {
        const item = this.disciplinas.find(d => d.disciplinaId === disciplinaId);
        return item ? item.professorId : null;
    }

    atualizarProfessorDaDisciplina(disciplinaId, professorId) {
        const item = this.disciplinas.find(d => d.disciplinaId === disciplinaId);
        if (item) {
            item.professorId = professorId;
        }
    }
}