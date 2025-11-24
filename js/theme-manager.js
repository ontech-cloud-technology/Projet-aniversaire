/**
 * Gestionnaire de thème (Mode sombre/clair)
 * Gère le basculement entre mode sombre et clair avec sauvegarde des préférences
 */

class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'dark';
        this.init();
    }

    init() {
        // Appliquer le thème au chargement
        this.applyTheme(this.currentTheme);
        
        // Créer le toggle button si nécessaire
        this.createToggleButton();
    }

    getStoredTheme() {
        return localStorage.getItem('theme') || 'dark';
    }

    setStoredTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.setStoredTheme(theme);
        
        // Mettre à jour les styles CSS selon le thème
        this.updateCSSVariables(theme);
        
        // Mettre à jour l'icône du toggle si elle existe
        this.updateToggleIcon();
    }

    updateCSSVariables(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            // Mode clair
            root.style.setProperty('--bg-dark', '#f5f5f5');
            root.style.setProperty('--bg-light', '#ffffff');
            root.style.setProperty('--text-primary', '#1a0f30');
            root.style.setProperty('--text-secondary', '#4a5568');
            root.style.setProperty('--border-color', '#e2e8f0');
            root.style.setProperty('--card-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)');
        } else {
            // Mode sombre (par défaut)
            root.style.setProperty('--bg-dark', '#1a0f30');
            root.style.setProperty('--bg-light', '#2c1a4b');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#a0aec0');
            root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
            root.style.setProperty('--card-shadow', '0 4px 6px rgba(0, 0, 0, 0.2)');
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }

    createToggleButton() {
        // Vérifier si le bouton existe déjà
        if (document.getElementById('themeToggle')) {
            return;
        }

        // Créer le bouton toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'themeToggle';
        toggleBtn.className = 'fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-primary hover:bg-opacity-90 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110';
        toggleBtn.setAttribute('aria-label', 'Basculer le thème');
        toggleBtn.onclick = () => this.toggleTheme();
        
        // Ajouter l'icône
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', this.currentTheme === 'dark' ? 'sun' : 'moon');
        toggleBtn.appendChild(icon);
        
        // Ajouter au body
        document.body.appendChild(toggleBtn);
        
        // Initialiser les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        const toggleBtn = document.getElementById('themeToggle');
        if (!toggleBtn) return;
        
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', this.currentTheme === 'dark' ? 'sun' : 'moon');
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
}

// Initialiser le gestionnaire de thème au chargement
let themeManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        themeManager = new ThemeManager();
    });
} else {
    themeManager = new ThemeManager();
}

// Exposer globalement pour utilisation dans d'autres scripts
window.themeManager = themeManager;



