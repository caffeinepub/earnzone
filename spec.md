# EarnZone - Earning App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Spin Lucky Draw**: Daily spin wheel where users can spin to win random rupee rewards
- **Watch Reels Earning**: Daily limit of 10 reels; earn 5 rupees per reel watched
- **Walk/Step Earning**: Earn 0.5 rupees per step walked (user manually inputs steps or simulated counter)
- **Earnings Dashboard**: Shows total balance broken down by source (spin, reels, walk)
- **Withdrawal System**: User can request withdrawal to PhonePay (UPI ID) or Bank Account (account number + IFSC)
- **Withdrawal History**: List of past withdrawal requests with status (pending/approved/rejected)
- **User Profile**: Store name, phone number, withdrawal method preferences

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
1. User profile: name, phone, userId
2. Earnings ledger: track earnings by type (spin, reel, walk), timestamp, amount
3. Spin lucky draw: record daily spins, prevent more than 1 spin per day, return random reward (5–50 rupees)
4. Reel watching: track daily reel count per user (max 10), record 5 rupees per reel
5. Walk earning: accept step count input, calculate 0.5 rupees per step, record earning
6. Withdrawal requests: store UPI ID or bank account + IFSC, amount, status (pending/approved/rejected)
7. Balance query: sum all earnings minus approved withdrawals
8. Withdrawal history: list of user's withdrawal requests

### Frontend
1. Bottom navigation: Home, Earn (Spin/Reels/Walk tabs), Wallet, Profile
2. Home screen: current balance summary, quick stats (today's earnings)
3. Earn screen:
   - Spin tab: animated spin wheel, daily spin button, reward popup
   - Reels tab: reel cards (10 slots), watch button per reel, progress tracker
   - Walk tab: step input field, calculate earnings, submit button
4. Wallet screen: total balance, withdrawal form (choose UPI or Bank), withdrawal history list
5. Profile screen: name, phone number fields
