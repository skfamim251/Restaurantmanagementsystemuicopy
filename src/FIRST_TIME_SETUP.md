# First-Time Setup Guide

## Overview
RestaurantOS now includes an intelligent first-time setup flow that solves the "bootstrap problem" - allowing you to create the initial owner account securely.

## How It Works

### First User (Owner Creation)
1. **System Detection**: When you first access the signup page, the system automatically checks if any owner accounts exist in the database.

2. **Special Setup Mode**: If NO owners exist, the signup page enters "First-Time Setup" mode:
   - A special badge appears: "✨ First-Time Setup - Create Your Owner Account"
   - The signup form shows a highlighted message explaining this is the first account
   - The button text changes to "Create Owner Account"
   - The account will be created with **Owner** role automatically

3. **Owner Account Created**: After the first owner signs up:
   - They get full access to all features
   - They can use the "Invite User" button to create additional staff and owner accounts
   - The system is now fully operational

### Subsequent Users (Secure Mode)
4. **Security Locked**: After the first owner exists:
   - All public signups automatically create **Customer** accounts only
   - The signup page shows: "Signing up as a Customer. Staff and Owner accounts can only be created by existing owners."
   - Only existing owners can create staff/owner accounts via the "Invite User" feature

## Features

### Backend Security
- **Automatic Detection**: `/auth/needs-setup` endpoint checks if any owners exist
- **Conditional Role Assignment**: Signup endpoint only allows owner creation when no owners exist
- **Fail-Safe**: If the check fails, defaults to secure mode (customer-only signups)

### User Experience
- **Visual Indicators**: Sparkles icon and highlighted messages for first-time setup
- **Clear Communication**: Users always know what role they're creating
- **Seamless Transition**: After first owner, system automatically switches to secure mode

## Usage

### Creating Your First Owner Account
1. Open RestaurantOS (production mode)
2. Click "Sign Up" tab
3. You'll see the "First-Time Setup" message
4. Enter your details:
   - Full Name
   - Email
   - Password
   - Confirm Password
5. Click "Create Owner Account"
6. You're now logged in as the owner!

### Creating Additional Accounts
After the first owner exists:
- **Customers**: Anyone can sign up publicly (gets customer role)
- **Staff/Owners**: Use "Invite User" button in Owner Dashboard

## Demo Mode
In demo mode, the first-time setup check is skipped, and you can use the demo login buttons to test all three roles immediately.

## Security Notes
- First-time setup only works when **zero** owner accounts exist
- After the first owner is created, the window closes permanently
- All public signups after that point create customer accounts only
- Staff/owner accounts require authentication and authorization
- The system is designed to fail-safe: if in doubt, it creates a customer account

## Troubleshooting

**Q: What if I accidentally create a customer account first?**
A: Contact your system administrator to manually promote the account to owner, or create a new owner account through the database.

**Q: How do I test first-time setup again?**
A: You would need to delete all users from the Supabase Auth database (only do this in development).

**Q: Can I have multiple owners?**
A: Yes! After the first owner is created, they can invite additional owner accounts using the "Invite User" feature.

## Summary
This first-time setup flow provides a secure and user-friendly way to bootstrap your RestaurantOS instance while maintaining strong security for all subsequent account creation.
