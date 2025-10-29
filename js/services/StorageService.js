class StorageService {
    static salvarDados() {
        if (!window.sistemaGrade) return;
        
        const dados = {
            professores: sistemaGrade.professores,
            disciplinas: sistemaGrade.disciplinas,
            turmas: sistemaGrade.turmas,
            aulas: sistemaGrade.aulas,
            versao: '2.2'
        };
        
        try {
            localStorage.setItem('gradeHoraria', JSON.stringify(dados));
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
        }
    }

    static carregarDados() {
        if (!window.sistemaGrade) return false;
        
        try {
            const dados = localStorage.getItem('gradeHoraria');
            if (dados) {
                const parsed = JSON.parse(dados);
                
                sistemaGrade.professores = parsed.professores.map(p => 
                    new Professor(p.id, p.nome, p.disciplinas, p.disponibilidade, p.cargaMaximaDiaria)
                );
                sistemaGrade.disciplinas = parsed.disciplinas.map(d => 
                    new Disciplina(d.id, d.nome, d.compartilhada, d.professores, d.permiteDoisProfessores || false)
                );
                sistemaGrade.turmas = parsed.turmas.map(t => 
                    new Turma(t.id, t.nome, t.periodo, t.disciplinas)
                );
                sistemaGrade.aulas = parsed.aulas.map(a => 
                    new Aula(a.id, a.professorId, a.disciplinaId, a.turmaId, a.dia, a.horario, a.duracao)
                );
                
                return true;
            }
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
        }
        return false;
    }

    static limparDados() {
        try {
            localStorage.removeItem('gradeHoraria');
        } catch (e) {
            console.error('Erro ao limpar dados:', e);
        }
    }

    static exportarBackup() {
        if (!window.sistemaGrade) return;
        
        const dados = {
            professores: sistemaGrade.professores,
            disciplinas: sistemaGrade.disciplinas,
            turmas: sistemaGrade.turmas,
            aulas: sistemaGrade.aulas,
            exportadoEm: new Date().toISOString()
        };
        
        try {
            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            if (typeof saveAs !== 'undefined') {
                saveAs(blob, `backup_grade_${new Date().toISOString().split('T')[0]}.json`);
            }
        } catch (e) {
            console.error('Erro ao exportar backup:', e);
        }
    }
}

window.StorageService = StorageService;