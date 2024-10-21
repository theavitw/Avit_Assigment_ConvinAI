# Expense Sharing Application

A backend service for managing daily expenses shared among users. Users can create expenses, split them based on different methods, generate and download balance sheets.

## About this project and challanges I have faced

- This project is assignment for backend role.
- Followed Best Practices for Node.js and MongoDB.
- Used Postman for testing API endpoints.
- Used JWT for authentication.
- Used json2csv for downloading balance sheet.
- Used bcrypt for password hashing.
- Used REST API for API endpoints.
- Followed architecture design principles.
- No challanges in this project so far.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/) (Make sure it's running locally or provide a remote connection)
- A tool like [Postman](https://www.postman.com/) for testing API endpoints (optional)
- `npm` package manager (comes with Node.js)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/theavitw/Avit_Assigment_ConvinAI.git
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

   4. Start the development server:

   ```bash
   npm run dev
   ```

   5.buld:

   ```bash
   npm run build
   ```

#### The server will run on http://localhost:3000 by default.

### API Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| /login | POST | Login a user |
| /users | POST | Create a new user |
| /users | GET | Get looged in user details (loggin required) |
| /expenses | GET | Get all expenses (loggin required)|
| /expenses | POST | Create a new expense(loggin required) | 
| /expenses/balance-sheet | GET | Get balance sheet of loggedin user (loggin required) |
| /expenses/balance-sheet/download | GET | Download balance sheet of loggedin user (loggin required) |
