# AlgoRise Design System - Codeforces-like Minimal Design

## Philosophy

**Every pixel should have a function.** No decorative elements. If you can remove something and the UX doesn't suffer, remove it.

This design system follows Codeforces' DNA: minimal, purposeful, and fast.

## Color Palette

### Primary Colors (5-6 Maximum)

#### Light Mode
- **Background**: `#ffffff` - Pure white
- **Surface**: `#f5f5f5` - Light gray cards
- **Text**: `#1a1a1a` - Near black
- **Accent**: `#3b82f6` - Blue (primary interactive color)
- **Gray**: `#999999` - Disabled/inactive elements

#### Dark Mode (Primary - for late night coding)
- **Background**: `#0f0f0f` - Near black (reduces eye fatigue)
- **Surface**: `#1a1a1a` - Dark gray cards (subtle contrast)
- **Text**: `#f5f5f5` - Soft white (easier on eyes)
- **Accent**: `#3b82f6` - Blue (same across both themes)
- **Gray**: `#999999` - Disabled/inactive elements

### Semantic Colors (Competitive Programming Standard)

These colors have universal meaning in CP platforms:

- **Green** (`#22c55e`): ✓ Accepted, Correct, Success, Go
- **Red** (`#ef4444`): ✗ Wrong Answer, Failed, Error, Stop
- **Orange** (`#f59e0b`): ⚠ Pending, Time Limit Approaching, Caution
- **Blue** (`#3b82f6`): ℹ Information, Primary Action, Clickable
- **Purple** (`#8b5cf6`): ★ Achievement, Badge, Special Status
- **Gray** (`#999999`): ○ Disabled, Inactive, Not Attempted

**Color-blind Consideration**: Never use color alone. Always combine with icons + text.

## Typography

### Hierarchy (Clear and Noticeable)

```css
/* Headings */
H1: 24px, bold          /* Page titles */
H2: 20px, semibold      /* Section headings */
H3: 18px, semibold      /* Subsection headings */

/* Body Text */
Body: 16px, regular     /* Main content */
Small: 14px, regular    /* Captions */
Metadata: 12px, regular /* Timestamps, hints */
```

### Line Height
- **Body text**: 1.5x (readability)
- **Headings**: 1.2x (compact)

### Font Family
- **Sans**: Inter or system fonts (for speed - no custom font loading)
- **Mono**: JetBrains Mono or system monospace (for code)

## Spacing Scale

Consistent spacing everywhere:

```
xs:  4px   - Minor gaps between small elements
sm:  8px   - Padding inside buttons
md:  12px  - Spacing between elements
lg:  16px  - Padding inside cards
xl:  24px  - Spacing between major sections
2xl: 32px  - Top/bottom padding on pages
```

**Pro Tip**: If a design looks off but you can't pinpoint why, it's usually spacing. Too tight = claustrophobic. Too loose = disconnected.

## Interaction States

Every interactive element needs clear states:

### Button States

```css
/* Primary Button (Blue) */
Normal:   #3b82f6
Hover:    #2563eb (darker)
Active:   #1d4ed8 (even darker)
Disabled: #d1d5db (gray)
```

### Card States

```css
Normal: #1a1a1a (dark mode) / #f5f5f5 (light mode)
Hover:  Slightly lighter/darker (very subtle)
```

### Text Links

```css
Normal:  #3b82f6 (blue)
Hover:   Underline + darker (#2563eb)
Visited: #7c3aed (purple)
```

### Focus State
All interactive elements must have a clear focus ring for keyboard navigation:
```css
outline: 2px solid var(--ring);
outline-offset: 2px;
```

## Animations

**Minimal animations - only for clarity, not decoration.**

### Allowed Animations
1. **Hover effects**: 200ms transition (fast, responsive)
2. **Modal open/close**: 300ms (smooth but not slow)
3. **Toast notifications**: Fade in 300ms, auto-dismiss in 4s
4. **Loading spinners**: Subtle rotation (calming, not anxious)

### Forbidden Animations
- ❌ Bounce effects
- ❌ Slide-in staggered children
- ❌ Gradient animations
- ❌ Glow effects
- ❌ 3D transforms
- ❌ Parallax
- ❌ Any animation longer than 400ms

## Navigation Architecture

