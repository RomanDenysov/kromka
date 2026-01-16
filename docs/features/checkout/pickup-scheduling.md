# Pickup Scheduling

The checkout system enforces several layers of date/time validation to ensure customers can only select valid pickup slots. All logic lives in `src/features/checkout/utils.ts`.

## Date Validation Layers

A pickup date must pass **all** of these checks to be selectable:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Is Date Valid for Pickup?                    │
├─────────────────────────────────────────────────────────────────┤
│  1. Not in the past (before today)                        ✓/✗   │
│  2. Not today (same-day pickup not supported)             ✓/✗   │
│  3. Not tomorrow if past cutoff (12:00)                   ✓/✗   │
│  4. Within 30-day booking window                          ✓/✗   │
│  5. Store is open (not closed in schedule)                ✓/✗   │
│  6. Allowed by cart restrictions (category pickup dates)  ✓/✗   │
└─────────────────────────────────────────────────────────────────┘
          All checks must pass │ Any failure = date disabled
```

## Daily Cutoff Rule

Orders must be placed **before 12:00 (noon)** to be eligible for next-day pickup.

| Order Time | Earliest Pickup |
|------------|-----------------|
| Before 12:00 | Tomorrow |
| After 12:00 | Day after tomorrow |

```typescript
// src/features/checkout/utils.ts
const ORDER_CUTOFF_HOUR = 12;

function isBeforeDailyCutoff(): boolean {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(ORDER_CUTOFF_HOUR, 0, 0, 0);
  return isBefore(now, cutoff);
}
```

## Store Schedule Structure

Each store has an `openingHours` field of type `StoreSchedule`:

```typescript
type TimeRange = { start: string; end: string }; // e.g., { start: "08:00", end: "18:00" }
type DaySchedule = TimeRange | "closed" | null;

type StoreSchedule = {
  regularHours: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
  exceptions?: {
    [dateKey: string]: TimeRange | "closed" | null; // e.g., "2026-12-25": "closed"
  };
};
```

### Resolution Order

1. Check `exceptions[yyyy-MM-dd]` first (holidays, special hours)
2. Fall back to `regularHours[dayOfWeek]`

### Example: Holiday Schedule

```typescript
{
  regularHours: {
    monday: { start: "08:00", end: "18:00" },
    tuesday: { start: "08:00", end: "18:00" },
    wednesday: { start: "08:00", end: "18:00" },
    thursday: { start: "08:00", end: "18:00" },
    friday: { start: "08:00", end: "18:00" },
    saturday: "closed",
    sunday: "closed"
  },
  exceptions: {
    "2026-12-25": "closed",                        // Christmas Day
    "2026-12-26": "closed",                        // Boxing Day
    "2026-12-24": { start: "08:00", end: "14:00" } // Christmas Eve early close
  }
}
```

## Category-Based Pickup Date Restrictions

Products can belong to categories with restricted pickup dates (e.g., fresh bread only available Tue/Thu/Sat). When multiple restricted products are in the cart, only the **intersection** of allowed dates is available.

```typescript
// Category schema includes optional pickupDates array
type Category = {
  id: string;
  name: string;
  pickupDates?: string[]; // ["2026-01-15", "2026-01-17", "2026-01-19"]
};
```

### Intersection Logic

```
Cart Items:
  - Croissant (category: "Fresh Pastry", pickupDates: [Wed, Fri, Sun])
  - Sourdough (category: "Bread", pickupDates: [Tue, Thu, Sat])
  - Coffee (category: "Drinks", pickupDates: null) ← no restriction

Result: No common dates → "No available dates" error shown
```

```typescript
// src/features/checkout/utils.ts
function getRestrictedPickupDates(cartItems: DetailedCartItem[]): Set<string> | null {
  const restrictedSets: Set<string>[] = [];

  for (const item of cartItems) {
    const pickupDates = item.category?.pickupDates;
    if (pickupDates && pickupDates.length > 0) {
      restrictedSets.push(new Set(pickupDates));
    }
  }

  if (restrictedSets.length === 0) {
    return null; // No restrictions from any item
  }

  // Intersect all restricted sets
  let result = restrictedSets[0];
  for (const nextSet of restrictedSets.slice(1)) {
    result = new Set([...result].filter((date) => nextSet.has(date)));
  }
  return result;
}
```

## Time Slot Generation

Time slots are generated in 30-minute intervals within the store's operating hours for the selected date.

```typescript
const INTERVAL_MINUTES = 30;
const SLOTS_PER_DAY = (24 * 60) / INTERVAL_MINUTES; // 48 slots

// Generates: ["00:00", "00:30", "01:00", ..., "23:30"]
function generateAllTimeSlots(): string[] {
  return Array.from({ length: SLOTS_PER_DAY }, (_, i) => {
    const hour = Math.floor((i * INTERVAL_MINUTES) / 60).toString().padStart(2, "0");
    const minute = ((i * INTERVAL_MINUTES) % 60).toString().padStart(2, "0");
    return `${hour}:${minute}`;
  });
}

// Filter to store hours: { start: "08:00", end: "18:00" } → ["08:00", "08:30", ..., "17:30"]
function filterTimeSlots(allSlots: string[], range: TimeRange): string[] {
  const startMinutes = parseTimeToMinutes(range.start);
  const endMinutes = parseTimeToMinutes(range.end);

  return allSlots.filter((slot) => {
    const slotMinutes = parseTimeToMinutes(slot);
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  });
}
```

## Form State Coordination

The `useCheckoutForm` hook manages cascading updates when store or date selection changes.

### Store Selection Changed

```
Store Selection Changed
        │
        ▼
┌───────────────────────────┐
│ Find first available date │ ← Considers: store schedule + cart restrictions
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│ Set pickupDate in form    │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│ Get time range for date   │ ← From store schedule (regularHours or exception)
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│ Set first available time  │ ← e.g., "08:00" (store opening)
└───────────────────────────┘
```

### Date Selection Changed

```
Date Selection Changed
        │
        ▼
┌───────────────────────────┐
│ Get time range for date   │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│ Set first available time  │
└───────────────────────────┘
```

## Edge Cases & Alerts

| Scenario | UI Behavior |
|----------|-------------|
| No available dates (cart restrictions conflict) | Alert shown, submit disabled |
| Store has restricted dates for cart items | Info alert about limited dates |
| Store closed on all visible calendar days | Calendar shows all days disabled |
| Past cutoff, no dates in next 30 days | Submit disabled |

## Functions Reference

| Function | Purpose |
|----------|---------|
| `isBeforeDailyCutoff()` | Check if current time is before 12:00 |
| `isStoreClosed(date, schedule)` | Check if store is closed on a specific date |
| `isValidPickupDate(date, schedule, restrictions)` | Full validation (all 6 checks) |
| `getFirstAvailableDateWithRestrictions(schedule, restrictions)` | Find earliest valid pickup date |
| `getTimeRangeForDate(date, schedule)` | Get store hours for a specific date |
| `getFirstAvailableTime(timeRange)` | Get first time slot (store opening) |
| `filterTimeSlots(slots, range)` | Filter time slots to store hours |
| `getRestrictedPickupDates(cartItems)` | Compute intersection of category restrictions |
