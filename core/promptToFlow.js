module.exports = async function(prompt) {
    const lower = prompt.toLowerCase();

    if(lower.includes('login')) {
        return {
            url: 'https://www.automationexercise.com/',
            profile: 'full',
            steps: [
                {action: 'goto', value: 'https://www.automationexercise.com/'},
                // {action: 'fill', selector: '#username', value: 'admin'},
                // {action: 'fill', selector: '#password', value: '1234'},
                // {action: 'click', selector: 'button[type="submit"]'},
                // {action: 'waitForSelector', selector: '#dashboard'}
            ]
        };
    }

// fallback default
    return {
        url: 'https://www.automationexercise.com/',
        profile: 'quick',
        steps: [{action: 'goto', value: 'https://www.automationexercise.com/'}]
    };
};