var {writeFileSync, readFile} = require('fs');

readFile('quotes.json', (err, data) => {
    writeFileSync('quotes.b64', data.toString('base64'));
});
