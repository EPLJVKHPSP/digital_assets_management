from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import telebot

bot_token = 'YOUR-BOT-TOKEN'
chat_id = 'YOUR-CHAT-ID'

url = 'https://app.step.finance/en/dashboard?watching=YOUR-SOLANA-ADFRESS'

options = Options()
options.headless = True  # Run Chrome in headless mode

# Set up of Chrome driver
chromedriver_path = '/Users/mac/Downloads/chromedriver_mac64/chromedriver/'  # Replace with your chromedriver path
service = Service(chromedriver_path)

# Creation of a new Selenium driver instance
driver = webdriver.Chrome(service=service, options=options)

def get_apy():
    # Navigating to the website
    driver.get(url)

    # Waiting for the APY element to be present
    wait = WebDriverWait(driver, 10)
    apy_element = wait.until(EC.presence_of_element_located((By.XPATH, '//*[@id="root"]/section/section/main/div/div[1]/div[6]/div/div/div/div/div[2]/div/div/div/div/div[2]/div/div/div/div/div/div/div/table/tbody/tr/td[3]/div/div[1]/span')))

    # Extracting the APY value
    apy = apy_element.text.strip() if apy_element else "N/A"

    return apy

def send_message(message):
    # Set up Telegram bot
    bot = telebot.TeleBot(bot_token)

    # Sending the message to your Telegram chat
    bot.send_message(chat_id, message)

def main():
    # Getting the current APY
    apy = get_apy()

    # Creating the message to be sent = Use any pool as you want, this one is for example
    message = f"SOL-GMT (Whirlpool)\n(Orca - Solana)\nAPY: {apy}"

    # Sending the message
    send_message(message)

    # Closing the driver
    driver.quit()

if __name__ == '__main__':
    main()