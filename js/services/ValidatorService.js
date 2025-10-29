class ValidatorService {
    static verificarConflitoHorario(novaAula, aulaIgnoradaId = null) {
        const alertas = [];
        
        if (!window.sistemaGrade) return alertas;
        
        const conflitoProfessor = sistemaGrade.aulas.find(aula => 
            aula.id !== aulaIgnoradaId &&
            aula.professorId === novaAula.professorId &&
            aula.dia === novaAula.dia &&
            aula.horario === novaAula.horario
        );
        
        if (conflitoProfessor) {
            alertas.push(`Professor já tem aula neste horário`);
        }

        const conflitoTurma = sistemaGrade.aulas.find(aula => 
            aula.id !== aulaIgnoradaId &&
            aula.turmaId === novaAula.turmaId &&
            aula.dia === novaAula.dia &&
            aula.horario === novaAula.horario
        );
        
        if (conflitoTurma) {
            alertas.push(`Turma já tem aula neste horário`);
        }

        return alertas;
    }

    static verificarCargaDiaria(professorId, dia, aulaIgnoradaId = null) {
        if (!window.sistemaGrade) return [];
        
        const aulasDia = sistemaGrade.aulas.filter(aula => 
            aula.id !== aulaIgnoradaId &&
            aula.professorId === professorId && 
            aula.dia === dia
        );
        
        const professor = sistemaGrade.professores.find(p => p.id === professorId);
        if (professor && aulasDia.length >= professor.cargaMaximaDiaria) {
            return [`Professor atingiu carga máxima diária (${professor.cargaMaximaDiaria} aulas)`];
        }
        
        return [];
    }

    static verificarIntersticio(professorId, aulaIgnoradaId = null) {
        const alertas = [];
        if (!window.sistemaGrade) return alertas;
        
        const aulasProfessor = sistemaGrade.aulas.filter(aula => 
            aula.id !== aulaIgnoradaId && aula.professorId === professorId
        );
        
        const aulasPorDia = {};
        aulasProfessor.forEach(aula => {
            if (!aulasPorDia[aula.dia]) aulasPorDia[aula.dia] = [];
            aulasPorDia[aula.dia].push(aula.horario);
        });

        for (let dia = 0; dia < 4; dia++) {
            const ultimaAulaHoje = this.obterUltimaAulaDoDia(aulasPorDia[dia]);
            const primeiraAulaAmanha = this.obterPrimeiraAulaDoDia(aulasPorDia[dia + 1]);
            
            if (ultimaAulaHoje && primeiraAulaAmanha) {
                const intervalo = this.calcularIntervaloHoras(ultimaAulaHoje, primeiraAulaAmanha);
                if (intervalo < 11) {
                    alertas.push(`Intervalo de apenas ${intervalo.toFixed(1)}h entre dias (mínimo 11h)`);
                }
            }
        }

        return alertas;
    }

    static verificarDisponibilidade(professorId, dia, horario) {
        if (!window.sistemaGrade) return [];
        
        const professor = sistemaGrade.professores.find(p => p.id === professorId);
        if (professor && !professor.podeLecionar(dia, horario)) {
            return [`Professor fora da disponibilidade declarada`];
        }
        return [];
    }

    static validarAulaCompleta(novaAula, aulaIgnoradaId = null) {
        const resultados = {
            alertas: []
        };

        if (!window.sistemaGrade) return resultados;

        resultados.alertas.push(...this.verificarConflitoHorario(novaAula, aulaIgnoradaId));
        resultados.alertas.push(...this.verificarCargaDiaria(novaAula.professorId, novaAula.dia, aulaIgnoradaId));
        resultados.alertas.push(...this.verificarDisponibilidade(novaAula.professorId, novaAula.dia, novaAula.horario));
        resultados.alertas.push(...this.verificarIntersticio(novaAula.professorId, aulaIgnoradaId));

        resultados.alertas = [...new Set(resultados.alertas)];

        return resultados;
    }

    static obterUltimaAulaDoDia(horarios) {
        return horarios ? horarios.sort().pop() : null;
    }

    static obterPrimeiraAulaDoDia(horarios) {
        return horarios ? horarios.sort()[0] : null;
    }

    static calcularIntervaloHoras(horario1, horario2) {
        const [h1, m1] = horario1.split(':').map(Number);
        const [h2, m2] = horario2.split(':').map(Number);
        
        let horas = h2 - h1;
        let minutos = m2 - m1;
        
        if (minutos < 0) {
            horas--;
            minutos += 60;
        }
        
        return horas + (minutos / 60);
    }
}

// Tornar global
window.ValidatorService = ValidatorService;