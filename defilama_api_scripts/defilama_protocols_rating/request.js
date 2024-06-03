const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const protocolFile = 'protocols.csv';

async function fetchRatingForProtocol(protocol) {
    const url = `https://api.llama.fi/protocol/${protocol}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        let earliestDate = new Date(data.chainTvls[Object.keys(data.chainTvls)[0]].tvl[0].date * 1000);
        let totalCurrentTVL = Object.values(data.currentChainTvls).reduce((acc, tvl) => acc + Number(tvl), 0);
        let diffDays = Math.ceil((new Date() - earliestDate) / (1000 * 60 * 60 * 24));
        
        return (totalCurrentTVL * diffDays);
    } catch (error) {
        console.error('Error fetching data for:', protocol, error);
        return null;
    }
}

async function updateRatings() {
    let protocols = [];

    // Read existing protocols from CSV
    fs.createReadStream(protocolFile)
        .pipe(csv())
        .on('data', (row) => {
            protocols.push(row);
        })
        .on('end', async () => {
            console.log('CSV file successfully processed');

            // Fetch and update ratings
            for (let protocol of protocols) {
                if (!protocol.Rating || protocol.Rating === '0') {  // Check if rating needs to be updated or calculated
                    const rating = await fetchRatingForProtocol(protocol.Protocol);
                    protocol.Rating = rating ? rating.toString() : 'Error fetching data';
                }
            }

            // Write updated data back to CSV
            const csvWriter = createCsvWriter({
                path: protocolFile,
                header: [
                    { id: 'Protocol', title: 'Protocol' },
                    { id: 'Rating', title: 'Rating' },
                    { id: 'Tier', title: 'Tier' }
                ]
            });

            csvWriter.writeRecords(protocols)
                .then(() => {
                    console.log('Ratings updated and written to file successfully');
                });
        });
}

updateRatings();