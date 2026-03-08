const https = require('https');

const urls = [
    'https://images.unsplash.com/photo-1593642532400-2682810df593',
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5',
    'https://images.unsplash.com/photo-1512756290469-c0bf33635848',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
    'https://images.unsplash.com/photo-1456513083981-9b5bd1ceba07',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794',
    'https://images.unsplash.com/photo-1457449987-b6a71e4eb41f',
    'https://images.unsplash.com/photo-1450630043513-3ef24ecdf4d3',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ae71',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    'https://images.unsplash.com/photo-1507679622114-c10ba35c24e0',
    'https://images.unsplash.com/photo-1554774853-719586f86d7c',
    'https://images.unsplash.com/photo-1518770660439-4636190af475',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1564860700810-7b243b71bf1b',
    'https://images.unsplash.com/photo-1561070791368-74c07d391f1b',
    'https://images.unsplash.com/photo-1502239608882-93d72921dc80',
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f316cb',
    'https://images.unsplash.com/photo-1460518451285-9790b142e25f',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    'https://images.unsplash.com/photo-1561070791206-8b2098656722',
    'https://images.unsplash.com/photo-1432888117246-cdfd37218d10',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    'https://images.unsplash.com/photo-1542744094-4cea2607f0f6',
    'https://images.unsplash.com/photo-1434626881859-194d678d8a57',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc'
];

async function checkUrl(url) {
    return new Promise((resolve) => {
        https.request(url + '?w=400&q=80', { method: 'HEAD' }, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve({ url, ok: true });
            } else {
                resolve({ url, ok: false, status: res.statusCode });
            }
        }).on('error', () => resolve({ url, ok: false })).end();
    });
}

async function run() {
    console.log('Checking images...');
    const results = await Promise.all(urls.map(checkUrl));
    results.filter(r => !r.ok).forEach(r => console.log('FAILED:', r.url));
    console.log('Done checking images.');
}
run();
