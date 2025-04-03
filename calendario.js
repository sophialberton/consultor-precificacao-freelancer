document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let timeEntries = JSON.parse(localStorage.getItem('timeEntries')) || [];
    let currentDate = new Date();
    let selectedDate = null;
    let selectedProject = null;

    // Elementos do DOM
    const projectNameInput = document.getElementById('project-name');
    const addProjectBtn = document.getElementById('add-project');
    const projectsList = document.getElementById('projects-list');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const currentMonthEl = document.getElementById('current-month');
    const calendarGrid = document.getElementById('calendar-grid');
    const timeModal = document.getElementById('time-modal');
    const timeForm = document.getElementById('time-form');
    const selectedProjectSelect = document.getElementById('selected-project');
    const calcModal = document.getElementById('calc-modal');
    const calcHourBtn = document.getElementById('calc-hour-value');
    const calcProjectBtn = document.getElementById('calc-project-value');
    const resultText = document.getElementById('result-text');

    // Inicialização
    renderProjects();
    renderCalendar();

    // Event Listeners
    addProjectBtn.addEventListener('click', addProject);
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            timeModal.classList.add('hidden');
            calcModal.classList.add('hidden');
        });
    });
    calcHourBtn.addEventListener('click', calculateHourValue);
    calcProjectBtn.addEventListener('click', calculateProjectValue);

    // Funções de Projetos
    function addProject() {
        const name = projectNameInput.value.trim();
        if (name) {
            const project = {
                id: Date.now().toString(),
                name,
                color: getRandomColor()
            };
            projects.push(project);
            saveProjects();
            renderProjects();
            projectNameInput.value = '';
        }
    }

    function renderProjects() {
        projectsList.innerHTML = '';
        projects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = 'project-tag';
            projectEl.innerHTML = `
                ${project.name}
                <button class="remove-project" data-id="${project.id}">×</button>
            `;
            projectsList.appendChild(projectEl);
        });

        // Atualizar select no modal
        selectedProjectSelect.innerHTML = '<option value="">Selecione um projeto</option>';
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            selectedProjectSelect.appendChild(option);
        });

        // Adicionar event listeners para remover projetos
        document.querySelectorAll('.remove-project').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                projects = projects.filter(p => p.id !== id);
                saveProjects();
                renderProjects();
            });
        });
    }

    // Funções do Calendário
    function renderCalendar() {
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        currentMonthEl.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        calendarGrid.innerHTML = '';

        // Cabeçalhos dos dias
        ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Dias do mês
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        // Dias vazios no início
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendarGrid.appendChild(emptyDay);
        }

        // Dias do mês
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            day.textContent = i;
            
            const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
            const hasEntries = timeEntries.some(entry => entry.date === dateStr);
            
            if (hasEntries) {
                day.classList.add('has-hours');
            }
            
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
        timeForm.reset();
        const entriesForDate = timeEntries.filter(entry => entry.date === selectedDate);
        
        if (entriesForDate.length > 0) {
            // Mostrar modal de cálculo se já houver registros
            timeModal.classList.add('hidden');
            showCalcModal(entriesForDate);
        }
    }

    timeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const projectId = selectedProjectSelect.value;
        const hours = parseFloat(document.getElementById('hours-worked').value);
        const description = document.getElementById('work-description').value;
        
        if (projectId && hours) {
            const project = projects.find(p => p.id === projectId);
            
            timeEntries.push({
                id: Date.now().toString(),
                date: selectedDate,
                projectId,
                projectName: project.name,
                hours,
                description
            });
            
            saveTimeEntries();
            timeModal.classList.add('hidden');
            renderCalendar();
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
        calcModal.classList.remove('hidden');
        document.getElementById('calc-result').classList.add('hidden');
        selectedProject = entries[0].projectId;
    }

    function calculateHourValue() {
        const project = projects.find(p => p.id === selectedProject);
        const projectEntries = timeEntries.filter(entry => entry.projectId === selectedProject);
        
        const totalHours = projectEntries.reduce((sum, entry) => sum + entry.hours, 0);
        const totalDays = new Set(projectEntries.map(entry => entry.date)).size;
        
        // Simulando um valor de projeto para cálculo (na prática você pediria esse valor)
        const projectValue = parseFloat(prompt(`Qual o valor total do projeto "${project.name}"?`));
        
        if (projectValue && !isNaN(projectValue)) {
            const hourValue = projectValue / totalHours;
            resultText.textContent = `Seu valor hora no projeto ${project.name} é R$ ${hourValue.toFixed(2)}`;
            document.getElementById('calc-result').classList.remove('hidden');
        }
    }

    function calculateProjectValue() {
        const project = projects.find(p => p.id === selectedProject);
        const projectEntries = timeEntries.filter(entry => entry.projectId === selectedProject);
        
        const totalHours = projectEntries.reduce((sum, entry) => sum + entry.hours, 0);
        const hourValue = parseFloat(prompt(`Qual o valor da sua hora no projeto "${project.name}"?`));
        
        if (hourValue && !isNaN(hourValue)) {
            const projectValue = hourValue * totalHours;
            resultText.textContent = `O valor estimado do projeto ${project.name} é R$ ${projectValue.toFixed(2)}`;
            document.getElementById('calc-result').classList.remove('hidden');
        }
    }

    // Funções Auxiliares
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function getRandomColor() {
        return `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }

    function saveProjects() {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    function saveTimeEntries() {
        localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
    }
});