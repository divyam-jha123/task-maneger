// Task management app with Supabase integration
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.loading = false;
        this.init();
    }

    init() {
        // Get DOM elements
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');

        // Event listeners
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks();
            });
        });

        // Load tasks from Supabase
        this.loadTasks();
    }

    showLoading() {
        this.loading = true;
        this.loadingIndicator.classList.remove('hidden');
        this.addBtn.disabled = true;
    }

    hideLoading() {
        this.loading = false;
        this.loadingIndicator.classList.add('hidden');
        this.addBtn.disabled = false;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
        setTimeout(() => {
            this.errorMessage.classList.add('hidden');
        }, 5000);
    }

    async loadTasks() {
        try {
            this.showLoading();
            
            if (!window.supabase) {
                throw new Error('Supabase client not initialized');
            }
            
            const { data, error } = await window.supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            this.tasks = data || [];
            this.renderTasks();
        } catch (error) {
            console.error('Error loading tasks:', error);
            let errorMessage = 'Failed to load tasks. ';
            
            if (error.message && error.message.includes('relation "tasks" does not exist')) {
                errorMessage += 'The tasks table does not exist. Please run the setup.sql script in your Supabase SQL Editor.';
            } else if (error.message && error.message.includes('JWT')) {
                errorMessage += 'Invalid Supabase credentials. Please check your ANON_KEY in config.js.';
            } else if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += 'Please check your Supabase configuration.';
            }
            
            this.showError(errorMessage);
        } finally {
            this.hideLoading();
        }
    }

    async addTask() {
        const taskText = this.taskInput.value.trim();
        if (taskText === '') {
            this.taskInput.focus();
            return;
        }

        try {
            this.showLoading();
            const { data, error } = await window.supabase
                .from('tasks')
                .insert([
                    {
                        text: taskText,
                        completed: false
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            this.tasks.unshift(data);
            this.taskInput.value = '';
            this.taskInput.focus();
            this.renderTasks();
        } catch (error) {
            console.error('Error adding task:', error);
            let errorMessage = 'Failed to add task. ';
            if (error.message) {
                errorMessage += error.message;
            }
            this.showError(errorMessage);
        } finally {
            this.hideLoading();
        }
    }

    async toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newCompletedState = !task.completed;

        try {
            const { error } = await window.supabase
                .from('tasks')
                .update({ completed: newCompletedState })
                .eq('id', id);

            if (error) throw error;

            task.completed = newCompletedState;
            this.renderTasks();
        } catch (error) {
            console.error('Error updating task:', error);
            this.showError('Failed to update task. Please try again.');
        }
    }

    async deleteTask(id) {
        try {
            const { error } = await window.supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.tasks = this.tasks.filter(t => t.id !== id);
            this.renderTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showError('Failed to delete task. Please try again.');
        }
    }

    async clearCompleted() {
        const completedTasks = this.tasks.filter(t => t.completed);
        if (completedTasks.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)) {
            return;
        }

        try {
            this.showLoading();
            const completedIds = completedTasks.map(t => t.id);
            
            const { error } = await window.supabase
                .from('tasks')
                .delete()
                .in('id', completedIds);

            if (error) throw error;

            this.tasks = this.tasks.filter(t => !t.completed);
            this.renderTasks();
        } catch (error) {
            console.error('Error clearing completed tasks:', error);
            this.showError('Failed to clear completed tasks. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = '<li class="empty-state">No tasks found. Add one above!</li>';
        } else {
            this.taskList.innerHTML = filteredTasks.map(task => `
                <li class="task-item ${task.completed ? 'completed' : ''}">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                        onchange="todoApp.toggleTask(${task.id})"
                    />
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <button class="delete-btn" onclick="todoApp.deleteTask(${task.id})">Delete</button>
                </li>
            `).join('');
        }

        this.updateTaskCount();
    }

    updateTaskCount() {
        const activeTasks = this.tasks.filter(t => !t.completed).length;
        const totalTasks = this.tasks.length;
        
        if (this.currentFilter === 'all') {
            this.taskCount.textContent = `${activeTasks} of ${totalTasks} tasks remaining`;
        } else if (this.currentFilter === 'active') {
            this.taskCount.textContent = `${activeTasks} active task${activeTasks !== 1 ? 's' : ''}`;
        } else {
            const completedTasks = this.tasks.filter(t => t.completed).length;
            this.taskCount.textContent = `${completedTasks} completed task${completedTasks !== 1 ? 's' : ''}`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Supabase to be initialized
    function initApp() {
        // Check if Supabase is configured
        if (typeof window.supabase === 'undefined' || !window.SUPABASE_URL || window.SUPABASE_URL === 'YOUR_SUPABASE_URL') {
            // Retry after a short delay if Supabase isn't ready yet
            if (typeof supabase !== 'undefined' && window.SUPABASE_URL && window.SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
                setTimeout(initApp, 100);
                return;
            }
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Please configure Supabase credentials in config.js (add your ANON_KEY)';
            document.querySelector('.todo-app').insertBefore(errorDiv, document.querySelector('.input-section'));
            return;
        }
        
        window.todoApp = new TodoApp();
        
        // Set up real-time subscriptions
        window.supabase
            .channel('tasks')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'tasks' },
                (payload) => {
                    console.log('Real-time update:', payload);
                    if (window.todoApp) {
                        window.todoApp.loadTasks();
                    }
                }
            )
            .subscribe();
    }
    
    initApp();
});

