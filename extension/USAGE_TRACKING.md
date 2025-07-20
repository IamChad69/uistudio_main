# Usage Tracking Feature

This document describes the implementation of dynamic usage tracking in the browser extension.

## Overview

The extension now displays real-time credit usage information in the ProfileSettings component, showing:

- Current plan (free/pro)
- Credits used vs total available
- Remaining credits
- Time until credit reset

## Implementation Details

### API Endpoint

- **Location**: `src/app/api/extension/usage/route.ts`
- **Method**: GET
- **Authentication**: Bearer token required
- **Shared Logic**: Uses `getUsageStatusForUser()` with user ID and plan from auth token
- **Response**: JSON with usage data including remaining points, used points, total points, plan name, and reset time

### Extension Components

#### Hook: `useUsage`

- **Location**: `extension/src/hooks/useUsage.ts`
- **Purpose**: Fetches and manages usage data from the API with caching
- **Features**:
  - Automatic data fetching on mount
  - 5-minute cache duration using browser.storage.local
  - Loading and error states
  - Manual refresh capability
  - Force refresh to bypass cache
  - Cache clearing functionality

#### Utility: `formatTimeUntilReset`

- **Location**: `extension/src/utils/formatTime.ts`
- **Purpose**: Formats milliseconds into human-readable duration strings
- **Example**: "2 days, 5 hours" or "3 hours, 30 minutes"

#### Action: `openCreditManagement`

- **Location**: `extension/src/actions/usage.ts`
- **Purpose**: Opens the web app settings page in a new tab for credit management

### Updated Component: ProfileSettings

- **Location**: `extension/src/_components/Settings/_components/ProfileSettings.tsx`
- **Changes**:
  - Replaced hardcoded credit values with dynamic data
  - Added loading and error states
  - Implemented "Manage" button functionality
  - Shows real-time credit usage and reset time
  - Added plan section showing current subscription status
  - Displays upgrade button for free users with crown icon
  - Shows upgrade messaging for free users

## Data Flow

1. **Authentication**: User must be authenticated with a valid token
2. **Cache Check**: Extension checks browser.storage.local for cached usage data (5-minute TTL)
3. **API Call**: If no cache or expired, extension calls `/api/extension/usage` with Bearer token
4. **Server Processing**: 
   - Server verifies token and gets user info with subscription status
   - Uses `getUsageStatusForUser()` with user ID and plan from auth token
   - Automatically determines correct plan limits based on Clerk subscription
5. **Caching**: Usage data is cached in browser.storage.local with timestamp
6. **Response**: Returns usage data including points, plan name, and reset time
7. **Display**: Extension formats and displays the data in the UI

## Error Handling

- **No Token**: Shows "No authentication token found"
- **Invalid Token**: Shows "Invalid or expired token"
- **API Errors**: Shows "Failed to load credits"
- **Network Issues**: Shows appropriate error messages

## Usage Limits

- **Free Plan**: 3 credits per 30 days
- **Pro Plan**: 100 credits per 30 days
- **Reset**: Credits reset every 30 days from first usage

## Future Enhancements

- Real-time updates via WebSocket
- Push notifications for low credits
- Credit purchase flow integration
- Usage analytics and history
