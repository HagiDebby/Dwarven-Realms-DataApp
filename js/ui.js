// UI management and event handling
import { CONFIG } from './config.js';
import { scrollToTop } from './utils.js';

export class UIManager {
    constructor() {
        this.setupBackToTopButton();
        this.setupTabSwitching();
    }

    setupBackToTopButton() {
        const backToTopBtn = document.getElementById('back-to-top');

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > CONFIG.SCROLL_THRESHOLD) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        // Add click event listener
        backToTopBtn.addEventListener('click', scrollToTop);
    }

    setupTabSwitching() {
        // Make switchTab function globally available
        window.switchTab = this.switchTab.bind(this);
    }

    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    showLoading() {
        document.getElementById('players-content').innerHTML = '<div class="loading">Loading player data...</div>';
        document.getElementById('data-content').innerHTML = '<div class="loading">Loading statistics...</div>';
    }

    showError(errorMessage) {
        const errorHtml = `<div class="error">Error loading data: ${errorMessage}<br><small>Check if the Netlify function is deployed correctly.</small></div>`;
        document.getElementById('players-content').innerHTML = errorHtml;
        document.getElementById('data-content').innerHTML = errorHtml;
    }
}