module.exports = {
    login: [
        {action: 'goto', value: 'https://example.com/login'},
        {action: 'fill', selector: '#username', value: 'admin'},
        {action: 'fill', selector: '#password', value: '1234'},
        {action: 'click', selector: 'button[type="submit"]'},
        {action: 'waitForSelector', selector: '#dashboard'} 
    ],
    home: [
        {action: 'goto', value: 'https://example.com'}
    ]
};