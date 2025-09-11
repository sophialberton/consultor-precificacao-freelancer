document.addEventListener('DOMContentLoaded', () => {
    const themeButtons = document.querySelectorAll('.theme-button');
    const body = document.body;

    const applyTheme = (theme) => {
        body.setAttribute('data-theme', theme);

        // Remove a classe 'active' de todos e adiciona ao botão correto
        themeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === `theme-${theme}`) {
                btn.classList.add('active');
            }
        });
    };

    themeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Impede que o evento se propague para outros elementos
            e.stopPropagation(); 
            const theme = button.id.replace('theme-', '');
            localStorage.setItem('selected-theme', theme);
            applyTheme(theme);
        });
    });

    // Carrega o tema salvo ao iniciar a página
    const savedTheme = localStorage.getItem('selected-theme') || 'light-blue'; // Padrão
    applyTheme(savedTheme);
});