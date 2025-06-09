// Utility functions for data processing
import { getStanceDisplayName } from './config.js';

export function extractUsername(fullName) {
    const parenIndex = fullName.indexOf('(');
    return parenIndex !== -1 ? fullName.substring(0, parenIndex).trim() : fullName;
}

export function extractInGameName(fullName) {
    const match = fullName.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
}

export function formatAttackName(attackString) {
    if (!attackString) return '';

    const parts = attackString.split('_');
    if (parts.length < 2) return attackString;

    const stance = parts[0];
    const attackName = parts[1];

    // Add spaces before capital letters in the attack name
    const formattedAttack = attackName.replace(/([A-Z])/g, ' $1').trim();

    return `${getStanceDisplayName(stance)} - ${formattedAttack}`;
}

export function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}