const { Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

function getAllJsFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(file => {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllJsFiles(path.join(dirPath, file), arrayOfFiles);
        } else if (file.endsWith('.js')) {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });

    return arrayOfFiles;
}

function loadCollection(client, folderType) {
    folderType = folderType.toLowerCase();
    if (!client[folderType]) client[folderType] = new Collection();
    const dir = path.join(__dirname, '..', folderType);

    if (!fs.existsSync(dir)) {
        console.error(`[ERROR] Directory does not exist: ${dir}`);
        return;
    }

    const dirFiles = getAllJsFiles(dir);
    for (const file of dirFiles) {
        try {
            const folderData = require(file);
            client[folderType].set(folderData.name, folderData);
        } catch (err) {
            console.error(`[WARNING] Error loading ${folderType} at ${file}: ${err}`)
        }
    }
}

module.exports = { loadCollection }