require('dotenv').config();
const express = require('express');
const router = require('./router');
const CFonts = require('cfonts');
const ora = require('ora').default;
const boxen = require('boxen').default;
const { version } = require('../package.json');
const {author} = require('../package.json');
const app = express();
app.use(express.json());
app.use(require('cors')());
app.use('/accessibility', router);

// Fallback route
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

// Typing effect for a string
function typeWriter(text, speed = 50) {
    return new Promise(resolve => {
        let i = 0;
        const interval = setInterval(() => {
            process.stdout.write(text.charAt(i));
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                process.stdout.write('\n');
                resolve();
            }
        }, speed);
    });
}

// Boot progress bar
async function bootSequence() {
    const tasks = [
        'Loading Playwright Engine...',
        'Loading Axe-core Accessibility Modules...',
        'Initializing MCP Server...',
        'Finalizing MCP Environment...'
    ];

    for (let i = 0; i < tasks.length; i++) {
        const bar = `[${'#'.repeat(i + 1)}${' '.repeat(tasks.length - i - 1)}]`;
        process.stdout.write(`\r${bar} ${tasks[i]}`);
        await new Promise(resolve => setTimeout(resolve, 700)); // Delay between steps
        console.log();
    }
}

async function startServer() {
    const spinner = ora('Starting MCP A11Y Engine...').start();
    await new Promise(resolve => setTimeout(resolve, 1200));
    spinner.succeed('MCP A11Y Engine initialized.');

    await bootSequence();

    await typeWriter(`🚀 Launching MCP A11Y Server...\n`, 70);

    CFonts.say('A11Y MCP SERVER', {
        font: 'block',
        align: 'center',
        colors: ['white', 'white'],
        background: 'transparent',
        letterSpacing: 1,
        lineHeight: 1,
        space: true,
        maxLength: '0'
    });

    // Build status info block
    const buildDate = new Date().toLocaleString();
    const statusBox = boxen(
        `Version      : v${version}\nServer Author: ${author}\nBuild Date   : ${buildDate}\nEnvironment  : ${process.env.NODE_ENV || 'Local Dev'}`,
        { padding: 1, borderColor: 'cyan', borderStyle: 'round', align: 'left' }
    );
    console.log(statusBox);

    console.log(`🔥 MCP A11Y Server v${version} is running at http://localhost:${PORT}`);
}

app.listen(PORT, () => {
    startServer();
});
