# SOLO eSIM - Components Reference Guide

## Overview

This guide documents all reusable UI components with usage examples and API documentation.

## Button Component

**File**: `components/Button.tsx`

A versatile button component with multiple variants and sizes.

### Props

```typescript
interface ButtonProps {
  onPress: () => void;              // Required: press handler
  title: string;                    // Required: button text
  variant?: 'primary' | 'secondary' | 'outline';  // Default: primary
  size?: 'sm' | 'md' | 'lg';       // Default: md
  loading?: boolean;               // Shows "Loading..." when true
  disabled?: boolean;              // Disables interactions
  style?: ViewStyle;               // Custom styling
  textStyle?: TextStyle;           // Custom text styling
}
```

### Variants

**Primary** (Black background, white text)
```tsx
<Button title="Buy eSIM" onPress={handleBuy} variant="primary" />
```

**Secondary** (Light gray background, black text)
```tsx
<Button title="Continue" onPress={handleNext} variant="secondary" />
```

**Outline** (White with black border)
```tsx
<Button title="Cancel" onPress={handleCancel} variant="outline" />
```

### Sizes

**Small** (36px height)
```tsx
<Button title="OK" size="sm" onPress={() => {}} />
```

**Medium** (44px height - default)
```tsx
<Button title="Continue" size="md" onPress={() => {}} />
```

**Large** (52px height)
```tsx
<Button title="Order $99.99" size="lg" onPress={handleOrder} />
```

### Examples

```tsx
// Primary action
<Button
  title="Buy eSIM"
  onPress={handlePurchase}
  size="lg"
  variant="primary"
/>

// Loading state
<Button
  title="Processing..."
  onPress={() => {}}
  loading={true}
  disabled={true}
/>

// Outline with custom spacing
<Button
  title="Back"
  onPress={() => router.back()}
  variant="outline"
  style={{ marginTop: 16 }}
/>
```

---

## Card Component

**File**: `components/Card.tsx`

A container component for grouped content with optional shadows.

### Props

```typescript
interface CardProps {
  children: React.ReactNode;         // Required: content
  style?: ViewStyle;                // Custom styling
  shadow?: 'sm' | 'md' | 'lg' | 'none';  // Default: md
  padding?: number;                  // Default: 16px
}
```

### Shadow Options

**Small Shadow** - Subtle depth (1px offset)
```tsx
<Card shadow="sm">
  <Text>Content</Text>
</Card>
```

**Medium Shadow** - Balanced depth (2px offset) - DEFAULT
```tsx
<Card>
  <Text>Content</Text>
</Card>
```

**Large Shadow** - Strong depth (4px offset)
```tsx
<Card shadow="lg">
  <Text>Important content</Text>
</Card>
```

**No Shadow**
```tsx
<Card shadow="none" style={{ backgroundColor: colors.gray[50] }}>
  <Text>Flat design</Text>
</Card>
```

### Examples

```tsx
// Simple card with default styling
<Card>
  <Text style={styles.title}>Order Summary</Text>
  <Text style={styles.subtitle}>$25.99</Text>
</Card>

// Custom padding and shadow
<Card padding={24} shadow="lg">
  <View style={styles.header}>
    <Text style={styles.title}>Featured Deal</Text>
  </View>
</Card>

// Flat card (no shadow)
<Card shadow="none" padding={12}>
  <Text>Inline information</Text>
</Card>

// Fullwidth card with custom background
<Card
  shadow="md"
  style={{
    backgroundColor: colors.black,
    padding: 20
  }}
>
  <Text style={{ color: colors.white }}>Dark card</Text>
</Card>
```

---

## Input Component

**File**: `components/Input.tsx`

Text input field with built-in validation styling.

### Props

```typescript
interface InputProps extends TextInputProps {
  label?: string;              // Optional label text
  error?: string;             // Error message (shows red border)
  icon?: React.ReactNode;     // Optional left icon
  // Plus all standard TextInput props
}
```

### Examples

**Basic Email Input**
```tsx
const [email, setEmail] = useState('');

<Input
  placeholder="your@email.com"
  keyboardType="email-address"
  value={email}
  onChangeText={setEmail}
/>
```

**Search Input with Icon**
```tsx
import { Search } from 'lucide-react-native';

<Input
  placeholder="Search countries..."
  value={searchQuery}
  onChangeText={setSearchQuery}
  icon={<Search size={18} color={colors.gray[600]} />}
/>
```

**Input with Error**
```tsx
const [email, setEmail] = useState('');
const [error, setError] = useState('');

const handleChange = (text) => {
  setEmail(text);
  if (!text.includes('@')) {
    setError('Invalid email');
  } else {
    setError('');
  }
};

<Input
  placeholder="Email"
  value={email}
  onChangeText={handleChange}
  error={error}
/>
```

