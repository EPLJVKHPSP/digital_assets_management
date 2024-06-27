import os
import csv
import subprocess
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackContext

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

async def start(update: Update, context: CallbackContext) -> None:
    await update.message.reply_text(
        'Hi! Use /run to execute scripts, /show_allocation to view the allocation, /change_pools to upload new pool data, or /allocation <amount> to set a new total allocation.')

async def show_allocation(update: Update, context: CallbackContext) -> None:
    """Send a message with the allocation summary."""
    try:
        with open('allocation_summary.csv', newline='') as csvfile:
            reader = csv.reader(csvfile)
            headers = next(reader)  # Skip the header
            table_data = [f"[{index + 1}] {' | '.join(row)}" for index, row in enumerate(reader)]
        formatted_table = " | ".join(headers) + "\n" + "\n" + "\n".join(table_data)
        await update.message.reply_text(formatted_table)
    except Exception as e:
        await update.message.reply_text(f"An error occurred while reading the allocation summary: {str(e)}")

async def run_scripts(update: Update, context: CallbackContext) -> None:
    await update.message.reply_text('Running scripts... Please wait.')
    try:
        # Adding log to verify if the file exists and its last modified time
        pools_path = os.path.join('data', 'pools.csv')
        if os.path.exists(pools_path):
            logging.info(f"{pools_path} last modified at: {os.path.getmtime(pools_path)}")
        
        result = subprocess.run(["python3", "run.py"], capture_output=True, text=True)
        response_message = result.stdout if result.stdout else result.stderr
        await update.message.reply_text(f"Script executed:\n{response_message}")
        await show_allocation(update, context)
    except Exception as e:
        await update.message.reply_text(f"An error occurred: {str(e)}")

async def change_pools(update: Update, context: CallbackContext) -> None:
    """Prompt the user to send a new CSV file to update the pools."""
    await update.message.reply_text('Please upload a new CSV file to update the pools.')

async def handle_document(update: Update, context: CallbackContext) -> None:
    """Handle document uploads and assume it's a CSV."""
    document = update.message.document
    new_file = await context.bot.get_file(document.file_id)
    new_file_path = os.path.join('data', 'pools.csv')

    try:
        await new_file.download_to_drive(custom_path=new_file_path)
        logging.info(f'File downloaded to {new_file_path}')

        # Verify that the file exists and has content
        if os.path.exists(new_file_path):
            logging.info(f'File exists at {new_file_path}')
            if os.path.getsize(new_file_path) > 0:
                logging.info(f'File is not empty and has been successfully written')

                # Log the contents of the downloaded file for verification
                with open(new_file_path, 'r') as file:
                    file_contents = file.read()
                    logging.info(f'Contents of the file:\n{file_contents}')
                
                await update.message.reply_text('Pools updated successfully.')
            else:
                logging.error(f'File is empty after download')
                await update.message.reply_text('File is empty after download.')
        else:
            logging.error(f'File does not exist at {new_file_path} after download')
            await update.message.reply_text('File does not exist after download.')
    except Exception as e:
        logging.error(f'Error downloading file: {str(e)}')
        await update.message.reply_text(f"An error occurred while downloading the file: {str(e)}")

async def set_allocation(update: Update, context: CallbackContext) -> None:
    """Set a new total allocation in allocation.py."""
    try:
        new_allocation = int(context.args[0])
        allocation_file_path = 'allocation.py'

        # Read the existing allocation.py file
        with open(allocation_file_path, 'r') as file:
            lines = file.readlines()

        # Modify the line containing total_allocation
        for i, line in enumerate(lines):
            if 'allocation =' in line:
                lines[i] = f'allocation = {new_allocation}\n'
                break

        # Write the changes back to allocation.py
        with open(allocation_file_path, 'w') as file:
            file.writelines(lines)

        await update.message.reply_text(f'Total allocation set to {new_allocation}.')
    except (IndexError, ValueError):
        await update.message.reply_text('Please provide a valid number for the allocation. Usage: /allocation <amount>')
    except Exception as e:
        logging.error(f'Error setting allocation: {str(e)}')
        await update.message.reply_text(f"An error occurred while setting the allocation: {str(e)}")

def main() -> None:
    app = Application.builder().token('YOUR-BOT-TOKEN').build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("run", run_scripts))
    app.add_handler(CommandHandler("show_allocation", show_allocation))
    app.add_handler(CommandHandler("change_pools", change_pools))
    app.add_handler(CommandHandler("allocation", set_allocation))
    app.add_handler(MessageHandler(filters.Document.ALL, handle_document))  # Handles all document uploads
    app.run_polling()

if __name__ == '__main__':
    main()