// Aguarda o carregamento completo do DOM antes de executar o código
document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let projects = JSON.parse(localStorage.getItem('projects')) || []; // Carrega projetos do localStorage ou inicia array vazio
    let timeEntries = JSON.parse(localStorage.getItem('timeEntries')) || []; // Carrega registros de tempo ou inicia array vazio
    let currentDate = new Date(); // Data atual para controle do calendário
    let selectedDate = null; // Data selecionada no calendário
    let selectedProject = null; // Projeto selecionado para cálculos

    // Elementos do DOM - seleção de todos os elementos necessários
    const projectNameInput = document.getElementById('project-name'); // Input do nome do projeto
    const addProjectBtn = document.getElementById('add-project'); // Botão para adicionar projeto
    const projectsList = document.getElementById('projects-list'); // Lista de projetos
    const prevMonthBtn = document.getElementById('prev-month'); // Botão mês anterior
    const nextMonthBtn = document.getElementById('next-month'); // Botão próximo mês
    const currentMonthEl = document.getElementById('current-month'); // Exibição do mês atual
    const calendarGrid = document.getElementById('calendar-grid'); // Grade do calendário
    const timeModal = document.getElementById('time-modal'); // Modal de registro de horas
    const timeForm = document.getElementById('time-form'); // Formulário de horas
    const selectedProjectSelect = document.getElementById('selected-project'); // Select de projetos no modal
    const calcModal = document.getElementById('calc-modal'); // Modal de cálculos
    const calcHourBtn = document.getElementById('calc-hour-value'); // Botão calcular valor hora
    const calcProjectBtn = document.getElementById('calc-project-value'); // Botão calcular valor projeto
    const resultText = document.getElementById('result-text'); // Texto do resultado

    // Inicialização - renderiza os projetos e o calendário ao carregar
    renderProjects();
    renderCalendar();

    // Event Listeners - adiciona os ouvintes de eventos
    addProjectBtn.addEventListener('click', addProject); // Adiciona projeto ao clicar
    prevMonthBtn.addEventListener('click', () => { // Navega para mês anterior
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    nextMonthBtn.addEventListener('click', () => { // Navega para próximo mês
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    // Fecha modais ao clicar nos botões de fechar
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            timeModal.classList.add('hidden');
            calcModal.classList.add('hidden');
        });
    });
    calcHourBtn.addEventListener('click', calculateHourValue); // Calcula valor da hora
    calcProjectBtn.addEventListener('click', calculateProjectValue); // Calcula valor do projeto

    // Funções de Projetos
    function addProject() {
        const name = projectNameInput.value.trim(); // Obtém e limpa o nome do projeto
        if (name) { // Verifica se há nome
            const project = { // Cria objeto do projeto
                id: Date.now().toString(), // ID único baseado no timestamp
                name,
                color: getRandomColor() // Gera cor aleatória
            };
            projects.push(project); // Adiciona ao array
            saveProjects(); // Salva no localStorage
            renderProjects(); // Atualiza a exibição
            projectNameInput.value = ''; // Limpa o input
        }
    }

    function renderProjects() {
        projectsList.innerHTML = ''; // Limpa a lista
        // Para cada projeto, cria um elemento na lista
        projects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = 'project-tag';
            projectEl.innerHTML = `
                ${project.name}
                <button class="remove-project" data-id="${project.id}">×</button>
            `;
            projectsList.appendChild(projectEl);
        });

        // Atualiza o select no modal de horas
        selectedProjectSelect.innerHTML = '<option value="">Selecione um projeto</option>';
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            selectedProjectSelect.appendChild(option);
        });

        // Adiciona eventos para remover projetos
        document.querySelectorAll('.remove-project').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id'); // Obtém ID do projeto
                projects = projects.filter(p => p.id !== id); // Filtra para remover
                saveProjects(); // Salva alterações
                renderProjects(); // Atualiza exibição
            });
        });
    }

    // Funções do Calendário
    function renderCalendar() {
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        // Atualiza o cabeçalho com mês e ano
        currentMonthEl.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        calendarGrid.innerHTML = ''; // Limpa o calendário

        // Adiciona cabeçalhos dos dias da semana
        ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Calcula primeiro dia do mês e quantidade de dias
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        // Adiciona dias vazios para alinhar o primeiro dia
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendarGrid.appendChild(emptyDay);
        }

        // Adiciona os dias do mês
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            day.textContent = i;
            
            // Formata data e verifica se tem registros
            const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
            const hasEntries = timeEntries.some(entry => entry.date === dateStr);
            
            // Destaca dias com registros
            if (hasEntries) {
                day.classList.add('has-hours');
            }
            
            // Adiciona evento de clique para abrir modal
            day.addEventListener('click', () => {
                selectedDate = dateStr;
                selectedProject = null;
                timeModal.classList.remove('hidden');
                updateTimeForm();
            });
            
            calendarGrid.appendChild(day);
        }
    }

    // Funções de Registro de Horas
    function updateTimeForm() {
        timeForm.reset(); // Limpa o formulário
        const entriesForDate = timeEntries.filter(entry => entry.date === selectedDate);
        
        // Se já existem registros, mostra modal de cálculo
        if (entriesForDate.length > 0) {
            timeModal.classList.add('hidden');
            showCalcModal(entriesForDate);
        }
    }

    // Evento de submit do formulário de horas
    timeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtém valores do formulário
        const projectId = selectedProjectSelect.value;
        const hours = parseFloat(document.getElementById('hours-worked').value);
        const description = document.getElementById('work-description').value;
        
        if (projectId && hours) { // Valida campos
            const project = projects.find(p => p.id === projectId);
            
            // Adiciona novo registro
            timeEntries.push({
                id: Date.now().toString(),
                date: selectedDate,
                projectId,
                projectName: project.name,
                hours,
                description
            });
            
            saveTimeEntries(); // Salva no localStorage
            timeModal.classList.add('hidden'); // Fecha modal
            renderCalendar(); // Atualiza calendário
            // Mostra modal de cálculo com o novo registro
            showCalcModal([{
                date: selectedDate,
                projectId,
                projectName: project.name,
                hours
            }]);
        }
    });

    // Funções de Cálculo
    function showCalcModal(entries) {
        calcModal.classList.remove('hidden'); // Mostra modal
        document.getElementById('calc-result').classList.add('hidden'); // Esconde resultado
        selectedProject = entries[0].projectId; // Define projeto selecionado
    }

    function calculateHourValue() {
        const project = projects.find(p => p.id === selectedProject);
        const projectEntries = timeEntries.filter(entry => entry.projectId === selectedProject);
        
        // Calcula total de horas e dias trabalhados
        const totalHours = projectEntries.reduce((sum, entry) => sum + entry.hours, 0);
        const totalDays = new Set(projectEntries.map(entry => entry.date)).size;
        
        // Solicita valor total do projeto via prompt
        const projectValue = parseFloat(prompt(`Qual o valor total do projeto "${project.name}"?`));
        
        if (projectValue && !isNaN(projectValue)) {
            // Calcula e exibe valor da hora
            const hourValue = projectValue / totalHours;
            resultText.textContent = `Seu valor hora no projeto ${project.name} é R$ ${hourValue.toFixed(2)}`;
            document.getElementById('calc-result').classList.remove('hidden');
        }
    }

    function calculateProjectValue() {
        const project = projects.find(p => p.id === selectedProject);
        const projectEntries = timeEntries.filter(entry => entry.projectId === selectedProject);
        
        // Calcula total de horas trabalhadas
        const totalHours = projectEntries.reduce((sum, entry) => sum + entry.hours, 0);
        // Solicita valor da hora via prompt
        const hourValue = parseFloat(prompt(`Qual o valor da sua hora no projeto "${project.name}"?`));
        
        if (hourValue && !isNaN(hourValue)) {
            // Calcula e exibe valor total do projeto
            const projectValue = hourValue * totalHours;
            resultText.textContent = `O valor estimado do projeto ${project.name} é R$ ${projectValue.toFixed(2)}`;
            document.getElementById('calc-result').classList.remove('hidden');
        }
    }

    // Funções Auxiliares
    function formatDate(date) {
        return date.toISOString().split('T')[0]; // Formata data como YYYY-MM-DD
    }

    function getRandomColor() {
        return `#${Math.floor(Math.random()*16777215).toString(16)}`; // Gera cor hexadecimal aleatória
    }

    function saveProjects() {
        localStorage.setItem('projects', JSON.stringify(projects)); // Salva projetos no localStorage
    }

    function saveTimeEntries() {
        localStorage.setItem('timeEntries', JSON.stringify(timeEntries)); // Salva registros no localStorage
    }
});