**Number Input**
```tsx
<Input
  placeholder="Enter amount"
  keyboardType="decimal-pad"
  value={amount}
  onChangeText={setAmount}
/>
```

**Promo Code Input**
```tsx
<Input
  placeholder="Enter promo code"
  value={promoCode}
  onChangeText={setPromoCode}
  style={{ textTransform: 'uppercase' }}
/>
```

---

## LoadingSpinner Component

**File**: `components/LoadingSpinner.tsx`

Centered activity indicator for loading states.

### Props

```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'large';      // Default: large
  color?: string;                // Default: black
}
```

### Examples

**Default Loading Spinner**
```tsx
<LoadingSpinner />
```

**Custom Size and Color**
```tsx
<LoadingSpinner size="small" color={colors.gray[400]} />
```

**In a Container**
```tsx
{loading ? (
  <LoadingSpinner />
) : (
  <CountryList data={countries} />
)}
```

**Full Screen Loading**
```tsx
{isLoading && (
  <View style={{ flex: 1 }}>
    <LoadingSpinner />
  </View>
)}
```

---

## ErrorMessage Component

**File**: `components/ErrorMessage.tsx`

Displays error alerts with red background.

### Props

```typescript
interface ErrorMessageProps {
  message: string;               // Required: error text
  onDismiss?: () => void;       // Optional: dismiss handler
}
```

### Examples

**Simple Error Display**
```tsx
{error && <ErrorMessage message={error} />}
```

**With Dismiss Handler**
```tsx
<ErrorMessage
  message={error}
  onDismiss={() => setError(null)}
/>
```

**In Form**
```tsx
const [error, setError] = useState<string | null>(null);

return (
  <View>
    {error && <ErrorMessage message={error} />}
    <Input placeholder="Email" />
    <Button title="Login" onPress={handleLogin} />
  </View>
);
```

---

## CountryListItem Component

**File**: `components/CountryListItem.tsx`

Individual country row with flag, name, and pricing.

### Props

```typescript
interface CountryListItemProps {
  flag: string;              // Unicode emoji (e.g., "🇺🇸")
  name: string;             // Country name
  price: number;            // Price per GB
  currency: string;         // Currency code
  onPress: () => void;      // Press handler
}
```

### Examples

**Basic Usage in List**
```tsx
{countries.map((country) => (
  <CountryListItem
    key={country.id}
    flag={country.flag}
    name={country.name}
    price={country.pricePerGb}
    currency={country.currency}
    onPress={() => navigateToCountry(country.code)}
  />
))}
```

**In FlatList**
```tsx
<FlatList
  data={countries}
  renderItem={({ item }) => (
    <CountryListItem
      flag={item.flag}
      name={item.name}
      price={item.pricePerGb}
      currency={item.currency}
      onPress={() => handleCountrySelect(item)}
    />
  )}
  keyExtractor={(item) => item.id}
/>
```

---

## TabBar Component

**File**: `components/TabBar.tsx`

Horizontal scrollable tab navigation.

### Props

```typescript
interface TabBarProps {
  tabs: string[];                    // Tab labels
  activeTab: string;                 // Currently active tab
  onTabChange: (tab: string) => void; // Change handler
}
```

### Examples

**Category Tabs**
```tsx
const [activeCategory, setActiveCategory] = useState('Top');
const categories = ['Top', 'Americas', 'Europe', 'Asia'];

<TabBar
  tabs={categories}
  activeTab={activeCategory}
  onTabChange={setActiveCategory}
/>
```

**Support Tabs**
```tsx
const [activeTab, setActiveTab] = useState('Troubleshooting');
const tabs = ['Troubleshooting', 'Installation', 'About eSIM'];

<TabBar
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

{/* Render content based on activeTab */}
```

---

## PricePicker Component

**File**: `components/PricePicker.tsx`

Interactive amount selector with increment controls and presets.

### Props

```typescript
interface PricePickerProps {
  amount: number;                    // Current amount
  onAmountChange: (amount: number) => void;  // Change handler
  presets?: number[];               // Default: [15, 40, 100]
}
```

### Examples

**Basic Price Picker**
```tsx
const [amount, setAmount] = useState(15);

<PricePicker
  amount={amount}
  onAmountChange={setAmount}
/>
```

**Custom Presets**
```tsx
<PricePicker
  amount={amount}
  onAmountChange={setAmount}
  presets={[10, 25, 50, 100]}
/>
```

