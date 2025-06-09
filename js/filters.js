// Player filtering functionality
import { getStanceDisplayName } from './config.js';
import { extractUsername } from './utils.js';

export class PlayerFilter {
    constructor() {
        this.filteredPlayers = [];
        this.allPlayers = [];
    }

    setPlayers(players) {
        this.allPlayers = players;
    }

    populateStanceFilter(players) {
        const stances = [...new Set(players.map(player => player.build?.stance).filter(Boolean))];
        const stanceFilter = document.getElementById('stance-filter');

        // Clear existing options except "All Stances"
        stanceFilter.innerHTML = '<option value="all">All Stances</option>';

        stances.forEach(stance => {
            const option = document.createElement('option');
            option.value = stance; // Keep API value for filtering
            option.textContent = getStanceDisplayName(stance); // Show display name
            stanceFilter.appendChild(option);
        });
    }

    filterPlayers() {
        if (!this.allPlayers || this.allPlayers.length === 0) return [];

        const searchTerm = document.getElementById('username-search').value.toLowerCase();
        const hardcoreFilter = document.getElementById('hardcore-filter').value;
        const fellowshipFilter = document.getElementById('fellowship-filter').value;
        const stanceFilter = document.getElementById('stance-filter').value;

        this.filteredPlayers = this.allPlayers.filter(player => {
            // Username filter
            const username = extractUsername(player.name);
            if (searchTerm && !username.toLowerCase().includes(searchTerm)) return false;

            // Hardcore filter
            if (hardcoreFilter !== 'all' && player.isHardcore.toString() !== hardcoreFilter) return false;

            // Fellowship filter
            const hasFellowship = player.tag !== undefined && player.tag !== null && player.tag !== '';
            if (fellowshipFilter !== 'all' && hasFellowship.toString() !== fellowshipFilter) return false;

            // Stance filter
            if (stanceFilter !== 'all' && player.build?.stance !== stanceFilter) return false;

            return true;
        });

        return this.filteredPlayers;
    }

    resetFilters() {
        document.getElementById('username-search').value = '';
        document.getElementById('hardcore-filter').value = 'all';
        document.getElementById('fellowship-filter').value = 'all';
        document.getElementById('stance-filter').value = 'all';
        return this.filterPlayers();
    }

    getFilteredPlayers() {
        return this.filteredPlayers;
    }
}