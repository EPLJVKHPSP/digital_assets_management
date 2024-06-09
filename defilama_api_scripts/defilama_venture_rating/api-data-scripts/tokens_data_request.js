const axios = require('axios');
const fs = require('fs');
const { parse } = require('csv-parse');
const stringify = require('csv-stringify').stringify;
const { DateTime } = require('luxon');

const tokenFile = './data/tokens.csv'; // Ensure this path is correct
const marketDataUrl = 'https://cryptorates.ai/files/full.csv';
const apiBaseUrl = 'https://coins.llama.fi';

async function fetchMarketCap(symbol) {
    try {
        const response = await axios.get(marketDataUrl);
        const records = await parseCSV(response.data);
        const token = records.find(record => record.Symbol === symbol.toUpperCase());
        if (!token) {
            console.log(`Market cap not found for symbol: ${symbol}`);
            return null;
        }
        return parseFloat(token['Market cap']);
    } catch (error) {
        console.error('Error fetching market cap:', error);
        return null;
    }
}

async function getFirstPriceData(contractAddress) {
    const url = `${apiBaseUrl}/prices/first/${contractAddress}`;
    try {
        const response = await axios.get(url);
        if (!response.data || !response.data.coins || !response.data.coins[contractAddress]) {
            console.log(`First price data not found for contract: ${contractAddress}`, response.data);
            return null;
        }
        return response.data.coins[contractAddress];
    } catch (error) {
        console.error('Error fetching first price data:', error);
        return null;
    }
}

function parseCSV(data) {
    return new Promise((resolve, reject) => {
        parse(data, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_column_count: true
        }, (err, output) => {
            if (err) reject(err);
            else resolve(output);
        });
    });
}

function stringifyCSV(data) {
    return new Promise((resolve, reject) => {
        stringify(data, {
            header: true,
            columns: ['Token-Name', 'Token-Contract', 'Rating']
        }, (err, output) => {
            if (err) reject(err);
            else resolve(output);
        });
    });
}

async function updateTokens() {
    console.log("Reading token data from CSV...");
    const input = fs.readFileSync(tokenFile, 'utf8');
    let tokens = await parseCSV(input);
    console.log("CSV with Tokens successfully processed");

    for (const token of tokens) {
        const symbol = token['Token-Name'].trim();
        const contract = token['Token-Contract'].trim();

        console.log(`Updating data for token: ${symbol}`);
        const marketCap = await fetchMarketCap(symbol);
        const priceData = await getFirstPriceData(contract);
        if (!marketCap || !priceData || !priceData.timestamp) {
            console.error(`Invalid data for: ${symbol}`);
            continue;
        }
        const firstTimestamp = priceData.timestamp;
        const daysOfExistence = DateTime.now().diff(DateTime.fromSeconds(firstTimestamp), 'days').days;
        const rating = daysOfExistence * marketCap;

        token.Rating = rating ? rating.toFixed(2) : 'Data Unavailable';
    }

    console.log("Updating tokens ratings in CSV...");
    const csvString = await stringifyCSV(tokens);
    fs.writeFileSync(tokenFile, csvString);
    console.log('Tokens Ratings updated and written to file successfully');
}

module.exports = { updateTokens };  // Export the function