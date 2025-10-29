// CORREÇÃO DE SEGURANÇA PARA DEPLOY
if (typeof bootstrap === 'undefined') {
    console.warn('Bootstrap não carregado. Tentando recarregar...');
}

// Sistema principal
window.sistemaGrade = {
    professores: [],
    disciplinas: [],
    turmas: [],
    aulas: [],
    elementoArrastado: null,
    tipoElementoArrastado: null,
    aulaSendoArrastada: null,
    paginaAtual: 0,

    init() {
        console.log('🚀 Inicializando sistema...');
        this.carregarDadosIniciais();
        this.configurarEventListeners();
        
        if (!StorageService.carregarDados()) {
            this.criarDadosExemplo();
        }
        
        this.atualizarInterface();
        console.log('✅ Sistema inicializado com sucesso');
    },

    carregarDadosIniciais() {
        this.atualizarSelectsModal();
        this.preencherFiltros();
    },

    configurarEventListeners() {
        const buscaInput = document.getElementById('buscaProfessores');
        const periodoSelect = document.getElementById('filtroPeriodo');
        
        if (buscaInput) {
            buscaInput.addEventListener('input', () => {
                GradeComponent.atualizarFiltros();
            });
        }
        
        if (periodoSelect) {
            periodoSelect.addEventListener('change', () => {
                GradeComponent.atualizarFiltros();
            });
        }

        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.professor-item')) {
                e.preventDefault();
            }
        });

        const selectProfessor = document.getElementById('selectProfessor');
        const selectTurma = document.getElementById('selectTurma');
        
        if (selectProfessor) {
            selectProfessor.addEventListener('change', () => {
                this.atualizarDisciplinasBaseadoSelecao();
            });
        }
        
        if (selectTurma) {
            selectTurma.addEventListener('change', () => {
                this.atualizarDisciplinasBaseadoSelecao();
            });
        }
    },

    criarDadosExemplo() {
        console.log('📝 Criando dados de exemplo...');
        
        this.professores = [
            new Professor('p1', 'Prof. João Silva', ['d1', 'd2'], [
                {dia: 0, horarios: ['08:00', '09:00', '10:00', '11:00']},
                {dia: 1, horarios: ['08:00', '09:00', '10:00']},
                {dia: 2, horarios: ['08:00', '09:00', '14:00', '15:00']}
            ]),
            new Professor('p2', 'Prof. Maria Santos', ['d3', 'd4'], [
                {dia: 0, horarios: ['13:00', '14:00', '15:00']},
                {dia: 2, horarios: ['08:00', '09:00', '10:00']},
                {dia: 4, horarios: ['08:00', '09:00', '10:00', '11:00']}
            ])
        ];

        this.disciplinas = [
            new Disciplina('d1', 'Matemática', false, ['p1'], false),
            new Disciplina('d2', 'Física', false, ['p1'], false),
            new Disciplina('d3', 'Português', false, ['p2'], false),
            new Disciplina('d4', 'Literatura', true, ['p2'], true)
        ];

        this.turmas = [
            new Turma('t1', '1º Ano A', 'MATUTINO', [
                {disciplinaId: 'd1', professorId: 'p1'},
                {disciplinaId: 'd2', professorId: 'p1'},
                {disciplinaId: 'd3', professorId: 'p2'}
            ]),
            new Turma('t2', '1º Ano B', 'MATUTINO', [
                {disciplinaId: 'd1', professorId: 'p1'},
                {disciplinaId: 'd3', professorId: 'p2'},
                {disciplinaId: 'd4', professorId: 'p2'}
            ])
        ];
    },

    // DRAG & DROP
    dragStart(event, tipo, id) {
        this.elementoArrastado = id;
        this.tipoElementoArrastado = tipo;
        event.dataTransfer.setData('text/plain', id);
        event.currentTarget.classList.add('dragging');
    },

    dragOver(event) {
        event.preventDefault();
    },

    drop(event, dia, horario) {
        event.preventDefault();
        
        if (this.elementoArrastado && this.tipoElementoArrastado === 'professor') {
            this.abrirModalAula(dia, horario, this.elementoArrastado);
        }
        
        this.elementoArrastado = null;
        this.tipoElementoArrastado = null;
    },

    dragStartAula(event, aulaId) {
        event.dataTransfer.setData('text/plain', aulaId);
        event.currentTarget.classList.add('dragging');
        this.aulaSendoArrastada = aulaId;
    },

    dragEndAula(event) {
        event.currentTarget.classList.remove('dragging');
    },

    dragOverCelula(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    },

    dragLeaveCelula(event) {
        event.currentTarget.classList.remove('drag-over');
    },

    dropAula(event, dia, horario) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        
        const aulaId = event.dataTransfer.getData('text/plain');
        const aulaIndex = this.aulas.findIndex(a => a.id === aulaId);
        
        if (aulaIndex !== -1) {
            const aulaOriginal = this.aulas[aulaIndex];
            
            const aulaValidacao = new Aula(
                aulaOriginal.id,
                aulaOriginal.professorId,
                aulaOriginal.disciplinaId,
                aulaOriginal.turmaId,
                dia,
                horario,
                aulaOriginal.duracao
            );
            
            const validacao = ValidatorService.validarAulaCompleta(aulaValidacao, aulaOriginal.id);
            
            this.aulas[aulaIndex].moverPara(dia, horario);
            this.salvarGrade();
            this.atualizarInterface();
            
            if (validacao.alertas.length > 0) {
                validacao.alertas.forEach(alerta => {
                    AlertPanel.adicionarAlerta(`Aula movida: ${alerta}`, 'aviso');
                });
                this.mostrarMensagem('Aula movida (com alertas)', 'warning');
            } else {
                this.mostrarMensagem('Aula movida com sucesso!', 'success');
            }
        }
        
        this.aulaSendoArrastada = null;
    },

    // MODAL DE AULA
    abrirModalAula(dia, horario, professorId = null, turmaId = null) {
        const aulaDiaInput = document.getElementById('aulaDia');
        const aulaHorarioInput = document.getElementById('aulaHorario');
        
        if (aulaDiaInput && aulaHorarioInput) {
            aulaDiaInput.value = dia;
            aulaHorarioInput.value = horario;
            
            this.atualizarSelectsModal(professorId, turmaId);
            
            const modalElement = document.getElementById('modalAula');
            if (modalElement && typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        }
    },

    atualizarSelectsModal(professorSelecionado = null, turmaSelecionada = null) {
        const selectProfessor = document.getElementById('selectProfessor');
        const selectDisciplina = document.getElementById('selectDisciplina');
        const selectTurma = document.getElementById('selectTurma');
        const aulaDiaInput = document.getElementById('aulaDia');
        const aulaHorarioInput = document.getElementById('aulaHorario');
        
        if (!selectProfessor || !selectDisciplina || !selectTurma || !aulaDiaInput || !aulaHorarioInput) return;

        const dia = parseInt(aulaDiaInput.value);
        const horario = aulaHorarioInput.value;

        selectProfessor.innerHTML = '<option value="">Selecione um professor</option>';
        this.professores.forEach(prof => {
            const disponivel = prof.podeLecionar(dia, horario);
            const selected = professorSelecionado === prof.id ? 'selected' : '';
            const labelIndisponivel = !disponivel ? ' (Fora da disponibilidade)' : '';
            
            selectProfessor.innerHTML += `
                <option value="${prof.id}" ${selected}>
                    ${prof.nome}${labelIndisponivel}
                </option>
            `;
        });

        selectTurma.innerHTML = '<option value="">Selecione uma turma</option>';
        this.turmas.forEach(turma => {
            const selected = turmaSelecionada === turma.id ? 'selected' : '';
            selectTurma.innerHTML += `<option value="${turma.id}" ${selected}>${turma.nome} (${turma.periodo})</option>`;
        });

        this.atualizarDisciplinasBaseadoSelecao();

        if (professorSelecionado && selectProfessor) {
            selectProfessor.value = professorSelecionado;
            this.atualizarDisciplinasBaseadoSelecao();
        }

        if (turmaSelecionada && selectTurma) {
            selectTurma.value = turmaSelecionada;
            this.atualizarDisciplinasBaseadoSelecao();
        }
    },

    atualizarDisciplinasBaseadoSelecao() {
        const selectProfessor = document.getElementById('selectProfessor');
        const selectDisciplina = document.getElementById('selectDisciplina');
        const selectTurma = document.getElementById('selectTurma');
        
        if (!selectProfessor || !selectDisciplina || !selectTurma) return;
        
        const professorId = selectProfessor.value;
        const turmaId = selectTurma.value;
        const disciplinaSelecionada = selectDisciplina.value;
        
        selectDisciplina.innerHTML = '<option value="">Selecione uma disciplina</option>';
        
        if (!professorId && !turmaId) {
            this.disciplinas.forEach(disc => {
                const selected = disc.id === disciplinaSelecionada ? 'selected' : '';
                selectDisciplina.innerHTML += `<option value="${disc.id}" ${selected}>${disc.nome}</option>`;
            });
            return;
        }
        
        let disciplinasFiltradas = [];
        
        if (professorId && turmaId) {
            const professor = this.professores.find(p => p.id === professorId);
            const turma = this.turmas.find(t => t.id === turmaId);
            
            if (professor && turma) {
                disciplinasFiltradas = professor.disciplinas.filter(discId => 
                    turma.temDisciplina(discId)
                );
            }
        } else if (professorId) {
            const professor = this.professores.find(p => p.id === professorId);
            disciplinasFiltradas = professor ? professor.disciplinas : [];
        } else if (turmaId) {
            const turma = this.turmas.find(t => t.id === turmaId);
            disciplinasFiltradas = turma.disciplinas.map(item => item.disciplinaId);
        }
        
        disciplinasFiltradas.forEach(discId => {
            const disciplina = this.disciplinas.find(d => d.id === discId);
            if (disciplina) {
                const selected = disciplina.id === disciplinaSelecionada ? 'selected' : '';
                selectDisciplina.innerHTML += `<option value="${disciplina.id}" ${selected}>${disciplina.nome}</option>`;
            }
        });
        
        if (disciplinaSelecionada && !disciplinasFiltradas.includes(disciplinaSelecionada)) {
            selectDisciplina.value = '';
        }
    },

    confirmarAula() {
        const aulaDiaInput = document.getElementById('aulaDia');
        const aulaHorarioInput = document.getElementById('aulaHorario');
        const selectProfessor = document.getElementById('selectProfessor');
        const selectDisciplina = document.getElementById('selectDisciplina');
        const selectTurma = document.getElementById('selectTurma');
        const inputDuracao = document.getElementById('inputDuracao');
        
        if (!aulaDiaInput || !aulaHorarioInput || !selectProfessor || !selectDisciplina || !selectTurma || !inputDuracao) {
            this.mostrarMensagem('Erro: elementos do formulário não encontrados', 'error');
            return;
        }

        const dia = parseInt(aulaDiaInput.value);
        const horario = aulaHorarioInput.value;
        const professorId = selectProfessor.value;
        const disciplinaId = selectDisciplina.value;
        const turmaId = selectTurma.value;
        const duracao = parseInt(inputDuracao.value) || 1;

        if (!professorId || !disciplinaId || !turmaId) {
            this.mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        const novaAula = new Aula(
            Date.now().toString(),
            professorId,
            disciplinaId,
            turmaId,
            dia,
            horario,
            duracao
        );

        const validacao = ValidatorService.validarAulaCompleta(novaAula);
        
        this.aulas.push(novaAula);
        this.salvarGrade();
        this.atualizarInterface();
        
        if (validacao.alertas.length > 0) {
            validacao.alertas.forEach(alerta => {
                AlertPanel.adicionarAlerta(`Nova aula: ${alerta}`, 'aviso');
            });
            this.mostrarMensagem('Aula criada (com alertas)', 'warning');
        } else {
            this.mostrarMensagem('Aula criada com sucesso!', 'success');
        }
        
        const modalElement = document.getElementById('modalAula');
        if (modalElement && typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
    },

    // ... (os outros métodos permanecem iguais, mas com verificações de segurança)

    mostrarMensagem(mensagem, tipo) {
        console.log(`${tipo}: ${mensagem}`);
        
        try {
            const toast = document.createElement('div');
            toast.className = `alert alert-${tipo === 'error' ? 'danger' : tipo} alert-dismissible fade show`;
            toast.style.position = 'fixed';
            toast.style.top = '20px';
            toast.style.right = '20px';
            toast.style.zIndex = '1060';
            toast.innerHTML = `
                ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 3000);
        } catch (e) {
            console.error('Erro ao mostrar mensagem:', e);
        }
    }
};

// Inicialização segura
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, inicializando sistema...');
    
    setTimeout(function() {
        if (window.sistemaGrade && typeof window.sistemaGrade.init === 'function') {
            window.sistemaGrade.init();
        } else {
            console.error('❌ Sistema não carregado corretamente');
        }
    }, 100);
});