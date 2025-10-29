class Aula {
    constructor(id, professorId, disciplinaId, turmaId, dia, horario, duracao = 1) {
        this.id = id;
        this.professorId = professorId;
        this.disciplinaId = disciplinaId;
        this.turmaId = turmaId;
        this.dia = dia;
        this.horario = horario;
        this.duracao = duracao;
    }

    getProfessor() {
        return window.sistemaGrade ? window.sistemaGrade.professores.find(p => p.id === this.professorId) : null;
    }

    getDisciplina() {
        return window.sistemaGrade ? window.sistemaGrade.disciplinas.find(d => d.id === this.disciplinaId) : null;
    }

    getTurma() {
        return window.sistemaGrade ? window.sistemaGrade.turmas.find(t => t.id === this.turmaId) : null;
    }

    toHTML() {
        const professor = this.getProfessor();
        const disciplina = this.getDisciplina();
        const turma = this.getTurma();

        if (!professor || !disciplina || !turma) {
            return '<div class="text-danger">Erro: Dados incompletos</div>';
        }

        const validacao = window.ValidatorService ? window.ValidatorService.validarAulaCompleta(this, this.id) : { alertas: [] };
        let classeAula = 'aula-content';
        let alertas = [];
        
        if (validacao.alertas && validacao.alertas.length > 0) {
            classeAula += ' aviso';
            alertas = validacao.alertas;
        } else if (disciplina.compartilhada) {
            classeAula += ' compartilhada';
        }

        const title = alertas.length > 0 ? `Alertas:\n${alertas.join('\n')}` : '';

        return `
            <div class="${classeAula}" 
                 draggable="true"
                 ondragstart="if(window.sistemaGrade) window.sistemaGrade.dragStartAula(event, '${this.id}')"
                 ondragend="if(window.sistemaGrade) window.sistemaGrade.dragEndAula(event)"
                 data-aula-id="${this.id}"
                 title="${title}">
                <div class="professor">${professor.nome.split(' ')[0]}</div>
                <div class="disciplina">${disciplina.nome}</div>
                <div class="turma">${turma.nome}</div>
            </div>
        `;
    }

    moverPara(novoDia, novoHorario) {
        this.dia = novoDia;
        this.horario = novoHorario;
    }
}