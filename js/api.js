// API related functions
import { CONFIG } from './config.js';

export class ApiService {
    constructor() {
        this.gameData = null;
    }

    async fetchData() {
        try {
            const response = await fetch(CONFIG.API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.gameData = await response.json();
            console.log('Fetched data:', this.gameData);

            if (this.gameData && this.gameData.leaderboards && Array.isArray(this.gameData.leaderboards)) {
                return this.gameData;
            } else {
                throw new Error('Invalid data structure received');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    getGameData() {
        return this.gameData;
    }

    getPlayers() {
        return this.gameData?.leaderboards || [];
    }
}