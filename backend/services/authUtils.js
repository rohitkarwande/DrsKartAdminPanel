const db = require('../config/db');

// List of recognized valid international country dial codes
const VALID_COUNTRY_CODES = [
    '+91', '+1', '+44', '+971', '+966', '+65', '+61', '+49', '+33', '+81',
    '+880', '+92', '+977', '+94', '+974', '+968', '+965', '+973', '+60', '+63',
    '+27', '+55', '+82', '+7'
];

const maskEmail = (em) => {
    if (!em) return '';
    const [name, domain] = em.split('@');
    if (name.length <= 2) return `${name[0]}*@${domain}`;
    return `${name[0]}${'*'.repeat(Math.max(1, name.length - 2))}${name.slice(-1)}@${domain}`;
};

const maskPhone = (ph) => {
    if (!ph) return '';
    if (ph.length <= 4) return ph;
    return ph.slice(0, 3) + ' ' + '*'.repeat(Math.max(2, ph.length - 7)) + ' ' + ph.slice(-4);
};

const isEmail = (str) => {
    if (!str || typeof str !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
};

const sanitizePhone = (rawPhone, defaultCode = '+91') => {
    if (!rawPhone || typeof rawPhone !== 'string') return null;
    let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, '');
    if (!cleaned) return null;

    if (cleaned.startsWith('00')) {
        cleaned = '+' + cleaned.slice(2);
    }
    if (cleaned.startsWith('+')) {
        return cleaned;
    }
    cleaned = cleaned.replace(/^0+/, '');
    return `${defaultCode}${cleaned}`;
};

const getUserById = async (userId) => {
    const result = await db.query(
        'SELECT id, email, phone, username, role, is_verified, status FROM users WHERE id = $1',
        [userId]
    );
    return result.rows[0] || null;
};

module.exports = {
    VALID_COUNTRY_CODES,
    maskEmail,
    maskPhone,
    isEmail,
    sanitizePhone,
    getUserById
};
