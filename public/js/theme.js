/**
 * Handles theme switching and persistence.
 */
export function initTheme() {
  const themeSwitcher = document.getElementById('themeSwitcher');
  if (!themeSwitcher) return;

  const applyTheme = (theme) => {
    document.body.classList.remove('theme-light', 'theme-dark');
    if (theme !== 'system') {
      document.body.classList.add(`theme-${theme}`);
    }
    
    themeSwitcher.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    localStorage.setItem('magnetize-theme', theme);
  };

  const savedTheme = localStorage.getItem('magnetize-theme') || 'system';
  applyTheme(savedTheme);

  themeSwitcher.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) applyTheme(btn.dataset.theme);
  });
}

/**
 * Checks if the current theme is dark.
 * @returns {boolean} True if dark mode is active.
 */
export function isDarkMode() {
  return document.body.classList.contains('theme-dark') || 
         (!document.body.classList.contains('theme-light') && window.matchMedia('(prefers-color-scheme: dark)').matches);
}
