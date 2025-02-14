# Local Development Setup Guide

This guide will help you set up and run the Hair Stylist Appointment Management System on your local Mac machine.

## Prerequisites

1. **Node.js**
   ```bash
   # Using Homebrew
   brew install node@20
   ```

2. **PostgreSQL**
   ```bash
   # Using Homebrew
   brew install postgresql@15
   brew services start postgresql@15
   ```

3. **SendGrid Account**
   - Sign up at [SendGrid](https://signup.sendgrid.com/)
   - Create an API key
   - Verify your sender email address

## Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone <your-repository-url>
   cd hair-stylist-appointments
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up PostgreSQL Database**
   ```bash
   # Create a new database
   createdb hair_stylist_db
   ```

4. **Configure Environment Variables**
   Create a `.env` file in the project root:
   ```env
   # Database
   DATABASE_URL=postgresql://localhost:5432/hair_stylist_db
   PGHOST=localhost
   PGPORT=5432
   PGUSER=your_username
   PGPASSWORD=your_password
   PGDATABASE=hair_stylist_db

   # Session
   SESSION_SECRET=your_session_secret

   # SendGrid
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_VERIFIED_SENDER=your_verified_email
   ```

5. **Push Database Schema**
   ```bash
   npm run db:push
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Access the Application**
   - Open `http://localhost:5000` in your browser
   - Create a stylist account to test the stylist features
   - Create a customer account to test the booking flow

## Testing Email Functionality

1. Make sure your SendGrid API key is correctly set up
2. Verify your sender email in SendGrid dashboard
3. Test the booking flow - you should receive confirmation emails
4. Check SendGrid's Activity Feed for email delivery status

## Common Issues and Solutions

1. **Database Connection Issues**
   - Ensure PostgreSQL is running: `brew services list`
   - Check connection string in `.env`
   - Verify database exists: `psql -l`

2. **Email Not Sending**
   - Verify SendGrid API key
   - Check sender email verification status
   - Look for errors in console logs

3. **Port Already in Use**
   ```bash
   # Find and kill process using port 5000
   lsof -i :5000
   kill -9 <PID>
   ```

## Development Workflow

1. Make changes to the code
2. Server and client will automatically reload
3. Check console for any errors
4. Test the feature you're working on
5. Commit your changes

## Debugging

1. **Server-side Debugging**
   - Check terminal for Express server logs
   - Look for any error messages in red

2. **Client-side Debugging**
   - Open browser dev tools (Command + Option + I)
   - Check Console tab for errors
   - Use Network tab to inspect API calls

3. **Database Debugging**
   - Use `psql` to connect to database:
     ```bash
     psql hair_stylist_db
     ```
   - View tables: `\dt`
   - Inspect schema: `\d table_name`

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test-file.test.ts
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Getting Help

- Check the main README.md for feature documentation
- Refer to DEVELOPMENT.md for coding guidelines
- Consult the original codebase at [repository-url]
- Create an issue for bugs or feature requests

Remember to never commit sensitive information like API keys or passwords to version control.
