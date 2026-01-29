// Система авторизации
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('pdd_users')) || [];
        this.init();
    }

    init() {
        // Проверяем сохранённого пользователя
        const savedUser = localStorage.getItem('pdd_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateUI();
            } catch (e) {
                console.error('Ошибка загрузки пользователя:', e);
                localStorage.removeItem('pdd_current_user');
            }
        }

        // Инициализация форм
        this.initForms();
    }

    initForms() {
        // Элементы форм
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authTabs = document.querySelectorAll('.auth-tab');
        const authClose = document.getElementById('authClose');

        // Переключение между вкладками
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Обработка формы входа
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Обработка формы регистрации
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Обработка выхода
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.handleLogout());
        }

        // Меню пользователя
        const userMenuButton = document.getElementById('userMenuButton');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuButton && userDropdown) {
            userMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.style.display = 
                    userDropdown.style.display === 'block' ? 'none' : 'block';
            });

            // Закрытие меню при клике вне его
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.user-menu')) {
                    userDropdown.style.display = 'none';
                }
            });
        }

        // Закрытие модального окна
        if (authClose) {
            authClose.addEventListener('click', () => {
                this.hideAuthModal();
            });
        }
    }

    switchTab(tabId) {
        // Переключение активной вкладки
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');

        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabId) {
                tab.classList.add('active');
            }
        });

        forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${tabId}Form`) {
                form.classList.add('active');
            }
        });

        // Очистка сообщений
        this.clearMessages();
    }

    handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        if (!username || !password) {
            this.showMessage('Заполните все поля', 'error');
            return;
        }

        const user = this.users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.password === password
        );

        if (user) {
            this.currentUser = user;
            
            // Сохранение сессии
            localStorage.setItem('pdd_current_user', JSON.stringify(user));
            
            if (rememberMe) {
                // Долгосрочное сохранение
                localStorage.setItem('pdd_remember_user', 'true');
            }

            this.showMessage('Вход выполнен успешно!', 'success');
            
            // Обновление интерфейса
            setTimeout(() => {
                this.updateUI();
                this.hideAuthModal();
                
                // Очистка формы
                document.getElementById('loginForm').reset();
                
                // Перезагрузка страницы для обновления контента
                window.location.reload();
            }, 1500);
        } else {
            this.showMessage('Неверное имя пользователя или пароль', 'error');
        }
    }

    handleRegister() {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirm').value;
        const acceptTerms = document.getElementById('acceptTerms').checked;

        // Валидация
        if (!username || !password || !confirmPassword) {
            this.showMessage('Заполните обязательные поля', 'error');
            return;
        }

        if (username.length < 3 || username.length > 20) {
            this.showMessage('Имя пользователя должно быть от 3 до 20 символов', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Пароли не совпадают', 'error');
            return;
        }

        if (!acceptTerms) {
            this.showMessage('Необходимо принять условия использования', 'error');
            return;
        }

        // Проверка существования пользователя
        if (this.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            this.showMessage('Пользователь с таким именем уже существует', 'error');
            return;
        }

        // Создание нового пользователя
        const newUser = {
            id: Date.now(),
            username: username,
            email: email || null,
            password: password,
            created: new Date().toISOString(),
            testResults: [],
            settings: {
                theme: 'light',
                notifications: true
            }
        };

        this.users.push(newUser);
        this.currentUser = newUser;

        // Сохранение в localStorage
        localStorage.setItem('pdd_users', JSON.stringify(this.users));
        localStorage.setItem('pdd_current_user', JSON.stringify(newUser));

        this.showMessage('Регистрация успешна! Добро пожаловать!', 'success');

        // Обновление интерфейса
        setTimeout(() => {
            this.updateUI();
            this.hideAuthModal();
            
            // Очистка формы
            document.getElementById('registerForm').reset();
            
            // Переход на вкладку входа
            this.switchTab('login');
            
            // Перезагрузка страницы
            window.location.reload();
        }, 1500);
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('pdd_current_user');
        
        // Скрытие меню пользователя
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.style.display = 'none';
        }
        
        // Обновление интерфейса
        this.updateUI();
        
        // Перезагрузка страницы
        window.location.reload();
    }

    updateUI() {
        const user = this.currentUser;
        const authSection = document.getElementById('authSection');
        const profileSection = document.getElementById('profileSection');
        const welcomeSection = document.getElementById('welcomeSection');
        const personalSection = document.getElementById('personalSection');
        
        // Обновление глобального UI (через функцию из index.html)
        if (typeof updateAuthUI === 'function') {
            updateAuthUI();
        }
        
        // Обновление данных в dropdown
        if (user) {
            const userAvatar = document.getElementById('userAvatar');
            const dropdownAvatar = document.getElementById('dropdownAvatar');
            const dropdownName = document.getElementById('dropdownName');
            const dropdownEmail = document.getElementById('dropdownEmail');
            
            if (userAvatar) userAvatar.textContent = user.username.charAt(0).toUpperCase();
            if (dropdownAvatar) dropdownAvatar.textContent = user.username.charAt(0).toUpperCase();
            if (dropdownName) dropdownName.textContent = user.username;
            if (dropdownEmail) dropdownEmail.textContent = user.email || 'Email не указан';
        }
    }

    showAuthModal() {
        const modal = document.getElementById('authModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Очистка форм и сообщений
        this.clearMessages();
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        
        // Установка фокуса на первое поле
        setTimeout(() => {
            document.getElementById('loginUsername').focus();
        }, 300);
    }

    hideAuthModal() {
        const modal = document.getElementById('authModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.clearMessages();
    }

    showMessage(text, type) {
        const messageDiv = document.getElementById('authMessage');
        if (!messageDiv) return;
        
        messageDiv.textContent = text;
        messageDiv.className = `auth-message ${type}`;
        
        // Автоматическое скрытие успешных сообщений
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'auth-message';
            }, 3000);
        }
    }

    clearMessages() {
        const messageDiv = document.getElementById('authMessage');
        if (messageDiv) {
            messageDiv.textContent = '';
            messageDiv.className = 'auth-message';
        }
    }

    // Вспомогательные методы
    getUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    saveTestResult(testName, score, totalQuestions, wrongAnswers = []) {
        if (!this.currentUser) return false;

        const result = {
            id: Date.now(),
            testName,
            score,
            totalQuestions,
            wrongAnswers,
            date: new Date().toISOString(),
            percentage: Math.round((score / totalQuestions) * 100)
        };

        // Обновление данных пользователя
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex].testResults.unshift(result);
            this.currentUser = this.users[userIndex];
            
            // Сохранение в localStorage
            localStorage.setItem('pdd_users', JSON.stringify(this.users));
            localStorage.setItem('pdd_current_user', JSON.stringify(this.currentUser));
            
            return true;
        }
        return false;
    }

    getUserResults() {
        return this.currentUser ? this.currentUser.testResults : [];
    }
}

// Создаем глобальный экземпляр
window.authSystem = new AuthSystem();

// Глобальные функции для доступа из HTML
window.showAuthModal = function() {
    window.authSystem.showAuthModal();
};

window.hideAuthModal = function() {
    window.authSystem.hideAuthModal();
};

window.togglePassword = function(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Обновление UI при загрузке
    if (window.authSystem) {
        window.authSystem.updateUI();
    }
    
    // Кнопка входа в шапке
    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.addEventListener('click', () => {
            window.authSystem.showAuthModal();
        });
    }
    
    // Закрытие модального окна при нажатии Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.authSystem.hideAuthModal();
        }
    });
});