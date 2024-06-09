const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const protocolFile = './data/protocols.csv'; // Make sure this path is correct based on where you run your node script from

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
            console.log('CSV with Protocols successfully processed');

            // Fetch and update ratings for all protocols
            for (let protocol of protocols) {
                const rating = await fetchRatingForProtocol(protocol.Protocol);
                protocol.Rating = rating ? rating.toString() : 'Error fetching data';
            }

            // Sort protocols by Rating in descending order before writing to CSV
            protocols.sort((a, b) => (b.Rating === 'Error fetching data' ? -1 : parseFloat(b.Rating)) - (a.Rating === 'Error fetching data' ? -1 : parseFloat(a.Rating)));

            // Write updated data back to CSV
            const csvWriter = createCsvWriter({
                path: protocolFile,
                header: [
                    { id: 'Protocol', title: 'Protocol' },
                    { id: 'Rating', title: 'Rating' },
                    { id: 'Tier', title: 'Tier' }
                ]
            });

            await csvWriter.writeRecords(protocols); // Ensure to await this promise
            console.log('Protocols Ratings updated and written to file successfully');
        });
}

module.exports.updateProtocolsRatings = updateRatings;  // Correctly export the function