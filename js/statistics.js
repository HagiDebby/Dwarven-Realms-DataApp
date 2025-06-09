// Statistics calculation and rendering
import { extractUsername } from './utils.js';
import { getStanceDisplayName } from './config.js';

export class StatisticsRenderer {
    generateDataStatistics(players) {
        if (!players || players.length === 0) return;

        const stats = this.calculateStatistics(players);
        this.renderStatistics(stats);
    }

    calculateStatistics(players) {
        // Player counts
        const totalPlayers = players.length;
        const hardcorePlayersCount = players.filter(p => p.isHardcore).length;
        const hardcoreFellowshipPlayersCount = players.filter(p => p.isHardcore && p.tag).length;
        const nonHardcorePlayersCount = players.filter(p => !p.isHardcore).length;
        const nonHardcoreFellowshipPlayersCount = players.filter(p => !p.isHardcore && p.tag).length;

        // Total deaths
        const totalDeaths = players.reduce((sum, p) => sum + parseInt(p.deaths || 0), 0);

        // Death statistics for Softcore players only
        const nonHardcorePlayersForDeaths = players.filter(p => !p.isHardcore);
        let playerWithMostDeaths = null;
        let playerWithLeastDeaths = null;

        if (nonHardcorePlayersForDeaths.length > 0) {
            playerWithMostDeaths = nonHardcorePlayersForDeaths.reduce((max, player) =>
                parseInt(player.deaths || 0) > parseInt(max.deaths || 0) ? player : max
            );

            playerWithLeastDeaths = nonHardcorePlayersForDeaths.reduce((min, player) =>
                parseInt(player.deaths || 0) < parseInt(min.deaths || 0) ? player : min
            );
        }

        // Dungeon statistics
        const dungeonStats = {};
        players.forEach(player => {
            Object.entries(player.dungeons || {}).forEach(([dungeon, count]) => {
                dungeonStats[dungeon] = (dungeonStats[dungeon] || 0) + count;
            });
        });

        // Rupture level records
        const ruptureRecords = this.calculateRuptureRecords(players);

        // Fellowship statistics
        const fellowshipStats = {};
        players.forEach(player => {
            if (player.tag) {
                fellowshipStats[player.tag] = (fellowshipStats[player.tag] || 0) + 1;
            }
        });

        const mostPopularFellowship = Object.entries(fellowshipStats).reduce((max, [fellowship, count]) =>
            count > max.count ? {fellowship, count} : max, {fellowship: 'None', count: 0}
        );

        // Stance statistics
        const stanceStats = {};
        players.forEach(player => {
            const stance = player.build?.stance;
            if (stance) {
                stanceStats[stance] = (stanceStats[stance] || 0) + 1;
            }
        });

        return {
            totalPlayers,
            hardcorePlayersCount,
            hardcoreFellowshipPlayersCount,
            nonHardcorePlayersCount,
            nonHardcoreFellowshipPlayersCount,
            totalDeaths,
            playerWithMostDeaths,
            playerWithLeastDeaths,
            dungeonStats,
            ruptureRecords,
            fellowshipStats,
            mostPopularFellowship,
            stanceStats
        };
    }

