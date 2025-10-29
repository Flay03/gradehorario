class GradeComponent {
    static gerarGrade() {
        if (!window.sistemaGrade) return;
        
        const gradeElement = document.getElementById('gradeHoraria');
        if (!gradeElement) return;

        const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
        const horarios = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        
        let html = '<div class="grade-header">';
        html += '<div class="grade-header-cell">Horário</div>';
        dias.forEach(dia => {
            html += `<div class="grade-header-cell">${dia}</div>`;
        });
        html += '</div>';
        
        html += '<div class="grade-body">';
        horarios.forEach(horario => {
            html += `<div class="grade-time-cell">${horario}</div>`;
            dias.forEach((_, diaIndex) => {
                const aulasCelula = sistemaGrade.aulas.filter(aula => 
                    aula.dia === diaIndex && aula.horario === horario
                );
                
                let classeCelula = 'grade-aula-cell vazia';
                let title = 'Clique para adicionar aula';
                
                if (aulasCelula.length > 0) {
                    classeCelula = 'grade-aula-cell ocupada';
                }
                
                html += `
                    <div class="${classeCelula}" 
                         title="${title}"
                         ondragover="if(window.sistemaGrade) window.sistemaGrade.dragOverCelula(event)"
                         ondrop="if(window.sistemaGrade) window.sistemaGrade.dropAula(event, ${diaIndex}, '${horario}')"
                         onclick="if(event.target === this && window.sistemaGrade) window.sistemaGrade.abrirModalAula(${diaIndex}, '${horario}')">
                        ${aulasCelula.map(aula => aula.toHTML()).join('')}
                    </div>
                `;
            });
        });
        html += '</div>';
        
        gradeElement.innerHTML = html;
    }

    static atualizarFiltros() {
        if (!window.sistemaGrade) return;
        
        const busca = document.getElementById('buscaProfessores')?.value.toLowerCase() || '';
        const filtroPeriodo = document.getElementById('filtroPeriodo')?.value || '';
        
        const professoresFiltrados = sistemaGrade.professores.filter(prof => 
            prof.nome.toLowerCase().includes(busca) ||
            prof.obterDisciplinasNomes().toLowerCase().includes(busca)
        );
        
        const turmasFiltradas = sistemaGrade.turmas.filter(turma => 
            !filtroPeriodo || turma.periodo === filtroPeriodo
        );
        
        const contadorElement = document.getElementById('contadorProfessores');
        if (contadorElement) {
            contadorElement.textContent = `${professoresFiltrados.length}/${sistemaGrade.professores.length}`;
        }
        
        ProfessorPanel.atualizarListaFiltrada(professoresFiltrados);
        sistemaGrade.atualizarListaTurmasFiltrada(turmasFiltradas);
    }
}

window.GradeComponent = GradeComponent;