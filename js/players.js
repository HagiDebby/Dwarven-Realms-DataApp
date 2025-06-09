// Player table rendering and management
import { extractUsername, extractInGameName, formatAttackName } from './utils.js';
import { getStanceDisplayName } from './config.js';

export class PlayerRenderer {
    constructor() {
        this.currentExpandedIndex = -1;
    }

    renderPlayersTable(filteredPlayers) {
        const content = document.getElementById('players-content');

        if (filteredPlayers.length === 0) {
            content.innerHTML = '<div class="error">No players found matching the current filters.</div>';
            return;
        }

        let tableHTML = `
            <table class="players-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>In-Game Name</th>
                        <th>Level</th>
                        <th>Max Rupture</th>
                        <th>Stance</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        filteredPlayers.forEach((player, index) => {
            tableHTML += this.renderPlayerRow(player, index);
        });

        tableHTML += '</tbody></table>';
        content.innerHTML = tableHTML;
    }

    renderPlayerRow(player, index) {
        return `
            <tr class="player-row">
                <td>${extractUsername(player.name)}</td>
                <td>${extractInGameName(player.name)}</td>
                <td>${player.level}</td>
                <td>${player.raptureLevel}</td>
                <td>${getStanceDisplayName(player.build?.stance) || 'N/A'}</td>
                <td><button class="btn" onclick="window.playerRenderer.toggleExpandedContent(${index})">Show More</button></td>
            </tr>
            <tr id="expanded-${index}" class="expanded-content">
                <td colspan="6">
                    ${this.renderExpandedContent(player)}
                </td>
            </tr>
        `;
    }

    renderExpandedContent(player) {
        return `
            <div class="player-details-grid">
                <div class="player-detail-card">
                    <h4>Attacks</h4>
                    <div class="detail-items-grid">
                        <div class="detail-item">
                            <div class="detail-item-title">Primary</div>
                            <div class="detail-item-value">${formatAttackName(player.build?.attacks?.primary)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-item-title">Secondary</div>
                            <div class="detail-item-value">${formatAttackName(player.build?.attacks?.secondary)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="player-detail-card">
                    <h4>Player Stats</h4>
                    <div class="detail-items-grid">
                        <div class="detail-item">
                            <div class="detail-item-title">Deaths</div>
                            <div class="detail-item-value">${player.deaths}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-item-title">Hardcore</div>
                            <div class="detail-item-value">${player.isHardcore ? 'Yes' : 'No'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-item-title">Fellowship</div>
                            <div class="detail-item-value">${player.tag || 'None'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-item-title">Current Zone</div>
                            <div class="detail-item-value">${player.zone || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-item-title">Online</div>
                            <div class="detail-item-value">${player.isOnline ? 'Yes' : 'No'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="player-detail-card equipment-card">
                    <h4>Equipment Mods</h4>
                    <div class="equipment-items-grid">
                        ${Object.entries(player.build?.equipmentMods || {}).map(([slot, mod]) =>
            mod ? `<div class="detail-item">
                                <div class="detail-item-title">${slot}</div>
                                <div class="detail-item-value equipment-mod">${mod}</div>
                            </div>` : ''
        ).join('')}
                    </div>
                </div>
                
                <div class="player-detail-card dungeons-card">
                    <h4>Dungeons Completed</h4>
                    <div class="dungeon-items-grid">
                        ${Object.entries(player.dungeons || {}).map(([dungeon, count]) =>
            `<div class="detail-item">
                                <div class="detail-item-title">${dungeon}</div>
                                <div class="detail-item-value">${count}</div>
                            </div>`
        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    toggleExpandedContent(index) {
        const expandedRow = document.getElementById(`expanded-${index}`);
        const button = event.target;

        if (expandedRow.classList.contains('show')) {
            expandedRow.classList.remove('show');
            button.textContent = 'Show More';
            this.currentExpandedIndex = -1;
        } else {
            // Close any currently open expanded content
            if (this.currentExpandedIndex >= 0) {
                const prevExpanded = document.getElementById(`expanded-${this.currentExpandedIndex}`);
                if (prevExpanded) {
                    prevExpanded.classList.remove('show');
                    const prevButton = prevExpanded.previousElementSibling.querySelector('.btn');
                    if (prevButton) prevButton.textContent = 'Show More';
                }
            }

            expandedRow.classList.add('show');
            button.textContent = 'Show Less';
            this.currentExpandedIndex = index;
        }
    }
}