# SOLO eSIM - Implementation Guide

## Project Overview

SOLO eSIM is a production-ready mobile application for purchasing and managing eSIM profiles for international travelers. Built with React Native and Expo, it provides a seamless experience across iOS and Android platforms with a minimalist black and white design aesthetic.

## Architecture Overview

### Technology Stack

- **Frontend Framework**: React Native with Expo
- **Navigation**: Expo Router with tab-based layout
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Email OTP
- **API Integration**: eSIM Access Provider API via secure service layer
- **State Management**: React Context + Hooks
- **Type Safety**: TypeScript with strict checking
- **UI Components**: Custom reusable component library

### Project Structure

```
project/
├── app/
│   ├── (tabs)/              # Tab-based navigation screens
│   │   ├── _layout.tsx      # Tab navigation configuration
│   │   ├── index.tsx        # Home screen with countries
│   │   ├── buy.tsx          # Purchase eSIM flow
│   │   ├── esims.tsx        # My eSIMs management
│   │   ├── support.tsx      # Help and FAQ
│   │   ├── bonus.tsx        # Referral rewards
│   │   └── more.tsx         # Additional menu
│   ├── country/
│   │   └── [code].tsx       # Country detail view
│   ├── login.tsx            # Authentication screen
│   ├── _layout.tsx          # Root layout with routing
│   └── +not-found.tsx       # 404 page
├── components/              # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   ├── CountryListItem.tsx
│   ├── TabBar.tsx
│   ├── PricePicker.tsx
│   ├── CollapsibleFAQ.tsx
│   └── FeatureCard.tsx
├── services/                # Business logic & API
│   ├── supabase.ts          # Supabase client setup
│   ├── auth.ts              # Authentication service
│   └── esimApi.ts           # eSIM Access API wrapper
├── hooks/                   # Custom React hooks
│   ├── useFrameworkReady.ts # Required Expo hook
│   └── useAuth.ts           # Authentication state
├── constants/
│   └── theme.ts             # Design system & tokens
├── types/
│   └── index.ts             # TypeScript definitions
└── package.json
```

## Design System

### Color Palette

- **Black**: `#000000` - Primary text and UI elements
- **White**: `#FFFFFF` - Primary backgrounds
- **Grays**: 50-800 scale for layering and contrast
- **Functional Colors**:
  - Success: `#10B981` - Confirmations
  - Warning: `#F59E0B` - Alerts
  - Error: `#EF4444` - Errors
  - Info: `#3B82F6` - Information

### Typography

- **Font Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)
- **Font Sizes**: xs-4xl scale (12-36px)
- **Line Heights**: 1.2 (tight), 1.5 (normal), 1.75 (relaxed)

### Spacing

8px-based scale: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40px

### Components

All UI components are customizable and follow the design system:

- **Button**: primary, secondary, outline variants with sm/md/lg sizes
- **Card**: Shadow options (sm/md/lg) with customizable padding
- **Input**: Email, text, and number inputs with error states
- **TabBar**: Horizontal scrollable tab navigation
- **PricePicker**: Interactive amount selector with presets
- **CollapsibleFAQ**: Expandable content blocks for help content

## Database Schema

### Tables

#### users
- `id` (uuid, PK) - Auth user ID
- `email` (text, unique) - User email
- `balance` (numeric) - Available credits
- `currency` (text) - Default USD
- `preferences` (jsonb) - Language, notifications settings
- `created_at` (timestamp) - Account creation
- `last_login` (timestamp) - Last login time

#### countries
- `id` (uuid, PK)
- `code` (text, unique) - ISO country code
- `name` (text) - Country name
- `region` (text) - Geographical region
- `flag` (text) - Unicode emoji flag
- `is_top_country` (boolean) - Featured status

#### esim_packages
- `id` (uuid, PK)
- `country_id` (uuid, FK) - Country reference
- `data_amount` (integer) - Data in GB
- `validity_days` (integer) - Package validity
- `price` (numeric) - Price in USD
- `description` (text) - Package details
- `api_package_id` (text) - Provider API ID

#### esims
- `id` (uuid, PK)
- `user_id` (uuid, FK) - Owner
- `country_id` (uuid, FK)
- `package_id` (uuid, FK)
- `iccid` (text, unique) - eSIM identifier
- `activation_code` (text) - Activation PIN
- `qr_code` (text) - QR code data
- `status` (text) - active/inactive/expired
- `data_used` (integer) - GB consumed
- `data_total` (integer) - Total GB
- `expiry_date` (timestamp)

#### orders
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `package_id` (uuid, FK)
- `amount` (numeric) - Total price
- `status` (text) - pending/completed/failed
- `email` (text) - Order email
- `promo_code` (text) - Applied coupon
- `discount` (numeric) - Discount amount

#### referral_codes
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `code` (text, unique) - Referral code
- `bonus_amount` (numeric) - Reward value
- `used_count` (integer) - Number of uses

### Row Level Security (RLS)

All tables have strict RLS policies:
- Users can only access their own data
- Countries and packages are publicly readable
- Orders and eSIMs are user-specific
- Referral codes are user-specific

## Authentication Flow

### Email OTP Login

