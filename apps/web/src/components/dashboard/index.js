/**
 * Shared dashboard layout components for consistent design across all dashboards.
 * Use this structure for the single role-based dashboard and any admin-created roles.
 *
 * Generic layout order (use gap-y-8 or flex flex-col gap-y-8 between sections):
 * 1. DashboardSummaryCard (title + one-line summary; use getDashboardTitleFromRole / getDashboardSummaryFromRole)
 * 2. Insight cards row (4 x DashboardInsightCard)
 * 3. DashboardQuickActions (action buttons from tabs; gap-y-8 above/below)
 * 4. Activity sections (DashboardActivitySection — department-specific)
 */
export { DashboardSummaryCard } from "./DashboardSummaryCard";
export { DashboardInsightCard } from "./DashboardInsightCard";
export { DashboardQuickActions } from "./DashboardQuickActions";
export { DashboardActivitySection } from "./DashboardActivitySection";