    calculateRuptureRecords(players) {
        const hardcorePlayersForRupture = players.filter(p => p.isHardcore);
        const hardcoreFellowshipPlayersForRupture = players.filter(p => p.isHardcore && p.tag);
        const nonHardcorePlayersForRupture = players.filter(p => !p.isHardcore);
        const nonHardcoreFellowshipPlayersForRupture = players.filter(p => !p.isHardcore && p.tag);

        let hardcoreRuptureRecord = { level: 0, player: null };
        let hardcoreFellowshipRuptureRecord = { level: 0, player: null };
        let nonHardcoreRuptureRecord = { level: 0, player: null };
        let nonHardcoreFellowshipRuptureRecord = { level: 0, player: null };

        // Find hardcore record
        if (hardcorePlayersForRupture.length > 0) {
            const topHardcore = hardcorePlayersForRupture.reduce((max, player) =>
                parseInt(player.raptureLevel || 0) > parseInt(max.raptureLevel || 0) ? player : max
            );
            hardcoreRuptureRecord = { level: parseInt(topHardcore.raptureLevel || 0), player: topHardcore };
        }

        // Find hardcore fellowship record
        if (hardcoreFellowshipPlayersForRupture.length > 0) {
            const topHardcoreFellowship = hardcoreFellowshipPlayersForRupture.reduce((max, player) =>
                parseInt(player.raptureLevel || 0) > parseInt(max.raptureLevel || 0) ? player : max
            );
            hardcoreFellowshipRuptureRecord = { level: parseInt(topHardcoreFellowship.raptureLevel || 0), player: topHardcoreFellowship };
        }

        // Find Softcore record
        if (nonHardcorePlayersForRupture.length > 0) {
            const topNonHardcore = nonHardcorePlayersForRupture.reduce((max, player) =>
                parseInt(player.raptureLevel || 0) > parseInt(max.raptureLevel || 0) ? player : max
            );
            nonHardcoreRuptureRecord = { level: parseInt(topNonHardcore.raptureLevel || 0), player: topNonHardcore };
        }

        // Find Softcore fellowship record
        if (nonHardcoreFellowshipPlayersForRupture.length > 0) {
            const topNonHardcoreFellowship = nonHardcoreFellowshipPlayersForRupture.reduce((max, player) =>
                parseInt(player.raptureLevel || 0) > parseInt(max.raptureLevel || 0) ? player : max
            );
            nonHardcoreFellowshipRuptureRecord = { level: parseInt(topNonHardcoreFellowship.raptureLevel || 0), player: topNonHardcoreFellowship };
        }

        return {
            hardcoreRuptureRecord,
            hardcoreFellowshipRuptureRecord,
            nonHardcoreRuptureRecord,
            nonHardcoreFellowshipRuptureRecord
        };
    }

    renderStatistics(stats) {
        const content = document.getElementById('data-content');
        content.innerHTML = `
            <div class="stats-grid">
                ${this.renderPlayerStatistics(stats)}
                ${this.renderDeathStatistics(stats)}
                ${this.renderRuptureStatistics(stats)}
                ${this.renderStanceStatistics(stats)}
                ${this.renderDungeonStatistics(stats)}
                ${this.renderFellowshipStatistics(stats)}
            </div>
        `;
    }

