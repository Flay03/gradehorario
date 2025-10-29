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
            ]),
            new Professor('p3', 'Prof. Carlos Oliveira', ['d5', 'd6'], [
                {dia: 1, horarios: ['13:00', '14:00', '15:00', '16:00']},
                {dia: 3, horarios: ['08:00', '09:00', '10:00']}
            ])
        ];

        this.disciplinas = [
            new Disciplina('d1', 'Matemática', false, ['p1'], false),
            new Disciplina('d2', 'Física', false, ['p1'], false),
            new Disciplina('d3', 'Português', false, ['p2'], false),
            new Disciplina('d4', 'Literatura', true, ['p2'], true),
            new Disciplina('d5', 'História', false, ['p3'], false),
            new Disciplina('d6', 'Geografia', false, ['p3'], true)
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

    // DRAG & DROP CORRIGIDO - PROFESSORES FUNCIONANDO
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

    // NOVO: ADICIONAR PROFESSOR
    abrirModalAdicionarProfessor() {
        const modalHTML = `
            <div class="modal fade" id="modalAdicionarProfessor" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">➕ Adicionar Professor</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formAdicionarProfessor">
                                <div class="mb-3">
                                    <label class="form-label">Nome do Professor:</label>
                                    <input type="text" class="form-control" id="novoProfessorNome" required placeholder="Ex: Prof. João Silva">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Disciplinas Ministradas:</label>
                                    <div class="border p-2" style="max-height: 200px; overflow-y: auto;">
                                        ${this.disciplinas.map(disc => `
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" value="${disc.id}" id="disc-${disc.id}">
                                                <label class="form-check-label" for="disc-${disc.id}">${disc.nome}</label>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="sistemaGrade.confirmarAdicionarProfessor()">Adicionar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        const modal = new bootstrap.Modal(document.getElementById('modalAdicionarProfessor'));
        modal.show();
        
        modal._element.addEventListener('hidden.bs.modal', function () {
            modalContainer.remove();
        });
    },

    confirmarAdicionarProfessor() {
        const nomeInput = document.getElementById('novoProfessorNome');
        if (!nomeInput || !nomeInput.value.trim()) {
            this.mostrarMensagem('Digite o nome do professor', 'error');
            return;
        }

        const checkboxes = document.querySelectorAll('#formAdicionarProfessor input[type="checkbox"]');
        const disciplinasSelecionadas = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const novoProfessor = new Professor(
            'p' + (this.professores.length + 1),
            nomeInput.value.trim(),
            disciplinasSelecionadas,
            [] // Disponibilidade vazia inicial
        );

        this.professores.push(novoProfessor);
        this.salvarGrade();
        this.atualizarInterface();
        
        const modalElement = document.getElementById('modalAdicionarProfessor');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        this.mostrarMensagem('Professor adicionado com sucesso!', 'success');
    },

    // GESTÃO DE TURMAS CORRIGIDA
    abrirModalGerenciarTurmas() {
        const modalElement = document.getElementById('modalGerenciarTurmas');
        if (modalElement && typeof bootstrap !== 'undefined') {
            this.atualizarListaTurmasGerenciamento();
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    },

    criarNovaTurma() {
        const novaTurma = new Turma(
            't' + (this.turmas.length + 1),
            'Nova Turma',
            'MATUTINO',
            []
        );
        
        this.turmas.push(novaTurma);
        this.salvarGrade();
        this.abrirModalEditarTurma(novaTurma.id);
    },

    abrirModalEditarTurma(turmaId) {
        const turma = this.turmas.find(t => t.id === turmaId);
        if (!turma) return;

        const turmaEdicaoId = document.getElementById('turmaEdicaoId');
        const turmaEdicaoNome = document.getElementById('turmaEdicaoNome');
        const turmaEdicaoPeriodo = document.getElementById('turmaEdicaoPeriodo');
        
        if (turmaEdicaoId && turmaEdicaoNome && turmaEdicaoPeriodo) {
            turmaEdicaoId.value = turma.id;
            turmaEdicaoNome.value = turma.nome;
            turmaEdicaoPeriodo.value = turma.periodo;

            this.preencherDisciplinasTurma(turma);

            const modalElement = document.getElementById('modalEditarTurma');
            if (modalElement && typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        }
    },

    preencherDisciplinasTurma(turma) {
        const container = document.getElementById('listaDisciplinasTurma');
        if (!container) return;
        
        const disciplinasComProfessores = turma.obterDisciplinasComProfessores();
        
        container.innerHTML = '';
        
        disciplinasComProfessores.forEach(item => {
            container.innerHTML += this.criarItemDisciplinaTurma(item.disciplina, item.professor);
        });
        
        container.innerHTML += `
            <div class="text-center mt-3">
                <button type="button" class="btn btn-outline-primary btn-sm" onclick="sistemaGrade.abrirModalAdicionarDisciplinaTurma('${turma.id}')">
                    ➕ Adicionar/Criar Disciplina
                </button>
            </div>
        `;
    },

    criarItemDisciplinaTurma(disciplina, professorAtual = null) {
        const professoresOptions = this.professores
            .filter(prof => prof.disciplinas.includes(disciplina.id))
            .map(prof => `<option value="${prof.id}" ${professorAtual && prof.id === professorAtual.id ? 'selected' : ''}>${prof.nome}</option>`)
            .join('');
            
        return `
            <div class="disciplina-turma-item border p-3 mb-3 rounded">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <strong>${disciplina.nome}</strong>
                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="sistemaGrade.removerDisciplinaTurma('${disciplina.id}')">
                        🗑️ Remover
                    </button>
                </div>
                <div class="row">
                    <div class="col-md-8">
                        <label class="form-label">Professor:</label>
                        <select class="form-select form-select-sm professor-disciplina-select" data-disciplina="${disciplina.id}">
                            <option value="">Selecione um professor</option>
                            ${professoresOptions}
                        </select>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check mt-4">
                            <input class="form-check-input" type="checkbox" ${disciplina.permiteDoisProfessores ? 'checked' : ''} disabled>
                            <label class="form-check-label">
                                <small>Permite 2 professores</small>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // CORREÇÃO: MODAL PARA ADICIONAR/CRIAR DISCIPLINAS
    abrirModalAdicionarDisciplinaTurma(turmaId) {
        const turma = this.turmas.find(t => t.id === turmaId);
        if (!turma) return;

        const modalHTML = `
            <div class="modal fade" id="modalAdicionarDisciplina" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Adicionar Disciplina à Turma</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Selecionar disciplina existente:</label>
                                <select class="form-select mb-3" id="selectDisciplinaExistente">
                                    <option value="">Selecione uma disciplina</option>
                                    ${this.disciplinas
                                        .filter(disc => !turma.temDisciplina(disc.id))
                                        .map(disc => `<option value="${disc.id}">${disc.nome}</option>`)
                                        .join('')}
                                </select>
                            </div>
                            <hr>
                            <div class="mb-3">
                                <label class="form-label">Ou criar nova disciplina:</label>
                                <input type="text" class="form-control" id="novaDisciplinaNome" placeholder="Nome da nova disciplina">
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="novaDisciplinaDoisProfessores">
                                <label class="form-check-label">Permite dois professores</label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="sistemaGrade.confirmarAdicionarDisciplinaTurma('${turmaId}')">Adicionar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        const modal = new bootstrap.Modal(document.getElementById('modalAdicionarDisciplina'));
        modal.show();
        
        modal._element.addEventListener('hidden.bs.modal', function () {
            modalContainer.remove();
        });
    },

    confirmarAdicionarDisciplinaTurma(turmaId) {
        const turma = this.turmas.find(t => t.id === turmaId);
        if (!turma) return;

        const disciplinaExistenteId = document.getElementById('selectDisciplinaExistente')?.value;
        const novaDisciplinaNome = document.getElementById('novaDisciplinaNome')?.value.trim();
        const permiteDoisProfessores = document.getElementById('novaDisciplinaDoisProfessores')?.checked || false;

        let disciplinaId;

        if (disciplinaExistenteId) {
            // Usar disciplina existente
            disciplinaId = disciplinaExistenteId;
        } else if (novaDisciplinaNome) {
            // Criar nova disciplina
            disciplinaId = 'd' + (this.disciplinas.length + 1);
            const novaDisciplina = new Disciplina(
                disciplinaId,
                novaDisciplinaNome,
                false,
                [], // Professores vazios inicialmente
                permiteDoisProfessores
            );
            this.disciplinas.push(novaDisciplina);
        } else {
            this.mostrarMensagem('Selecione uma disciplina existente ou digite o nome de uma nova', 'error');
            return;
        }

        // Adicionar disciplina à turma
        turma.adicionarDisciplina(disciplinaId, '');
        this.salvarGrade();
        this.preencherDisciplinasTurma(turma);
        
        const modalElement = document.getElementById('modalAdicionarDisciplina');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        this.mostrarMensagem('Disciplina adicionada à turma!', 'success');
    },

    removerDisciplinaTurma(disciplinaId) {
        const turmaId = document.getElementById('turmaEdicaoId')?.value;
        if (!turmaId) return;
        
        const turma = this.turmas.find(t => t.id === turmaId);
        if (turma && confirm('Deseja remover esta disciplina da turma?')) {
            turma.removerDisciplina(disciplinaId);
            this.salvarGrade();
            this.preencherDisciplinasTurma(turma);
            this.mostrarMensagem('Disciplina removida!', 'info');
        }
    },

    salvarEdicaoTurma() {
        const turmaId = document.getElementById('turmaEdicaoId')?.value;
        if (!turmaId) return;
        
        const turma = this.turmas.find(t => t.id === turmaId);
        if (!turma) return;

        const turmaEdicaoNome = document.getElementById('turmaEdicaoNome');
        const turmaEdicaoPeriodo = document.getElementById('turmaEdicaoPeriodo');
        
        if (turmaEdicaoNome && turmaEdicaoPeriodo) {
            turma.nome = turmaEdicaoNome.value;
            turma.periodo = turmaEdicaoPeriodo.value;
        }

        const selects = document.querySelectorAll('.professor-disciplina-select');
        selects.forEach(select => {
            const disciplinaId = select.dataset.disciplina;
            const professorId = select.value;
            if (professorId) {
                turma.atualizarProfessorDaDisciplina(disciplinaId, professorId);
            }
        });

        this.salvarGrade();
        this.atualizarInterface();
        
        const modalElement = document.getElementById('modalEditarTurma');
        if (modalElement && typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        this.mostrarMensagem('Turma atualizada!', 'success');
    },

    atualizarListaTurmasGerenciamento() {
        const lista = document.getElementById('listaTurmasGerenciamento');
        if (!lista) return;
        
        lista.innerHTML = '';
        
        this.turmas.forEach(turma => {
            const disciplinas = turma.obterDisciplinasComProfessores();
            lista.innerHTML += `
                <div class="turma-disciplina-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>${turma.nome}</strong>
                            <div class="text-muted">${turma.periodo}</div>
                        </div>
                        <button class="btn btn-outline-primary btn-sm" 
                                onclick="sistemaGrade.abrirModalEditarTurma('${turma.id}')">
                            Editar
                        </button>
                    </div>
                    <div class="mt-2">
                        <small>
                            <strong>Disciplinas:</strong> 
                            ${disciplinas.map(d => `${d.disciplina.nome} (${d.professor ? d.professor.nome : 'Sem professor'})`).join(', ') || 'Nenhuma disciplina'}
                        </small>
                    </div>
                </div>
            `;
        });
    },

    // MÉTODOS EXISTENTES
    editarAula(aulaId) {
        if (confirm('Deseja remover esta aula?')) {
            this.aulas = this.aulas.filter(aula => aula.id !== aulaId);
            this.salvarGrade();
            this.atualizarInterface();
            this.mostrarMensagem('Aula removida!', 'info');
        }
    },

    abrirModalEditarProfessor(professorId) {
        const professor = this.professores.find(p => p.id === professorId);
        if (!professor) return;

        const professorIdInput = document.getElementById('professorId');
        const professorNomeInput = document.getElementById('professorNome');
        
        if (professorIdInput && professorNomeInput) {
            professorIdInput.value = professor.id;
            professorNomeInput.value = professor.nome;

            this.preencherDisciplinasProfessor(professor);
            this.preencherGridDisponibilidade(professor);

            const modalElement = document.getElementById('modalEditarProfessor');
            if (modalElement && typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        }
    },

    preencherDisciplinasProfessor(professor) {
        const container = document.getElementById('listaDisciplinasProfessor');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.disciplinas.forEach(disciplina => {
            const checked = professor.disciplinas.includes(disciplina.id) ? 'checked' : '';
            container.innerHTML += `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${disciplina.id}" ${checked}>
                    <label class="form-check-label">${disciplina.nome}</label>
                    ${disciplina.permiteDoisProfessores ? '<span class="badge bg-warning ms-2">2 Profs</span>' : ''}
                </div>
            `;
        });
    },

    preencherGridDisponibilidade(professor) {
        const tbody = document.getElementById('gridDisponibilidade');
        if (!tbody) return;
        
        const horarios = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        
        tbody.innerHTML = '';
        horarios.forEach(horario => {
            let linha = `<tr><td class="fw-bold">${horario}</td>`;
            
            for (let dia = 0; dia < 5; dia++) {
                const disponivel = professor.podeLecionar(dia, horario);
                const checked = disponivel ? 'checked' : '';
                linha += `
                    <td class="text-center">
                        <input type="checkbox" data-dia="${dia}" data-horario="${horario}" ${checked}>
                    </td>
                `;
            }
            
            linha += '</tr>';
            tbody.innerHTML += linha;
        });
    },

    salvarEdicaoProfessor() {
        const professorId = document.getElementById('professorId')?.value;
        if (!professorId) return;
        
        const professor = this.professores.find(p => p.id === professorId);
        if (!professor) return;

        const professorNomeInput = document.getElementById('professorNome');
        if (professorNomeInput) {
            professor.nome = professorNomeInput.value;
        }

        const checkboxes = document.querySelectorAll('#listaDisciplinasProfessor input[type="checkbox"]');
        professor.disciplinas = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const checkboxesDisp = document.querySelectorAll('#gridDisponibilidade input[type="checkbox"]');
        const novaDisponibilidade = [];
        
        checkboxesDisp.forEach(cb => {
            if (cb.checked) {
                const dia = parseInt(cb.dataset.dia);
                const horario = cb.dataset.horario;
                
                let dispDia = novaDisponibilidade.find(d => d.dia === dia);
                if (!dispDia) {
                    dispDia = { dia: dia, horarios: [] };
                    novaDisponibilidade.push(dispDia);
                }
                dispDia.horarios.push(horario);
            }
        });
        
        professor.disponibilidade = novaDisponibilidade;
        this.salvarGrade();
        this.atualizarInterface();
        
        const modalElement = document.getElementById('modalEditarProfessor');
        if (modalElement && typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        this.mostrarMensagem('Professor atualizado!', 'success');
    },

    atualizarListaTurmasFiltrada(turmasFiltradas) {
        const lista = document.getElementById('listaTurmas');
        if (lista) {
            lista.innerHTML = turmasFiltradas.map(turma => turma.toDraggableHTML()).join('');
        }
    },

    atualizarInterface() {
        GradeComponent.gerarGrade();
        ProfessorPanel.atualizarLista();
        this.atualizarPainelTurmas();
        AlertPanel.atualizarAlertas();
    },

    atualizarPainelTurmas() {
        const lista = document.getElementById('listaTurmas');
        if (lista) {
            lista.innerHTML = this.turmas.map(turma => turma.toDraggableHTML()).join('');
        }
    },

    obterCargaDiariaProfessor(professorId) {
        return this.aulas.filter(aula => aula.professorId === professorId).length;
    },

    salvarGrade() {
        StorageService.salvarDados();
    },

    exportarExcel() {
        ExportService.exportarExcel();
        this.mostrarMensagem('Exportação iniciada!', 'info');
    },

    limparGrade() {
        if (confirm('Tem certeza que deseja limpar toda a grade?')) {
            this.aulas = [];
            this.salvarGrade();
            this.atualizarInterface();
            this.mostrarMensagem('Grade limpa!', 'info');
        }
    },

    carregarDadosExemplo() {
        if (confirm('Deseja carregar dados de exemplo?')) {
            this.criarDadosExemplo();
            this.aulas = [];
            this.salvarGrade();
            this.atualizarInterface();
            this.mostrarMensagem('Dados de exemplo carregados!', 'success');
        }
    },

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
