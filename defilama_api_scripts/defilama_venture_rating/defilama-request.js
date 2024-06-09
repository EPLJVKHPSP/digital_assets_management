const fs = require('fs');
const { parse } = require('csv-parse/sync');
const createCsvSerializer = require('csv-writer').createObjectCsvWriter;
const { updatePoolsRatings } = require('./api-data-scripts/pools_data_request');
const { updateProtocolsRatings } = require('./api-data-scripts/protocols_data_request');
const { updateTokens } = require('./api-data-scripts/tokens_data_request');

async function loadDataFromCSV(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return parse(data, { columns: true, skip_empty_lines: true });
}

async function calculateStrategyRatings() {
    const pools = await loadDataFromCSV('./data/pools.csv');
    const tokens = await loadDataFromCSV('./data/tokens.csv');
    const protocols = await loadDataFromCSV('./data/protocols.csv');

    const tokenRatings = tokens.reduce((acc, token) => {
        acc[token['Token-Name']] = parseFloat(token['Rating']);
        return acc;
    }, {});

    const protocolRatings = protocols.reduce((acc, protocol) => {
        acc[protocol['Protocol']] = parseFloat(protocol['Rating']);
        return acc;
    }, {});

    pools.forEach(pool => {
        const token1Rating = tokenRatings[pool.Token1] || 0;
        const token2Rating = tokenRatings[pool.Token2] || 0;
        const poolRating = parseFloat(pool.Rating) || 0;
        const protocolRating = protocolRatings[pool.Protocol] || 0;
        const roi = parseFloat(pool.ROI) || 0;

        //HERE YOU DEFINE YOUR FORMULA FOR VENTURE RATING CALCULATION
        //IN THIS EXAMPLE IT'S:
        // RATING = ((TOKENS_RATING * PROTOCOL_RATING * ROI_OF_POOL)^(1/3)) * POOL_RATING

        const averageTokenRating = (token1Rating + token2Rating) / 2;
        if (averageTokenRating && poolRating && protocolRating && roi) {
            const baseRating = averageTokenRating * protocolRating * roi;
            const combinedRating = Math.pow(baseRating, 1/3);
            pool.StrategyRating = (combinedRating * poolRating).toFixed(2);
        } else {
            pool.StrategyRating = '';
        }
    });

    // Sort pools by StrategyRating in descending order
    pools.sort((a, b) => parseFloat(b.StrategyRating) - parseFloat(a.StrategyRating));

    const csvWriter = createCsvSerializer({
        path: './data/pools.csv',
        header: [
            { id: 'Token1', title: 'Token1' },
            { id: 'Token2', title: 'Token2' },
            { id: 'Protocol', title: 'Protocol' },
            { id: 'PoolID', title: 'PoolID' },
            { id: 'Rating', title: 'Rating' },
            { id: 'ROI', title: 'ROI' },
            { id: 'StrategyRating', title: 'StrategyRating' }
        ]
    });

    await csvWriter.writeRecords(pools);
    console.log('Pools with Strategy Ratings updated and written to file successfully');
}

async function runUpdates() {
    console.log("Updating pools ratings...");
    await updatePoolsRatings();
    console.log("Updating protocols ratings...");
    await updateProtocolsRatings();
    console.log("Updating tokens data...");
    await updateTokens();
    console.log("Calculating strategy ratings...");
    await calculateStrategyRatings();
    console.log("All updates completed successfully.");
}

runUpdates().catch(error => {
    console.error("An error occurred during updates:", error);
});