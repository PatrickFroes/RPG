/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // Usando variáveis CSS nas cores
      colors: {
        'rpg': {
          'primary': 'var(--color-primary)',
          'secondary': 'var(--color-secondary)',
          'accent': 'var(--color-accent)',
          'sidebar': 'var(--bg-sidebar)',
          'main': 'var(--bg-main)',
          'card': 'var(--bg-card)',
        },
        'text': {
          'primary': 'var(--text-primary)',
          'secondary': 'var(--text-secondary)',
          'muted': 'var(--text-muted)',
        }
      },
      
      // Usando variáveis CSS em outros valores
      borderRadius: {
        'rpg': 'var(--border-radius)',
      },
      
      spacing: {
        'rpg-sm': 'var(--spacing-sm)',
        'rpg-md': 'var(--spacing-md)',
        'rpg-lg': 'var(--spacing-lg)',
      },
      
      // Filtros customizados
      brightness: {
        'dim': 'var(--brightness-dim)',
        'normal': 'var(--brightness-normal)',
        'bright': 'var(--brightness-bright)',
      }
    }
  },
  plugins: [
    // Plugin para adicionar utilities customizadas
    function({ addUtilities }) {
      const newUtilities = {
        '.theme-sidebar': {
          'background-color': 'var(--bg-sidebar)',
          'color': 'var(--text-primary)',
          'border-radius': 'var(--border-radius)',
        },
        '.theme-button': {
          'background-color': 'var(--color-secondary)',
          'color': 'var(--text-primary)',
          'border-radius': 'var(--border-radius)',
          'transition': 'all 0.3s ease',
        },
        '.theme-button:hover': {
          'filter': 'brightness(var(--brightness-bright))',
        }
      }
      addUtilities(newUtilities)
    }
  ]
}