# AirVoucher Cashier Application Overview

## Table of Contents
- [Overview](#overview)
- [Pages](#pages)
- [Components](#components)
- [Actions](#actions)
- [Contexts](#contexts)
- [Hooks](#hooks)
- [Features](#features)
- [State Management](#state-management)
- [UI/UX](#uiux)

## Overview
AirVoucher Cashier is a Point of Sale (POS) application designed for cashiers to manage and process voucher sales. The application provides a modern, user-friendly interface for handling various types of vouchers, including mobile airtime, bill payments, and other services.

## Pages

### Cashier POS (`src/pages/cashier/index.tsx`)
The main cashier interface that handles:
- Voucher sales
- Bill payments
- Admin functions
- Account management
- Sales history

## Components

### Cashier Components
- `TopNavBar`: Main navigation bar for the cashier interface
- `POSGrid`: Grid layout for displaying voucher categories
- `POSValuesGrid`: Grid for displaying voucher values within a category
- `AdminOptionsGrid`: Grid for admin-related options
- `BillPaymentsGrid`: Grid for bill payment options
- `QuickActionFooter`: Footer with quick action buttons
- `SalesHistoryScreen`: Screen for viewing sales history
- `AccountBalanceScreen`: Screen for viewing account balance

### Dialog Components
- `ConfirmSaleDialog`: Dialog for confirming voucher sales
- `SuccessToast`: Toast notification for successful sales
- `SaleReceiptDialog`: Dialog for displaying sale receipts

### Utility Components
- `ConfettiOverlay`: Celebration animation overlay

## Actions
Located in `src/actions`:
- `fetchCashierTerminal`: Retrieves terminal information
- `fetchAvailableVoucherTypes`: Gets available voucher types
- `fetchVoucherInventoryByType`: Retrieves inventory for specific voucher type
- `fetchRetailerCommissionData`: Gets commission data for sales
- `sellVoucher`: Processes voucher sales

## Contexts

### Terminal Context (`src/contexts/TerminalContext`)
Manages terminal-related state:
- Terminal information
- Balance information
- Balance updates after sales
- Terminal loading states

## Hooks

### Custom Hooks
- `useRequireRole`: Role-based access control hook
- `useTerminal`: Hook for accessing terminal context

## Features

### Voucher Management
- Multiple voucher categories:
  - Mobile Networks (Vodacom, MTN, CellC, Telkom)
  - Other Services (OTT, Betting, Ringa, Easyload, etc.)
  - Bill Payments
- Real-time inventory tracking
- Commission calculation
- Sales history tracking

### Admin Functions
- Account balance viewing
- Sales history access
- Terminal management

### Bill Payments
- Support for various bill payment services
- Integration with payment providers

### Security
- Role-based access control
- Secure transaction processing
- Error handling and validation

## State Management

### Local State
- Terminal/cashier data
- Voucher inventory
- Sale process state
- UI state (dialogs, toasts, etc.)
- Admin and bill payment states

### Context State
- Terminal information
- Balance information
- Loading states

## UI/UX

### Design Features
- Modern POS-style interface
- Responsive grid layouts
- Interactive feedback (confetti, toasts)
- Clear navigation structure
- Loading states and error handling

### Visual Elements
- Custom icons for different services
- Brand-specific logos and colors
- Consistent color scheme
- Responsive design elements

### User Experience
- Intuitive category navigation
- Clear sale confirmation process
- Detailed receipt generation
- Real-time balance updates
- Comprehensive error feedback

## Technical Stack
- React
- TypeScript
- Framer Motion (animations)
- Tailwind CSS (styling)
- Custom hooks and contexts
- RESTful API integration

## Security Features
- Role-based authentication
- Secure API calls
- Error boundary implementation
- Data validation
- Secure state management

## Performance Considerations
- Memoized calculations
- Optimized re-renders
- Efficient state updates
- Lazy loading of components
- Error boundary implementation 