// Управление темами
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.html = document.documentElement;
        this.init();
    }

    init() {
        // Проверяем сохранённую тему или системные настройки
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else if (systemPrefersDark) {
            this.setTheme('dark');
        }

        // Обработчик клика на переключатель
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Слушаем изменения системной темы
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    setTheme(theme) {
        this.html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Обновляем мета-тег для мобильных устройств
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = theme === 'dark' ? '#0f172a' : '#ffffff';
        }
        
        // Добавляем плавный переход
        this.html.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Убираем transition после завершения анимации
        setTimeout(() => {
            this.html.style.transition = '';
        }, 300);
    }

    toggleTheme() {
        const currentTheme = this.html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Анимация кнопки
        this.themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.themeToggle.style.transform = '';
        }, 150);
    }

    getCurrentTheme() {
        return this.html.getAttribute('data-theme');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
}); 