import { addons } from '@storybook/manager-api';
import customTheme from './theme';

addons.setConfig({
  theme: customTheme,
  sidebar: {
    showRoots: true,
  },
});

// When DOM is ready, inject footer + GitHub link
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Add footer message with link to Storybook site
    const interval = setInterval(() => {
      const explorerMenu = document.getElementById('storybook-explorer-menu');
      if (explorerMenu && !document.getElementById('storybook-footer')) {
        // Create footer container
        const footer = document.createElement('div');
        footer.id = 'storybook-footer';
        footer.style.marginTop = '20px';
        footer.style.padding = '10px';
        footer.style.textAlign = 'center';
        footer.style.fontSize = '12px';
        footer.style.color = '#999';
        footer.style.borderTop = '1px solid #e6e6e6';

        // Create link to Storybook site
        const link = document.createElement('a');
        link.href = 'https://storybook.js.org/';
        link.target = '_blank';
        link.textContent = 'Storybook';
        link.style.color = '#1EA7FD';
        link.style.textDecoration = 'none';

        // Assemble the footer text with the link
        footer.appendChild(document.createTextNode('Documentation powered by '));
        footer.appendChild(link);

        // Add footer after the explorer menu
        explorerMenu.parentNode.insertBefore(footer, explorerMenu.nextSibling);
        clearInterval(interval);
      }
    }, 300);

    // Add GitHub icon to top bar
    const githubInterval = setInterval(() => {
      const topBar = document.querySelector('[class*="sidebar-header"]');
      if (topBar && !document.getElementById('github-link')) {
        const link = document.createElement('a');
        link.href = 'https://github.com/intrigsoft/react-cron-field';
        link.target = '_blank';
        link.id = 'github-link';
        link.title = 'View on GitHub';
        link.style.marginLeft = 'auto';
        link.style.marginRight = '12px';

        const icon = document.createElement('img');
        icon.src = 'GitHub_Invertocat_Dark.svg';
        icon.alt = 'GitHub';
        icon.width = 20;
        icon.height = 20;
        icon.style.opacity = '0.7';

        link.appendChild(icon);
        topBar.appendChild(link);
        clearInterval(githubInterval);
      }
    }, 300); // Wait until top bar is available
  });
}