    renderPlayerStatistics(stats) {
        return `
            <div class="stat-card">
                <h3>Player Statistics</h3>
                <div class="stat-items-grid">
                    <div class="stat-item">
                        <div class="stat-item-title">Total Players</div>
                        <div class="stat-item-value">${stats.totalPlayers}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Hardcore</div>
                        <div class="stat-item-value">${stats.hardcorePlayersCount}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Hardcore Fellowship</div>
                        <div class="stat-item-value">${stats.hardcoreFellowshipPlayersCount}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Softcore</div>
                        <div class="stat-item-value">${stats.nonHardcorePlayersCount}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Softcore Fellowship</div>
                        <div class="stat-item-value">${stats.nonHardcoreFellowshipPlayersCount}</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDeathStatistics(stats) {
        return `
            <div class="stat-card">
                <h3>Death Statistics</h3>
                <div class="stat-items-grid">
                    <div class="stat-item">
                        <div class="stat-item-title">Total Deaths</div>
                        <div class="stat-item-value">${stats.totalDeaths}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Average per Player</div>
                        <div class="stat-item-value">${(stats.totalDeaths / stats.totalPlayers).toFixed(1)}</div>
                    </div>
                    ${stats.playerWithMostDeaths ? `
                    <div class="stat-item">
                        <div class="stat-item-title">Most Deaths</div>
                        <div class="stat-item-value">👑 ${extractUsername(stats.playerWithMostDeaths.name)} (${stats.playerWithMostDeaths.deaths})</div>
                    </div>
                    ` : ''}
                    ${stats.playerWithLeastDeaths ? `
                    <div class="stat-item">
                        <div class="stat-item-title">Least Deaths</div>
                        <div class="stat-item-value">👑 ${extractUsername(stats.playerWithLeastDeaths.name)} (${stats.playerWithLeastDeaths.deaths})</div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderRuptureStatistics(stats) {
        const { ruptureRecords } = stats;
        return `
            <div class="stat-card">
                <h3>Highest Rupture Levels</h3>
                <div class="stat-items-grid">
                    <div class="stat-item">
                        <div class="stat-item-title">Hardcore</div>
                        <div class="stat-item-value">
                            ${ruptureRecords.hardcoreRuptureRecord.level}
                            ${ruptureRecords.hardcoreRuptureRecord.player ? `<br><small>${extractUsername(ruptureRecords.hardcoreRuptureRecord.player.name)}</small>` : ''}
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Hardcore Fellowship</div>
                        <div class="stat-item-value">
                            ${ruptureRecords.hardcoreFellowshipRuptureRecord.level}
                            ${ruptureRecords.hardcoreFellowshipRuptureRecord.player ? `<br><small>${extractUsername(ruptureRecords.hardcoreFellowshipRuptureRecord.player.name)}</small>` : ''}
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Softcore</div>
                        <div class="stat-item-value">
                            ${ruptureRecords.nonHardcoreRuptureRecord.level}
                            ${ruptureRecords.nonHardcoreRuptureRecord.player ? `<br><small>${extractUsername(ruptureRecords.nonHardcoreRuptureRecord.player.name)}</small>` : ''}
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Softcore Fellowship</div>
                        <div class="stat-item-value">
                            ${ruptureRecords.nonHardcoreFellowshipRuptureRecord.level}
                            ${ruptureRecords.nonHardcoreFellowshipRuptureRecord.player ? `<br><small>${extractUsername(ruptureRecords.nonHardcoreFellowshipRuptureRecord.player.name)}</small>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStanceStatistics(stats) {
        return `
            <div class="stat-card">
                <h3>Stance Usage</h3>
                <div class="stance-stats-grid">
                    ${Object.entries(stats.stanceStats).sort(([,a], [,b]) => b - a).map(([stance, count]) =>
            `<div class="stat-item">
                            <div class="stat-item-title">${getStanceDisplayName(stance)}</div>
                            <div class="stat-item-value">${count} (${((count / stats.totalPlayers) * 100).toFixed(1)}%)</div>
                        </div>`
        ).join('')}
                </div>
            </div>
        `;
    }

    renderDungeonStatistics(stats) {
        return `
            <div class="stat-card">
                <h3>Dungeon Completions</h3>
                <div class="dungeon-stats-grid">
                    ${Object.entries(stats.dungeonStats).sort(([,a], [,b]) => b - a).map(([dungeon, count]) =>
            `<div class="stat-item">
                            <div class="stat-item-title">${dungeon}</div>
                            <div class="stat-item-value">${count}</div>
                        </div>`
        ).join('')}
                </div>
            </div>
        `;
    }

    renderFellowshipStatistics(stats) {
        return `
            <div class="stat-card">
                <h3>Fellowship Information</h3>
                <div class="fellowship-stats-grid">
                    ${stats.mostPopularFellowship.fellowship !== 'None' ?
            `<div class="stat-item">
                            <div class="stat-item-title">Most Popular</div>
                            <div class="stat-item-value">${stats.mostPopularFellowship.fellowship} (${stats.mostPopularFellowship.count})</div>
                        </div>` : ''
        }
                    ${Object.entries(stats.fellowshipStats).sort(([,a], [,b]) => b - a).map(([fellowship, count]) =>
            `<div class="stat-item">
                            <div class="stat-item-title">${fellowship}</div>
                            <div class="stat-item-value">${count} members</div>
                        </div>`
        ).join('')}
                    ${Object.keys(stats.fellowshipStats).length === 0 ?
            `<div class="stat-item">
                            <div class="stat-item-title">Status</div>
                            <div class="stat-item-value">No fellowships found</div>
                        </div>` : ''
        }
                </div>
            </div>
        `;
    }
}