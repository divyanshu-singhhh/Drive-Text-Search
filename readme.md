# Project Name

## Overview

This application allows you to search the content of your `.txt` files stored in your Google Drive. Once you log in to the app, you can easily search through your text files.

## Running Locally

To run the application locally, follow these steps:

1. **Add Google Credentials**: 
   - Before starting the application, ensure you have added your Google credentials to the `docker-compose.yml` file. This is necessary for the app to access your Google Drive.

2. **Build and Start the Application**:
   - Open your terminal and navigate to the project directory.
   - Run the following command to build and start the application:
     ```bash
     docker-compose up --build
     ```

3. **Access the Application**:
   - Once the application is running, open your web browser and visit `http://localhost:3000`.

## Notes

- Ensure that your Google credentials are correctly configured in the `docker-compose.yml` file to avoid any authentication issues.
- The application is designed to work with `.txt` files stored in your Google Drive.
