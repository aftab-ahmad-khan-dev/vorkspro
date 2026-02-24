# Component Hierarchy

```
Category.jsx (Main Page)
│
├── DepartmentsTab
│   ├── CategoryCard (multiple instances)
│   │   ├── ToggleButton
│   │   └── CustomTooltip
│   └── LoadingSkeleton
│
├── SubDepartmentsTab
│   ├── SubDepartmentCard (multiple instances)
│   │   └── CustomTooltip
│   ├── Pagination
│   └── LoadingSkeleton
│
├── TransactionTypesTab
│   ├── Tabs (nested)
│   │   ├── Income Tab
│   │   │   ├── TransactionCard (multiple instances)
│   │   │   │   └── CustomTooltip
│   │   │   └── Pagination
│   │   └── Expense Tab
│   │       ├── TransactionCard (multiple instances)
│   │       │   └── CustomTooltip
│   │       └── Pagination
│   └── LoadingSkeleton
│
├── GenericCategoryTab (Leave Types)
│   ├── CategoryCard (multiple instances)
│   │   ├── ToggleButton
│   │   └── CustomTooltip
│   └── LoadingSkeleton
│
├── GenericCategoryTab (Bug Types)
│   ├── CategoryCard (multiple instances)
│   │   ├── ToggleButton
│   │   └── CustomTooltip
│   └── LoadingSkeleton
│
├── GenericCategoryTab (Document Types)
│   ├── CategoryCard (multiple instances)
│   │   ├── ToggleButton
│   │   └── CustomTooltip
│   └── LoadingSkeleton
│
├── GenericCategoryTab (Industry Types)
│   ├── CategoryCard (multiple instances)
│   │   ├── ToggleButton
│   │   └── CustomTooltip
│   ├── Pagination
│   └── LoadingSkeleton
│
├── GlobalDialog (Dialogs)
│   ├── DepartmentDialog
│   ├── SubDepartmentDialog
│   ├── IncomeDialog
│   ├── ExpenseDialog
│   ├── LeaveTypeDialog
│   ├── BugTypeDialog
│   ├── DocumentDialog
│   └── IndustryTypeDialog
│
└── Confirmation (Delete Confirmation)
```

## Component Reusability Matrix

| Component | Used By | Count |
|-----------|---------|-------|
| CategoryCard | DepartmentsTab, GenericCategoryTab (4x) | 5 tabs |
| LoadingSkeleton | All tabs | 7 tabs |
| Pagination | SubDepartmentsTab, TransactionTypesTab (2x), GenericCategoryTab (1x) | 4 tabs |
| GenericCategoryTab | Leave Types, Bug Types, Document Types, Industry Types | 4 tabs |
| TransactionCard | Income Tab, Expense Tab | 2 tabs |
| SubDepartmentCard | SubDepartmentsTab | 1 tab |

## Props Flow

### CategoryCard Props
```javascript
{
  item: Object,           // Data object with name, description, etc.
  type: String,          // Type identifier (departments, leaveTypes, etc.)
  icon: Component,       // Lucide icon component
  colorKey: String,      // Property name for color (default: "colorCode")
  onEdit: Function,      // Edit handler
  onDelete: Function,    // Delete handler
  onToggle: Function,    // Toggle status handler
  isToggling: Boolean    // Loading state for toggle
}
```

### Pagination Props
```javascript
{
  total: Number,         // Total number of items
  current: Number,       // Current page number
  onChange: Function,    // Page change handler
  disabled: Boolean,     // Disable pagination controls
  pageSize: Number       // Items per page (default: 10)
}
```

### GenericCategoryTab Props
```javascript
{
  title: String,         // Tab title
  items: Array,          // Array of items to display
  type: String,          // Type identifier
  icon: Component,       // Lucide icon component
  loading: Boolean,      // Loading state
  onAdd: Function,       // Add new item handler
  onEdit: Function,      // Edit item handler
  onDelete: Function,    // Delete item handler
  onToggle: Function,    // Toggle status handler
  togglingStatus: Object,// Toggle loading states
  pagination: Object,    // Optional pagination metadata
  page: Number,          // Optional current page
  onPageChange: Function // Optional page change handler
}
```
