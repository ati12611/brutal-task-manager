// Основной объект приложения
const TaskManager = {
    // Текущий режим (edit/view)
    mode: 'edit',
    
    // Массив задач
    tasks: [],
    
    // Инициализация приложения
    init: function() {
        this.loadTasks();
        this.renderTasks();
        this.setupEventListeners();
        this.updateUI();
        this.generateShareLink();
        
        // Установка текущей даты
        this.setCurrentDate();
    },
    
    // Установка текущей даты в форме
    setCurrentDate: function() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('task-date').value = today;
        document.getElementById('current-date').textContent = this.formatDate(new Date());
    },
    
    // Форматирование даты
    formatDate: function(date) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    },
    
    // Загрузка задач из localStorage
    loadTasks: function() {
        const savedTasks = localStorage.getItem('brutalTasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
    },
    
    // Сохранение задач в localStorage
    saveTasks: function() {
        localStorage.setItem('brutalTasks', JSON.stringify(this.tasks));
        this.generateShareLink();
    },
    
    // Добавление новой задачи
    addTask: function() {
        const dateInput = document.getElementById('task-date');
        const textInput = document.getElementById('task-text');
        
        const date = dateInput.value;
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Введите текст задачи!');
            textInput.focus();
            return;
        }
        
        if (!date) {
            alert('Выберите дату!');
            dateInput.focus();
            return;
        }
        
        const task = {
            id: Date.now(),
            date: date,
            text: text,
            completed: false,
            completedDate: null
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        
        // Очистка поля ввода
        textInput.value = '';
        textInput.focus();
    },
    
    // Переключение статуса задачи
    toggleTask: function(taskId) {
        if (this.mode === 'view') return;
        
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
        this.tasks[taskIndex].completedDate = this.tasks[taskIndex].completed ? 
            new Date().toISOString().split('T')[0] : null;
        
        this.saveTasks();
        this.renderTasks();
    },
    
    // Удаление задачи
    deleteTask: function(taskId) {
        if (this.mode === 'view') return;
        
        if (!confirm('Удалить задачу?')) return;
        
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    },
    
    // Отрисовка всех задач
    renderTasks: function() {
        const container = document.getElementById('tasks-container');
        const emptyState = document.getElementById('empty-state');
        
        if (this.tasks.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        container.innerHTML = this.tasks.map(task => `
            <tr>
                <td class="task-date">${this.formatDate(new Date(task.date))}</td>
                <td class="task-text">${task.text}</td>
                <td>
                    <div class="checkbox-container">
                        <div class="checkbox-custom ${task.completed ? 'checked' : ''}" 
                             onclick="TaskManager.toggleTask(${task.id})">
                            ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                        </div>
                        ${task.completedDate ? 
                            `<span class="done-date">${this.formatDate(new Date(task.completedDate))}</span>` : 
                            ''}
                    </div>
                </td>
                <td>
                    <div class="actions">
                        <button class="btn-action" onclick="TaskManager.toggleTask(${task.id})" 
                                title="${task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}">
                            <i class="fas ${task.completed ? 'fa-rotate-left' : 'fa-check'}"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="TaskManager.deleteTask(${task.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    // Переключение режима просмотра/редактирования
    toggleViewMode: function() {
        this.mode = this.mode === 'edit' ? 'view' : 'edit';
        this.updateUI();
        this.generateShareLink();
        
        // Сохраняем режим в URL
        const url = new URL(window.location);
        if (this.mode === 'view') {
            url.searchParams.set('mode', 'view');
        } else {
            url.searchParams.delete('mode');
        }
        window.history.replaceState({}, '', url);
    },
    
    // Обновление интерфейса в зависимости от режима
    updateUI: function() {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        const toggleButton = document.getElementById('view-mode-toggle');
        const container = document.querySelector('.container');
        
        if (this.mode === 'view') {
            statusIndicator.style.backgroundColor = '#ffa502';
            statusIndicator.style.boxShadow = '0 0 8px #ffa502';
            statusText.textContent = 'Режим просмотра';
            toggleButton.innerHTML = '<i class="fas fa-edit"></i><span>Режим редактирования</span>';
            container.classList.add('view-mode');
        } else {
            statusIndicator.style.backgroundColor = '#00F3FF';
            statusIndicator.style.boxShadow = '0 0 8px #00F3FF';
            statusText.textContent = 'Режим редактирования';
            toggleButton.innerHTML = '<i class="fas fa-eye"></i><span>Режим просмотра</span>';
            container.classList.remove('view-mode');
        }
    },
    
    // Генерация ссылки для общего доступа
    generateShareLink: function() {
        const shareLinkInput = document.getElementById('share-link');
        const baseUrl = window.location.origin + window.location.pathname;
        
        // В реальном приложении здесь бы генерировалась уникальная ссылка
        // Для демо просто добавляем параметр mode=view
        const shareUrl = baseUrl + '?mode=view&v=' + new Date().getTime();
        shareLinkInput.value = shareUrl;
    },
    
    // Копирование ссылки в буфер обмена
    copyShareLink: function() {
        const shareLinkInput = document.getElementById('share-link');
        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999);
        
        try {
            navigator.clipboard.writeText(shareLinkInput.value).then(() => {
                const originalText = document.getElementById('copy-link-btn').innerHTML;
                document.getElementById('copy-link-btn').innerHTML = '<i class="fas fa-check"></i> Скопировано!';
                
                setTimeout(() => {
                    document.getElementById('copy-link-btn').innerHTML = originalText;
                }, 2000);
            });
        } catch (err) {
            // Fallback для старых браузеров
            document.execCommand('copy');
            const originalText = document.getElementById('copy-link-btn').innerHTML;
            document.getElementById('copy-link-btn').innerHTML = '<i class="fas fa-check"></i> Скопировано!';
            
            setTimeout(() => {
                document.getElementById('copy-link-btn').innerHTML = originalText;
            }, 2000);
        }
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Добавление задачи
        document.getElementById('add-task-btn').addEventListener('click', () => this.addTask());
        
        // Добавление по Enter
        document.getElementById('task-text').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // Переключение режима просмотра
        document.getElementById('view-mode-toggle').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleViewMode();
        });
        
        // Копирование ссылки
        document.getElementById('copy-link-btn').addEventListener('click', () => this.copyShareLink());
        
        // Проверка режима из URL при загрузке
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'view') {
            this.mode = 'view';
        }
    }
};

// Инициализация приложения после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    TaskManager.init();
});

// Добавление нескольких демо-задач при первом запуске
if (!localStorage.getItem('brutalTasks') || JSON.parse(localStorage.getItem('brutalTasks')).length === 0) {
    const demoTasks = [
        {
            id: 1,
            date: '2026-02-29',
            text: 'Создать дизайн брутального таск-менеджера',
            completed: true,
            completedDate: '2026-02-28'
        },
        {
            id: 2,
            date: '2026-03-01',
            text: 'Реализовать интерфейс на HTML/CSS/JS',
            completed: true,
            completedDate: '2026-03-01'
        },
        {
            id: 3,
            date: '2026-03-02',
            text: 'Добавить функцию сохранения задач',
            completed: true,
            completedDate: '2026-03-02'
        },
        {
            id: 4,
            date: '2026-03-03',
            text: 'Реализовать режим просмотра для заказчика',
            completed: false,
            completedDate: null
        },
        {
            id: 5,
            date: '2026-03-04',
            text: 'Развернуть приложение на хостинге',
            completed: false,
            completedDate: null
        }
    ];
    
    localStorage.setItem('brutalTasks', JSON.stringify(demoTasks));
    TaskManager.tasks = demoTasks;
}