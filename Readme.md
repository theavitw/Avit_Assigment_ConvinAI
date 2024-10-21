# Expense Sharing Application

A backend service for managing daily expenses shared among users. Users can create expenses, split them based on different methods, generate and download balance sheets.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/) (Make sure it's running locally or provide a remote connection)
- A tool like [Postman](https://www.postman.com/) for testing API endpoints (optional)
- `npm` package manager (comes with Node.js)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/expense-sharing-app.git
   cd expense-sharing-app.
   ```
2. Install dependencies:

   ```bash
   npm install
   ```

   3. Create a .env file in the root directory with the following content:

   ```bash
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

   4. Start the server:

   ```bash
   npm start
   ```
# The server will run on http://localhost:3000 by default.

### API Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| /login | POST | Login a user |
| /users | POST | Create a new user |
| /users | GET | Get all users |
| /expenses | GET | Get all expenses |
| /expenses | POST | Create a new expense |
| /expenses/balance-sheet | GET | Get balance sheet |
| /expenses/balance-sheet/download | GET | Download balance sheet |