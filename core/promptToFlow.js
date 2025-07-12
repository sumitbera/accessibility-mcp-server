module.exports = async function(prompt) {
    const lower = prompt.toLowerCase();

    if(lower.includes('login')) {
        return {
            url: 'https://example.com/login',
            profile: 'full',
            steps: [
                {action: 'goto', value: 'https://example.com/login'},
                {action: 'fill', selector: '#username', value: 'admin'},
                {action: 'fill', selector: '#password', value: '1234'},
                {action: 'click', selector: 'button[type="submit"]'},
                {action: 'waitForSelector', selector: '#dashboard'}
            ]
        };
    }

// fallback default
    return {
        url: 'https://example.com',
        profile: 'quick',
        steps: [{action: 'goto', value: 'https://example.com'}]
    };
};