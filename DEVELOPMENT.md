# Development Guide

This document provides additional details for developers working on the Hair Stylist Appointment Management System.

## Development Workflow

1. **Database Migrations**
   - We use Drizzle ORM for database management
   - Schema changes are defined in `shared/schema.ts`
   - Use `npm run db:push` to update the database schema
   - Never modify the database schema directly

2. **Authentication Flow**
   - User authentication is handled by Passport.js
   - Passwords are hashed using scrypt with salt
   - Sessions are stored in PostgreSQL
   - Role-based access control for stylists and customers

3. **Email Service**
   - SendGrid is used for sending emails
   - Email templates are defined in `server/email.ts`
   - Requires a verified sender email in SendGrid
   - Confirmation emails are sent automatically after booking

4. **Frontend Development**
   - Components use shadcn/ui + Tailwind CSS
   - State management with TanStack Query
   - Form validation with Zod schemas
   - Protected routes based on user roles

## Common Development Tasks

### Adding a New API Endpoint

1. Define types in `shared/schema.ts`
2. Add storage methods in `server/storage.ts`
3. Add route handler in `server/routes.ts`
4. Add frontend query/mutation in relevant component

### Adding a New Component

1. Create component in `client/src/components`
2. Use shadcn/ui components for consistency
3. Add Tailwind CSS classes for styling
4. Import and use in relevant pages

### Debugging Tips

1. **Backend Issues**
   - Check server logs in the terminal
   - Use console.log for debugging
   - Check database queries using Drizzle's logging
   - Verify environment variables are set

2. **Frontend Issues**
   - Use React Developer Tools
   - Check browser console for errors
   - Use TanStack Query DevTools
   - Verify API responses in Network tab

3. **Database Issues**
   - Check connection string
   - Verify schema migrations
   - Use Drizzle Studio for database inspection
   - Check PostgreSQL logs

4. **Email Issues**
   - Verify SendGrid API key
   - Check sender verification status
   - Look for email sending logs
   - Test email templates

## Testing

1. **Manual Testing Checklist**
   - User registration and login
   - Stylist availability setting
   - Appointment booking flow
   - Email confirmation receipt
   - Role-based access control
   - Form validation
   - Error handling
   - Responsive design

2. **Common Test Cases**
   - Register new user (both stylist and customer)
   - Login with valid/invalid credentials
   - Set availability as stylist
   - Book appointment as customer
   - Verify email confirmations
   - Check calendar updates
   - Test form validations

## Deployment

1. **Prerequisites**
   - PostgreSQL database
   - Node.js environment
   - SendGrid account
   - Environment variables set

2. **Deploy Steps**
   ```bash
   # Install dependencies
   npm install

   # Build frontend
   npm run build

   # Start production server
   npm start
   ```

## Maintenance

1. **Regular Tasks**
   - Update dependencies
   - Monitor error logs
   - Check email delivery rates
   - Database backups
   - Session cleanup

2. **Performance Optimization**
   - Use React.memo for heavy components
   - Implement query caching
   - Optimize database queries
   - Minimize bundle size
