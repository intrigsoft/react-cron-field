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
    // Add footer message
    const footerStyle = document.createElement('style');
    footerStyle.textContent = `
      #storybook-explorer-menu::after {
        content: "Documentation powered by Storybook";
        display: block;
        margin-top: 20px;
        padding: 10px;
        text-align: center;
        font-size: 12px;
        color: #999;
        border-top: 1px solid #e6e6e6;
      }
    `;
    document.head.appendChild(footerStyle);

    // Add GitHub icon to top bar
    const interval = setInterval(() => {
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
        icon.src = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
        icon.alt = 'GitHub';
        icon.width = 20;
        icon.height = 20;
        icon.style.opacity = '0.7';

        link.appendChild(icon);
        topBar.appendChild(link);
        clearInterval(interval);
      }
    }, 300); // Wait until top bar is available
  });
}