**In Buy Screen**
```tsx
const [amount, setAmount] = useState(15);

<View>
  <PricePicker amount={amount} onAmountChange={setAmount} />
  <Card>
    <Text>Total: ${amount}</Text>
  </Card>
  <Button title={`Order $${amount}`} onPress={handleOrder} />
</View>
```

---

## CollapsibleFAQ Component

**File**: `components/CollapsibleFAQ.tsx`

Expandable FAQ item with smooth animation.

### Props

```typescript
interface CollapsibleFAQProps {
  title: string;              // Question text
  content: string;           // Answer text
  expanded?: boolean;        // Initially expanded (default: false)
}
```

### Examples

**Single FAQ Item**
```tsx
<CollapsibleFAQ
  title="How do I install an eSIM?"
  content="1. Go to Settings > Mobile Network
2. Select 'Add Cellular Plan'
3. Scan the QR code..."
/>
```

**FAQ List**
```tsx
const faqs = [
  {
    title: 'Is eSIM secure?',
    content: 'Yes, eSIMs use the same...',
  },
  {
    title: 'Can I use multiple eSIMs?',
    content: 'Yes, if your device...',
  },
];

{faqs.map((faq, idx) => (
  <CollapsibleFAQ
    key={idx}
    title={faq.title}
    content={faq.content}
    expanded={idx === 0}  // First item expanded
  />
))}
```

**In Support Screen**
```tsx
<View>
  <TabBar tabs={['Troubleshooting', 'Installation']} />
  {currentFaqs.map((faq, idx) => (
    <CollapsibleFAQ
      key={idx}
      title={faq.title}
      content={faq.content}
    />
  ))}
</View>
```

---

## FeatureCard Component

**File**: `components/FeatureCard.tsx`

Feature promotion card with icon, title, and description.

### Props

```typescript
interface FeatureCardProps {
  icon: React.ReactNode;     // Icon/emoji
  title: string;            // Feature title
  description: string;      // Feature description
}
```

### Examples

**With Emoji Icons**
```tsx
<FeatureCard
  icon={<Text style={{ fontSize: 24 }}>⚡</Text>}
  title="Instant Setup"
  description="Activate in minutes, not hours"
/>
```

**With Lucide Icons**
```tsx
import { Zap } from 'lucide-react-native';

<FeatureCard
  icon={<Zap size={24} color={colors.black} />}
  title="Lightning Fast"
  description="Quick activation and setup"
/>
```

**In Horizontal Scroll**
```tsx
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <FeatureCard
    icon={<Text>⚡</Text>}
    title="Instant"
    description="Quick setup"
  />
  <FeatureCard
    icon={<Text>🌍</Text>}
    title="Global"
    description="170+ countries"
  />
  <FeatureCard
    icon={<Text>💰</Text>}
    title="Affordable"
    description="Best prices"
  />
</ScrollView>
```

---

## Component Composition Examples

### Complete Buy Screen

```tsx
import { View, ScrollView } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { PricePicker } from '@/components/PricePicker';

export default function BuyScreen() {
  const [amount, setAmount] = useState(15);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  return (
    <ScrollView>
      <PricePicker amount={amount} onAmountChange={setAmount} />
      <Input
        placeholder="your@email.com"
        value={email}
        onChangeText={setEmail}
        error={error}
      />
      <Card shadow="md">
        <Text>Total: ${amount}</Text>
      </Card>
      <Button
        title={`Order $${amount}`}
        onPress={handleOrder}
        size="lg"
      />
    </ScrollView>
  );
}
```

### Complete Support Screen

```tsx
import { View, ScrollView } from 'react-native';
import { TabBar } from '@/components/TabBar';
import { CollapsibleFAQ } from '@/components/CollapsibleFAQ';

export default function SupportScreen() {
  const [activeTab, setActiveTab] = useState('Troubleshooting');

  return (
    <ScrollView>
      <TabBar
        tabs={['Troubleshooting', 'Installation', 'About']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {faqs[activeTab].map((faq, idx) => (
        <CollapsibleFAQ
          key={idx}
          title={faq.title}
          content={faq.content}
        />
      ))}
    </ScrollView>
  );
}
```

---

## Styling Components

### Using Theme in Custom Components

```tsx
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing[2],
  },
});
```

---

## Best Practices

1. **Always use theme values** - Don't hardcode colors/spacing
2. **Type props properly** - Use TypeScript interfaces
3. **Handle loading states** - Show feedback to user
4. **Validate inputs** - Show error messages
5. **Keep components small** - Single responsibility
6. **Compose components** - Build screens from components
7. **Use consistent spacing** - Follow 8px scale
8. **Test accessibility** - 44px+ touch targets

---

This reference guide covers all reusable components. For complete implementation details, see `SOLO_IMPLEMENTATION.md`.
