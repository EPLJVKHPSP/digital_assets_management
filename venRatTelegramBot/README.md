Venture Rating in Telegram Bot

This documentation outlines the scripts and processes involved in the Venture Rating project, implemented in a Telegram bot. The bot is designed to calculate and display allocation strategies for investment pools using various commands.

Overview of Scripts

	1.pools_data_request.js
	
    Purpose: Fetches and updates pool data from DeFi Lama’s API and recalculates ratings based on pool statistics such as TVL (Total Value Locked) and APY (Annual Percentage Yield).
	
    Dependencies: Requires axios for HTTP requests, fs for file operations, and csv-parse and csv-writer for handling CSV files.
	
    Output: Updates the pools.csv file with recalculated ratings for each pool.

	2.strategy_rating.js
	
    Purpose: Recalculates strategy ratings for each pool based on token tiers and existing pool ratings.
	
    Dependencies: Uses csv-parse/sync for synchronous CSV parsing and csv-writer for writing to CSV files.
	
    Output: Modifies the pools.csv file, adding or updating the strategy rating for each pool.

	3.allocation.py
	
    Purpose: Determines the optimal allocation of funds across various pools, based on the strategy ratings and tiers of the protocols.
	
    Dependencies: Utilizes numpy for numerical operations, pandas for data manipulation, and scipy.optimize for optimization tasks.
	
    Output: Produces an allocation_summary.csv file which provides detailed allocation amounts and weights for each pool, along with ROI information.
	
    /run.py (assumed name for the script managing sequential execution)
	
    Purpose: Orchestrates the running of all scripts (pools_data_request.js, strategy_rating.js, allocation.py) in sequence.
	
    Dependencies: Uses Python’s subprocess for invoking other scripts.
	
    Output: Logs the progress of script executions and any errors encountered.

Telegram Bot Functionality

	/run: Triggers the sequential execution of all scripts to update pool data, recalculate ratings, and determine allocations.
	/show_allocation: Displays the current allocation strategy to the user in a formatted message.
	/change_pools: Allows users to upload new pool data via a CSV file, which will replace the existing pools.csv.
	/allocation : Sets a new total allocation amount which will influence future calculations by the allocation.py script.

How the allocation.py Script Works:


    Data Loading: Loads the pool data from pools.csv and protocol tiers from protocols.csv.
	
    Calculation Logic:
	
    Each pool’s strategy rating is inverted to serve as a risk score.
	
    A risk matrix is constructed and normalized based on these scores.
	
    The script optimizes the allocation of the total investment amount across different pools to minimize risk variance.
	
    Allocation by Protocol Tier:
	
    The total allocation is distributed across protocol tiers (1 to 4), with tier 1 getting the highest allocation percentage and tier 4 the lowest.
	
    Results Compilation:
	
    The allocations are summarized in a CSV file which includes strategic details, protocol information, ROI, and the calculated dollar allocation and weight percentage.

Running the Scripts

Ensure all dependencies are installed and data files (tokens.csv, protocols.csv, pools.csv) are present and correctly formatted. Each script can be run independently for testing, but they are typically executed in sequence by the run.py script as initiated by the Telegram bot.

Updating the Bot and Scripts

The system is designed for modularity and ease of updates. Scripts can be independently updated to adjust calculations or data handling processes as needed. Ensure that the bot’s command handlers are kept in sync with script functionalities and outputs.