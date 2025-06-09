// Configuration constants and mappings
export const CONFIG = {
    API_URL: '/.netlify/functions/api-proxy',
    SCROLL_THRESHOLD: 300
};

// Stance name mapping from API to in-game names
export const STANCE_NAME_MAPPING = {
    'Magic': 'Magery',
    'Bow': 'Archery',
    'Spear': 'Spear',
    'Sword': 'Sword',
    'Scythe': 'Scythe',
    'Polearm': 'Maul',
    'TwoHanded': 'Axe',
    'Common': 'Fists'
};

// Function to get display name for stance
export function getStanceDisplayName(apiStanceName) {
    return STANCE_NAME_MAPPING[apiStanceName] || apiStanceName;
}