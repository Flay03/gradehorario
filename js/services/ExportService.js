class ExportService {
    static exportarExcel() {
        if (!window.sistemaGrade) {
            console.error('Sistema não carregado');
            return;
        }

        const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
        const horarios = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        
        let csv = 'Horário;Segunda;Terça;Quarta;Quinta;Sexta\n';
        
        horarios.forEach(horario => {
            let linha = `${horario};`;
            
            dias.forEach((_, diaIndex) => {
                const aulasNoHorario = sistemaGrade.aulas.filter(aula => 
                    aula.dia === diaIndex && aula.horario === horario
                );
                
                const aulaText = aulasNoHorario.map(aula => {
                    const professor = aula.getProfessor();
                    const disciplina = aula.getDisciplina();
                    const turma = aula.getTurma();
                    return `${professor ? professor.nome : 'N/A'} - ${disciplina ? disciplina.nome : 'N/A'} - ${turma ? turma.nome : 'N/A'}`;
                }).join(' | ');
                
                linha += `${aulaText};`;
            });
            
            csv += linha + '\n';
        });

        // Adicionar relatório de professores
        csv += '\n\nRELATÓRIO DE PROFESSORES\n';
        csv += 'Professor;Disciplinas;Carga Total;Disponibilidade\n';
        
        sistemaGrade.professores.forEach(professor => {
            const cargaTotal = sistemaGrade.aulas.filter(aula => aula.professorId === professor.id).length;
            const disciplinas = professor.obterDisciplinasNomes();
            const disponibilidade = professor.obterDisponibilidadeTexto();
            
            csv += `${professor.nome};${disciplinas};${cargaTotal};${disponibilidade}\n`;
        });

        try {
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            if (typeof saveAs !== 'undefined') {
                saveAs(blob, `grade_horaria_${new Date().toISOString().split('T')[0]}.csv`);
            } else {
                // Fallback para navegadores sem FileSaver
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `grade_horaria_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (e) {
            console.error('Erro ao exportar Excel:', e);
            alert('Erro ao exportar. Tente novamente.');
        }
    }

    static exportarRelatorioConflitos() {
        if (!window.sistemaGrade) return;

        let relatorio = 'RELATÓRIO DE CONFLITOS E ALERTAS\n';
        relatorio += `Gerado em: ${new Date().toLocaleString()}\n\n`;
        
        let totalAlertas = 0;
        const alertasUnicos = new Set();
        
        sistemaGrade.aulas.forEach(aula => {
            const validacao = ValidatorService.validarAulaCompleta(aula);
            
            if (validacao.alertas.length > 0) {
                const professor = aula.getProfessor();
                const disciplina = aula.getDisciplina();
                const turma = aula.getTurma();
                
                relatorio += `AULA: ${professor ? professor.nome : 'N/A'} - ${disciplina ? disciplina.nome : 'N/A'} - ${turma ? turma.nome : 'N/A'}\n`;
                relatorio += `Horário: ${aula.horario} - Dia: ${aula.dia + 1}\n`;
                
                if (validacao.alertas.length > 0) {
                    relatorio += 'ALERTAS:\n';
                    validacao.alertas.forEach(alerta => {
                        relatorio += `  ⚠️ ${alerta}\n`;
                        alertasUnicos.add(alerta);
                    });
                    totalAlertas += validacao.alertas.length;
                }
                
                relatorio += '\n';
            }
        });
        
        relatorio += `RESUMO: ${totalAlertas} alertas encontrados (${alertasUnicos.size} únicos)\n`;
        
        try {
            const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8;' });
            if (typeof saveAs !== 'undefined') {
                saveAs(blob, `relatorio_conflitos_${new Date().toISOString().split('T')[0]}.txt`);
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `relatorio_conflitos_${new Date().toISOString().split('T')[0]}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (e) {
            console.error('Erro ao exportar relatório:', e);
        }
    }
}

window.ExportService = ExportService;