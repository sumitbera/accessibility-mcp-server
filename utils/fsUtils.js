const fs = require('fs');
const path = require('path');

/**
 * Ensures that a directory exists. Creates it recursively if it doesn't.
 * @param {string} dirPath
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`[FS] Created directory: ${dirPath}`);
  }
}

/**
 * Clears all files inside a directory, but does not remove the directory itself.
 * @param {string} dirPath
 */
function clearDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const currentPath = path.join(dirPath, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        fs.rmSync(currentPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    console.log(`[FS] Cleared directory: ${dirPath}`);
  }
}

module.exports = {
  ensureDir,
  clearDir
};