### Top Navigation (Desktop)
```
[Logo + Home]  [Search Bar]  [Theme Toggle]  [User Profile/Auth]
```

### Left Sidebar (Desktop Only - Sticky)
```
Battle Arena
Practice Problems
Contests
Leaderboards
My Courses / Learning Paths
Settings
```

### Mobile Navigation
- Hamburger menu that slides from left
- No sticky sidebar on mobile

### Active State Indicator
- Highlight active page in sidebar
- Show breadcrumb: "Home > Battle Arena > 1v1"

## Component Examples

### Card Component

```tsx
// Minimal card - no shadows, simple border
<div className="bg-card border border-border rounded-lg p-lg">
  <h3 className="text-xl font-semibold mb-md">Problem Title</h3>
  <p className="text-base text-muted-foreground">Description...</p>
</div>
```

### Button Component

```tsx
// Primary button
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-md
                   hover:bg-primary-hover active:bg-primary-active
                   disabled:bg-muted disabled:text-muted-foreground
                   transition-colors duration-fast">
  Submit
</button>
```

### Status Indicator

```tsx
// Accepted solution
<div className="flex items-center gap-2">
  <span className="text-success">✓</span>
  <span className="text-success font-medium">Accepted</span>
</div>

// Wrong answer
<div className="flex items-center gap-2">
  <span className="text-destructive">✗</span>
  <span className="text-destructive font-medium">Wrong Answer</span>
</div>

// Pending
<div className="flex items-center gap-2">
  <span className="text-warning animate-pulse">⟳</span>
  <span className="text-warning font-medium">Judging...</span>
</div>
```

## Shadows

**Minimal shadows - only for elevation clarity:**

```css
sm: 0 1px 2px rgba(0,0,0,0.05)   /* Subtle elevation */
md: 0 2px 4px rgba(0,0,0,0.08)   /* Moderate elevation */
lg: 0 4px 8px rgba(0,0,0,0.1)    /* High elevation (modals) */
```

## Border Radius

**Consistent, subtle rounding:**

```
sm:      2px  - Small elements
default: 4px  - Standard
md:      6px  - Medium
lg:      8px  - Large cards
full:    9999px - Circular
```

## Whitespace

**Lots of breathing room:**
- Don't cram content
- Use vertical spacing between sections
- Maintain consistent horizontal margins
- Mobile: reduce spacing slightly but keep hierarchy

## Micro-Feedback Examples

### Submission Flow
```
1. User clicks "Submit Code"
   → Button shows loading spinner, text disappears

2. Submission processing
   → Show "Judging..." with pulsing icon

3. Result comes back
   → Show success/error toast notification
   → Update problem status with color-coded indicator
```

### Battle Arena Queue
```
User clicks "Join Queue"
→ Button changes to "Searching..." with pulsing blue indicator
→ Feels active, not dead
```

## Design Checklist

Before shipping any feature, verify:

- [ ] Uses only 5-6 colors from the palette
- [ ] Has clear typography hierarchy (headings noticeably different from body)
- [ ] Uses consistent spacing scale
- [ ] All interactive elements have hover/focus/active states
- [ ] Animations are under 400ms and serve a purpose
- [ ] Works in both light and dark mode
- [ ] Color-blind accessible (icons + text, not just color)
- [ ] Keyboard navigable (focus rings visible)
- [ ] Feels fast (perceived speed matters)

## Anti-Patterns to Avoid

❌ **DON'T**:
- Add gradients just because they look cool
- Use complex shadows or glow effects
- Animate things that don't need animation
- Use too many font sizes (stick to 6 levels)
- Mix spacing inconsistently
- Use color alone for status (always add text/icons)

✅ **DO**:
- Ask "Does this serve a function?"
- Prefer whitespace over borders
- Keep animations subtle and fast
- Use semantic colors correctly
- Maintain visual hierarchy
- Test in both themes
- Consider color-blind users

## Implementation

### CSS Variables
All design tokens are available as CSS variables:
```css
var(--spacing-md)
var(--duration-fast)
var(--shadow-sm)
var(--radius)
```

### Tailwind Classes
Use Tailwind utilities with our custom scale:
```tsx
className="p-lg gap-md text-base hover:bg-muted transition-fast"
```

### Components
Import pre-built components from `/components/ui/`:
```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
```

---

**Remember**: Every pixel should have a function. When in doubt, remove it.
