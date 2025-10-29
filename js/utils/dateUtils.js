class DateUtils {
    static diasDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    
    static obterNomeDia(diaIndex) {
        return this.diasDaSemana[diaIndex] || 'Dia inválido';
    }
    
    static converterHorarioParaMinutos(horario) {
        const [horas, minutos] = horario.split(':').map(Number);
        return horas * 60 + minutos;
    }
    
    static converterMinutosParaHorario(minutos) {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
    
    static calcularDiferencaHoras(horario1, horario2) {
        const minutos1 = this.converterHorarioParaMinutos(horario1);
        const minutos2 = this.converterHorarioParaMinutos(horario2);
        return Math.abs(minutos2 - minutos1) / 60;
    }
    
    static obterProximoHorario(horario, intervaloMinutos = 60) {
        const minutosAtuais = this.converterHorarioParaMinutos(horario);
        const proximosMinutos = minutosAtuais + intervaloMinutos;
        return this.converterMinutosParaHorario(proximosMinutos);
    }
    
    static validarHorario(horario) {
        const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return regex.test(horario);
    }
    
    static compararHorarios(horario1, horario2) {
        const minutos1 = this.converterHorarioParaMinutos(horario1);
        const minutos2 = this.converterHorarioParaMinutos(horario2);
        return minutos1 - minutos2;
    }
    
    static ordenarHorarios(horarios) {
        return horarios.sort((a, b) => this.compararHorarios(a, b));
    }
    
    static gerarIntervaloHorarios(inicio, fim, intervaloMinutos = 60) {
        const horarios = [];
        let horarioAtual = inicio;
        
        while (this.compararHorarios(horarioAtual, fim) <= 0) {
            horarios.push(horarioAtual);
            horarioAtual = this.obterProximoHorario(horarioAtual, intervaloMinutos);
        }
        
        return horarios;
    }
}

window.DateUtils = DateUtils;