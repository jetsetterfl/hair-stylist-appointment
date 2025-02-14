# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

## Key Features

1. **User Authentication**
   - Separate login for stylists and customers
   - Protected routes based on user roles

2. **Stylist Dashboard**
   - Set availability for specific dates and times
   - View upcoming appointments
   - Manage daily schedule

3. **Customer Booking**
   - Browse available stylists
   - View stylist availability calendar
   - Book appointments with email confirmation

## Documentation

- [Local Development Setup](LOCAL_SETUP.md) - Detailed guide for setting up on your Mac
- [Development Guidelines](DEVELOPMENT.md) - Best practices and development workflow

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
SESSION_SECRET=your_session_secret
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_VERIFIED_SENDER=your_verified_email