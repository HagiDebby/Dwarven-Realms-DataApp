// Main application controller
import { ApiService } from './api.js';
import { PlayerFilter } from './filters.js';
import { PlayerRenderer } from './players.js';
import { StatisticsRenderer } from './statistics.js';
import { UIManager } from './ui.js';

class GameLeaderboardApp {
    constructor() {
        // Initialize services
        this.apiService = new ApiService();
        this.playerFilter = new PlayerFilter();
        this.playerRenderer = new PlayerRenderer();
        this.statisticsRenderer = new StatisticsRenderer();
        this.uiManager = new UIManager();

        // Make instances globally available for HTML onclick handlers
        window.playerRenderer = this.playerRenderer;
        window.gameApp = this;
    }

    async init() {
        this.setupEventListeners();
        await this.fetchData();
    }

    setupEventListeners() {
        // Filter event listeners
        document.getElementById('username-search').addEventListener('input', () => this.handleFilterChange());
        document.getElementById('hardcore-filter').addEventListener('change', () => this.handleFilterChange());
        document.getElementById('fellowship-filter').addEventListener('change', () => this.handleFilterChange());
        document.getElementById('stance-filter').addEventListener('change', () => this.handleFilterChange());

        // Button event listeners
        document.addEventListener('click', (e) => {
            if (e.target.matches('.refresh-btn')) {
                this.fetchData();
            }
            if (e.target.matches('.reset-filters-btn')) {
                this.resetFilters();
            }
        });
    }

    async fetchData() {
        try {
            this.uiManager.showLoading();

            const gameData = await this.apiService.fetchData();
            const players = this.apiService.getPlayers();

            // Set up filters and render initial data
            this.playerFilter.setPlayers(players);
            this.playerFilter.populateStanceFilter(players);

            // Render players and statistics
            this.handleFilterChange();
            this.statisticsRenderer.generateDataStatistics(players);

        } catch (error) {
            console.error('Error in fetchData:', error);
            this.uiManager.showError(error.message);
        }
    }

    handleFilterChange() {
        const filteredPlayers = this.playerFilter.filterPlayers();
        this.playerRenderer.renderPlayersTable(filteredPlayers);
    }

    resetFilters() {
        const filteredPlayers = this.playerFilter.resetFilters();
        this.playerRenderer.renderPlayersTable(filteredPlayers);
    }
}

// Global functions for HTML onclick handlers
window.fetchData = function() {
    window.gameApp.fetchData();
};

window.resetFilters = function() {
    window.gameApp.resetFilters();
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const app = new GameLeaderboardApp();
    app.init();
});