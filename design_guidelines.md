# Electronic Medical Records System - Design Guidelines

## Design Approach
**Reference-Based with Custom Aesthetic**: Drawing from Linear's clean data presentation and Notion's card-based layouts, adapted to a dreamy pink glass morphism theme for a unique healthcare experience that balances clinical functionality with visual appeal.

## Color System (User-Specified)
- **Primary**: #EC4899 (vibrant pink)
- **Secondary**: #F9A8D4 (soft rose)
- **Accent**: #EC4899 (matches primary)
- **Backgrounds**: Gradient from #FFF1F2 to #FCE7F3
- **Glass Cards**: White/pink tinted glass with backdrop blur
- **Text**: Dark gray (#1F2937) for primary content, medium gray (#6B7280) for secondary
- **Status Colors**: Green for active treatments, amber for pending, red for urgent alerts

## Visual Effects & Atmosphere
- **Floating Orbs**: Subtle animated gradient spheres in background (#EC4899 to #F9A8D4 with blur)
- **Mesh Gradients**: Soft overlapping gradient shapes creating depth
- **Glass Morphism**: All cards use backdrop-blur-lg with subtle white/pink tint and border
- **Animations**: Framer Motion for smooth page transitions, card hover effects, and notification slides (keep subtle for medical context)

## Typography Hierarchy
- **Font Family**: Inter or similar modern sans-serif via Google Fonts
- **Headings**: 
  - Dashboard titles: text-3xl font-bold (32px)
  - Section headers: text-xl font-semibold (24px)
  - Card titles: text-lg font-medium (18px)
- **Body Text**: text-base (16px) for patient data, text-sm (14px) for metadata
- **Medical Data**: Use tabular-nums for precise alignment of numerical values

## Layout System
**Spacing Units**: Tailwind's 4, 6, 8, 12, 16, 20 for consistent rhythm
- Card padding: p-6 to p-8
- Section spacing: space-y-6 for content, space-y-12 between major sections
- Container: max-w-7xl for main content areas

## Component Library

### Navigation
- **Top Bar**: Glass morphism header with logo, search, notifications bell, user profile dropdown
- **Sidebar**: Collapsible glass panel with role-specific menu items (Dashboard, Patients, Prescriptions, Treatments)
- **Breadcrumbs**: Show current location in hierarchy

### Dashboard Layout
- **Role-Based Views**: Different card arrangements for doctors (comprehensive), nurses (treatment-focused), pharmacists (prescription-focused)
- **Stats Cards**: 4-column grid on desktop showing key metrics (Total Patients, Active Prescriptions, Pending Treatments, Today's Appointments) with gradient backgrounds
- **Quick Actions**: Floating action button (FAB) in pink for "Add New Patient" or "Create Prescription"

### Patient Records
- **List View**: Glass cards in grid (2-3 columns on desktop, 1 on mobile) with patient photo, name, age, last visit, status badge
- **Search & Filter Bar**: Glass container with search input, role filter dropdown, status filter chips
- **Detail View**: Full-width glass card with tabbed sections (Demographics, Medical History, Allergies, Current Medications, Treatment History)

### Forms
- **Glass Input Fields**: Subtle border, backdrop blur, pink focus ring
- **Multi-step Forms**: Progress indicator at top for complex patient intake
- **Validation**: Inline error messages in red with gentle shake animation

### Data Tables
- **Prescription Tables**: Striped rows with hover states, sortable columns, action buttons (View, Edit, Dispense)
- **Treatment Timeline**: Vertical timeline with glass cards showing treatment progression

### Notifications
- **Toast Messages**: Slide in from top-right, glass background with colored left border (green success, amber warning, red error)
- **Notification Panel**: Dropdown from header with scrollable list of recent alerts

### Loading States
- **Skeleton Screens**: Animated pulse gradient matching pink theme for cards and lists
- **Spinners**: Circular loading with pink gradient for button states

## Images
**No hero image** - This is a dashboard application. Use:
- **User avatars**: Circular profile photos throughout
- **Patient photos**: In record cards and detail views
- **Medical icons**: Heroicons for navigation and status indicators
- **Background orbs**: Abstract gradient shapes (generated with CSS, not images)

## Responsive Behavior
- **Desktop (1280px+)**: Multi-column grids, sidebar always visible
- **Tablet (768px-1279px)**: 2-column grids, collapsible sidebar
- **Mobile (< 768px)**: Single column, bottom navigation bar, hamburger menu

## Accessibility
- High contrast mode toggle for clinical readability
- Keyboard navigation for all interactive elements
- ARIA labels for screen readers (critical in healthcare)
- Focus indicators with pink ring
- Font size toggle option for aging medical professionals

## Key Principles
1. **Clinical Clarity First**: Despite beautiful aesthetics, medical data must be instantly readable
2. **Gentle Animations**: Use motion sparingly - no distracting effects during patient care
3. **Glass Hierarchy**: More prominent glass effect for primary actions, subtle for secondary content
4. **Consistent Pink Accents**: Use primary pink for CTAs, active states, and important indicators
5. **Breathing Room**: Medical staff work under pressure - give content space to reduce cognitive load