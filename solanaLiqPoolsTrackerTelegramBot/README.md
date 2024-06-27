# solana-pools-tracker

Real-time Solana Pool APY Monitoring and Telegram Notification Script

This document details a Python script designed to monitor the Annual Percentage Yield (APY) of a specific liquidity pool on the Solana blockchain using the Step Finance dashboard (app.step.finance) and send notifications via a Telegram Bot. The script serves as an example for the GMT/SOL pool on Orca (orca.so), but users can adjust it to monitor any pool by modifying the URL and relevant identifiers in the script.

Script Purpose

The purpose of this script is to provide liquidity providers on the Solana blockchain with real-time updates on the APY of their investments. By leveraging the Step Finance platform to track APY changes and Telegram for notifications, investors can remain informed about their pool’s performance without needing to manually check the website.

Prerequisites

1.	Python 3 Installation: Ensure Python 3.x is installed on your system.
2.	Selenium and Telebot Libraries: Install these libraries using pip:

pip install selenium pyTelegramBotAPI

3.	ChromeDriver: Download and install ChromeDriver, ensuring it matches your Chrome browser version. Set the path to ChromeDriver in the script.
4.	Telegram Bot: Create a Telegram bot via BotFather on Telegram and obtain the bot token. Set the bot_token and chat_id in the script.
5.	Liquidity Provision: Before using the script, ensure you have provided liquidity to the pool you intend to monitor on Orca and that it is being tracked on the Step Finance dashboard.

Key Components

Selenium WebDriver: Automates a headless Chrome browser to navigate the Step Finance dashboard and scrape the APY value.

XPath Usage: Locates and extracts the APY value from the webpage. The XPath might need adjustment based on the specific elements of the Step Finance dashboard for different pools.

Telegram Notifications: Utilizes the Telebot library to send real-time APY updates to a specified Telegram chat, allowing users to receive updates anywhere and anytime.

Workflow

Setup and Configuration:
Configure the script with your ChromeDriver path, Telegram bot token, and chat ID.
Modify the url variable to point to the specific liquidity pool on Step Finance that you are monitoring.

Execution:

The script navigates to the specified Step Finance URL.
It waits for the APY element to load and then extracts the APY value.
It sends a formatted message with the APY value to the specified Telegram chat.
The browser session is closed to free up resources.

Security and Maintenance

Secure Storage: Ensure that the bot token and chat ID are stored securely and not exposed in shared or public repositories.
Regular Updates: Regularly update the script to accommodate changes in the Step Finance dashboard layout or URL schema changes in Orca pools.
Error Handling: Implement robust error handling to manage potential issues with web scraping or network problems.

Usage Example

To use this script for a different pool:

Change the URL: Update the url variable to match the dashboard URL of your specific pool on Step Finance.
Adjust XPath: Modify the XPath used in the get_apy() function to correctly locate the APY element for the new pool.

This script offers a streamlined way for investors on the Solana blockchain to stay updated on their liquidity pool’s performance through automated monitoring and notifications, enhancing investment management and responsiveness to market changes
