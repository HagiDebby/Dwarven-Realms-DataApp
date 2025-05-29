let gameData = null;
let filteredPlayers = [];

// API URL with CORS proxy
const API_URL = 'https://cors-anywhere.herokuapp.com/http://loadbalancer-prod-1ac6c83-453346156.us-east-1.elb.amazonaws.com/leaderboards/scores/';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    fetchData();
    setupEventListeners();
    setupBackToTopButton();
});

function setupEventListeners() {
    document.getElementById('username-search').addEventListener('input', filterPlayers);
    document.getElementById('hardcore-filter').addEventListener('change', filterPlayers);
    document.getElementById('fellowship-filter').addEventListener('change', filterPlayers);
    document.getElementById('stance-filter').addEventListener('change', filterPlayers);
}

function setupBackToTopButton() {
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function resetFilters() {
    document.getElementById('username-search').value = '';
    document.getElementById('hardcore-filter').value = 'all';
    document.getElementById('fellowship-filter').value = 'all';
    document.getElementById('stance-filter').value = 'all';
    filterPlayers();
}

// API URL - now points to your Netlify function
const API_URL = '/.netlify/functions/api-proxy';

async function fetchData() {
    try {
        document.getElementById('players-content').innerHTML = '<div class="loading">Loading player data...</div>';
        document.getElementById('data-content').innerHTML = '<div class="loading">Loading statistics...</div>';

        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        gameData = await response.json();
        console.log('Fetched data:', gameData);

        if (gameData && gameData.leaderboards && Array.isArray(gameData.leaderboards)) {
            populateStanceFilter();
            filterPlayers();
            generateDataStatistics();
        } else {
            throw new Error('Invalid data structure received');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('players-content').innerHTML = `<div class="error">Error loading data: ${error.message}<br><small>This may be due to CORS restrictions. The API might be temporarily unavailable.</small></div>`;
        document.getElementById('data-content').innerHTML = `<div class="error">Error loading data: ${error.message}<br><small>This may be due to CORS restrictions. The API might be temporarily unavailable.</small></div>`;
    }
}

function populateStanceFilter() {
    const stances = [...new Set(gameData.leaderboards.map(player => player.build?.stance).filter(Boolean))];
    const stanceFilter = document.getElementById('stance-filter');

    // Clear existing options except "All Stances"
    stanceFilter.innerHTML = '<option value="all">All Stances</option>';

    stances.forEach(stance => {
        const option = document.createElement('option');
        option.value = stance;
        option.textContent = stance;
        stanceFilter.appendChild(option);
    });
}

function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function filterPlayers() {
    if (!gameData || !gameData.leaderboards) return;

    const searchTerm = document.getElementById('username-search').value.toLowerCase();
    const hardcoreFilter = document.getElementById('hardcore-filter').value;
    const fellowshipFilter = document.getElementById('fellowship-filter').value;
    const stanceFilter = document.getElementById('stance-filter').value;

    filteredPlayers = gameData.leaderboards.filter(player => {
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

    renderPlayersTable();
}

function extractUsername(fullName) {
    const parenIndex = fullName.indexOf('(');
    return parenIndex !== -1 ? fullName.substring(0, parenIndex).trim() : fullName;
}

function extractInGameName(fullName) {
    const match = fullName.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
}

function formatAttackName(attackString) {
    if (!attackString) return '';

    const parts = attackString.split('_');
    if (parts.length < 2) return attackString;

    const stance = parts[0];
    const attackName = parts[1];

    // Add spaces before capital letters in the attack name
    const formattedAttack = attackName.replace(/([A-Z])/g, ' $1').trim();

    return `${stance} - ${formattedAttack}`;
}

function renderPlayersTable() {
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
        tableHTML += `
            <tr class="player-row">
                <td>${extractUsername(player.name)}</td>
                <td>${extractInGameName(player.name)}</td>
                <td>${player.level}</td>
                <td>${player.raptureLevel}</td>
                <td>${player.build?.stance || 'N/A'}</td>
                <td><button class="btn" onclick="toggleExpandedContent(${index})">Show More</button></td>
            </tr>
            <tr id="expanded-${index}" class="expanded-content">
                <td colspan="6">
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
                </td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    content.innerHTML = tableHTML;
}

function toggleExpandedContent(index) {
    const expandedRow = document.getElementById(`expanded-${index}`);
    const button = event.target;

    if (expandedRow.classList.contains('show')) {
        expandedRow.classList.remove('show');
        button.textContent = 'Show More';
    } else {
        expandedRow.classList.add('show');
        button.textContent = 'Show Less';
    }
}

function generateDataStatistics() {
    if (!gameData || !gameData.leaderboards) return;

    const players = gameData.leaderboards;

    // Player counts
    const totalPlayers = players.length;
    const hardcorePlayers = players.filter(p => p.isHardcore).length;
    const hardcoreFellowshipPlayers = players.filter(p => p.isHardcore && p.tag).length;
    const nonHardcorePlayers = players.filter(p => !p.isHardcore).length;
    const nonHardcoreFellowshipPlayers = players.filter(p => !p.isHardcore && p.tag).length;

    // Total deaths
    const totalDeaths = players.reduce((sum, p) => sum + parseInt(p.deaths || 0), 0);

    // Dungeon statistics
    const dungeonStats = {};
    players.forEach(player => {
        Object.entries(player.dungeons || {}).forEach(([dungeon, count]) => {
            dungeonStats[dungeon] = (dungeonStats[dungeon] || 0) + count;
        });
    });

    // Highest rupture levels
    const hardcoreRuptures = players.filter(p => p.isHardcore).map(p => parseInt(p.raptureLevel || 0));
    const hardcoreFellowshipRuptures = players.filter(p => p.isHardcore && p.tag).map(p => parseInt(p.raptureLevel || 0));
    const nonHardcoreRuptures = players.filter(p => !p.isHardcore).map(p => parseInt(p.raptureLevel || 0));
    const nonHardcoreFellowshipRuptures = players.filter(p => !p.isHardcore && p.tag).map(p => parseInt(p.raptureLevel || 0));

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

    const mostUsedStance = Object.entries(stanceStats).reduce((max, [stance, count]) =>
        count > max.count ? {stance, count} : max, {stance: 'None', count: 0}
    );

    const stancePercentage = ((mostUsedStance.count / totalPlayers) * 100).toFixed(1);

    // Render statistics
    const content = document.getElementById('data-content');
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Player Statistics</h3>
                <div class="stat-items-grid">
                    <div class="stat-item">
                        <div class="stat-item-title">Total Players</div>
                        <div class="stat-item-value">${totalPlayers}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Hardcore</div>
                        <div class="stat-item-value">${hardcorePlayers}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Hardcore Fellowship</div>
                        <div class="stat-item-value">${hardcoreFellowshipPlayers}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Non-Hardcore</div>
                        <div class="stat-item-value">${nonHardcorePlayers}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Non-Hardcore Fellowship</div>
                        <div class="stat-item-value">${nonHardcoreFellowshipPlayers}</div>
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <h3>Death Statistics</h3>
                <div class="stat-items-grid">
                    <div class="stat-item">
                        <div class="stat-item-title">Total Deaths</div>
                        <div class="stat-item-value">${totalDeaths}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Average per Player</div>
                        <div class="stat-item-value">${(totalDeaths / totalPlayers).toFixed(1)}</div>
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <h3>Highest Rupture Levels</h3>
                <div class="stat-items-grid">
                    <div class="stat-item">
                        <div class="stat-item-title">Hardcore</div>
                        <div class="stat-item-value">${Math.max(...hardcoreRuptures, 0)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Hardcore Fellowship</div>
                        <div class="stat-item-value">${Math.max(...hardcoreFellowshipRuptures, 0)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Non-Hardcore</div>
                        <div class="stat-item-value">${Math.max(...nonHardcoreRuptures, 0)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-title">Non-Hardcore Fellowship</div>
                        <div class="stat-item-value">${Math.max(...nonHardcoreFellowshipRuptures, 0)}</div>
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <h3>Stance Usage</h3>
                <div class="stance-stats-grid">
                    ${Object.entries(stanceStats).sort(([,a], [,b]) => b - a).map(([stance, count]) =>
        `<div class="stat-item">
                            <div class="stat-item-title">${stance}</div>
                            <div class="stat-item-value">${count} (${((count / totalPlayers) * 100).toFixed(1)}%)</div>
                        </div>`
    ).join('')}
                </div>
            </div>
            
            <div class="stat-card">
                <h3>Dungeon Completions</h3>
                <div class="dungeon-stats-grid">
                    ${Object.entries(dungeonStats).sort(([,a], [,b]) => b - a).map(([dungeon, count]) =>
        `<div class="stat-item">
                            <div class="stat-item-title">${dungeon}</div>
                            <div class="stat-item-value">${count}</div>
                        </div>`
    ).join('')}
                </div>
            </div>
            
            <div class="stat-card">
                <h3>Fellowship Information</h3>
                <div class="fellowship-stats-grid">
                    ${mostPopularFellowship.fellowship !== 'None' ?
        `<div class="stat-item">
                            <div class="stat-item-title">Most Popular</div>
                            <div class="stat-item-value">${mostPopularFellowship.fellowship} (${mostPopularFellowship.count})</div>
                        </div>` : ''
    }
                    ${Object.entries(fellowshipStats).sort(([,a], [,b]) => b - a).map(([fellowship, count]) =>
        `<div class="stat-item">
                            <div class="stat-item-title">${fellowship}</div>
                            <div class="stat-item-value">${count} members</div>
                        </div>`
    ).join('')}
                    ${Object.keys(fellowshipStats).length === 0 ?
        `<div class="stat-item">
                            <div class="stat-item-title">Status</div>
                            <div class="stat-item-value">No fellowships found</div>
                        </div>` : ''
    }
                </div>
            </div>
        </div>
    `;
}