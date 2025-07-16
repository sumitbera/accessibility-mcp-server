const fs = require('fs-extra');
const path = require('path');

function ensureDir(dirPath) {
    try {
        fs.ensureDirSync(dirPath);
    } catch (err) {
        console.error(`[FS] Failed to ensure directory ${dirPath}`, err.message);
    }
}

function clearDir(dirPath) {
    try {
        if (fs.existsSync(dirPath)) {
            fs.removeSync(dirPath); // Remove the entire folder
        }
        fs.ensureDirSync(dirPath); // Recreate after clean
    } catch (err) {
        console.error(`[FS] Failed to clear directory ${dirPath}`, err.message);
    }
}

module.exports = { ensureDir, clearDir };