1. User enters email on login screen
2. System sends OTP via Supabase Auth
3. User verifies 6-digit code
4. User profile is created if new user
5. Authentication session established
6. User redirected to home screen

### Session Management

- OTP tokens expire after 24 hours
- Session stored securely on device
- Automatic logout on token expiration
- Guest mode available without login

## API Integration

### eSIM Access Service (`services/esimApi.ts`)

Secure wrapper around eSIM Access API with:
- Bearer token authentication
- Request/response error handling
- Standardized response format
- Built-in retry mechanism

#### Available Endpoints

```typescript
queryBalance()           // Get account balance
getCountries()          // List available countries
getPackages(code)       // Get packages for country
orderEsimProfile()      // Create new order
queryEsimStatus(iccid)  // Check eSIM status
```

### Error Handling

All API calls return standardized response:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Key Features

### Home Screen
- Logo and tagline display
- Featured benefits cards (scrollable)
- Country search with real-time filtering
- Category tabs for browsing
- Country list with flags and pricing

### Buy Screen
- Interactive price picker with +/- controls
- Quick select preset buttons ($15, $40, $100)
- Promotional code input
- Order summary with taxes
- Final confirmation modal

### My eSIMs
- List of purchased eSIMs
- Data usage progress indicators
- Validity dates and expiration alerts
- Quick actions (view details, renew)
- Status indicators (active/inactive/expired)

### Support
- Three tab sections:
  - **Troubleshooting**: Common issues
  - **Installation**: Setup guides
  - **About eSIM**: General information
- Expandable FAQ blocks
- Search functionality

### Bonus & Referrals
- Display current bonus balance
- Unique referral code with copy/share
- Referral stats and earnings
- How it works explanation

### More Menu
- Links to About Us, Contact, Terms
- Social links and reviews
- Enterprise programs
- Media and press information

## State Management

### Authentication State (`hooks/useAuth.ts`)

```typescript
const { user, loading, error, signUp, verifyOtp, signOut } = useAuth();
```

- Automatically syncs with Supabase Auth
- Handles OTP signup and verification
- Loads user profile on login
- Manages error states

### Component-Level State

Each screen manages its own state with React `useState`:
- Form inputs (email, promo codes)
- UI state (active tabs, expanded sections)
- Loading and error states
- User selections

## Responsive Design

### Mobile-First Approach

- **Bottom Tab Navigation**: 5 tabs for main sections
- **Full-width Cards**: Edge-to-edge layouts
- **Touch-friendly**: 44px+ minimum touch targets
- **Flexible Text**: Responsive typography scaling

### Tablet/Desktop Support

- Can be extended with side navigation
- Landscape orientation handling
- Optimized spacing for larger screens

## Security Considerations

1. **API Keys**: Environment variables for sensitive credentials
2. **RLS Policies**: Database-level access control
3. **Secure Storage**: Sensitive data encrypted on device
4. **OTP Authentication**: No password storage
5. **Token Management**: Automatic refresh and expiration

## Performance Optimizations

1. **Caching**: Countries catalog cached in database
2. **Lazy Loading**: Images and content loaded on demand
3. **FlatList**: Virtualized list rendering for countries
4. **Memoization**: Components memo-ized where needed
5. **Code Splitting**: Automatic via Expo Router

## Testing

### TypeScript Validation
```bash
npm run typecheck
```

### Building
```bash
npm run build:web      # Build for web
npm run dev            # Start dev server (don't run - auto-started)
```

### Type Safety
- Strict TypeScript configuration
- All components typed with Props interfaces
- Centralized type definitions

## Deployment

### Web Build
```bash
npm run build:web
# Output: dist/ directory
```

Build output includes:
- Optimized JavaScript bundle (3.29 MB)
- CSS modules for styling
- Static assets
- HTML entry point

### Environment Configuration

Set in `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_ESIM_ACCESS_API_KEY=your_api_key
```

## Future Enhancements

1. **Push Notifications**: Data usage and expiration alerts
2. **Payment Processing**: Integration with Stripe/local gateways
3. **Offline Support**: Cached eSIM activation codes
4. **Multi-language**: Localization support
5. **Background Sync**: Periodic data usage checks
6. **Analytics**: User behavior tracking
7. **Social Sharing**: Referral link sharing
8. **Device API**: Deep linking to settings

## Troubleshooting

### Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `expo prebuild --clean`

### Type Errors
- Run: `npm run typecheck`
- Check component prop types match expectations

### Runtime Errors
- Check browser console in web version
- Verify Supabase credentials in .env
- Ensure API keys are valid

## File Organization Best Practices

- **Components**: Single responsibility principle
- **Services**: Encapsulated business logic
- **Hooks**: Reusable stateful logic
- **Types**: Centralized type definitions
- **Constants**: Theme and configuration

## Contributing Guidelines

1. Maintain TypeScript strict mode
2. Follow existing code style
3. Use descriptive component names
4. Add proper error handling
5. Keep components focused and small
6. Document complex logic with comments

## Support & Maintenance

For issues or questions:
1. Check SOLO_IMPLEMENTATION.md documentation
2. Review component prop definitions
3. Check Supabase RLS policies
4. Verify API endpoint responses

---

**Status**: Production-ready
**Last Updated**: December 2024
**Version**: 1.0.0
