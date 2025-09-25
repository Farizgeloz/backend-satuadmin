'use strict';

const jwt = require('jsonwebtoken');

const verifyToken = async (request, h) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return h.response({ message: 'Token tidak ditemukan' }).code(401).takeover();
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.auth = decoded; // inject ke request
        return h.continue;
    }
    catch (err) {
        return h.response({ message: 'Token tidak valid' }).code(401).takeover();
    }
};

// hanya admin
const isAdmin = async (request, h) => {
    if (request.auth.role !== 'admin') {
        return h.response({ message: 'Akses ditolak: hanya admin' }).code(403).takeover();
    }

    return h.continue;
};

module.exports = { verifyToken, isAdmin };
