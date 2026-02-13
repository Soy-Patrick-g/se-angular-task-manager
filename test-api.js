const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/tasks',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:');
        console.log(data);
        try {
            const json = JSON.parse(data);
            console.log(`Total Tasks Found: ${json.length}`);
        } catch (e) {
            console.error('Error parsing JSON');
        }
    });
});

req.on('error', (error) => {
    console.error(`Error: ${error.message}`);
});

req.end();
