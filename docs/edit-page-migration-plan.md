# Edit Page Migration Plan: Single-Select Manager & Singular Attachments

## Overview
The edit page (`app/dashboard/expenses/[id]/edit/page.tsx`) uses the same `ExpenseForm` component as the create page. Since we've already updated the shared components to enforce single-select managers and singular attachments, **no additional changes are needed** - the edit page will automatically work with the new behavior.

## Current State Analysis

### Components Already Updated ✅
1. **`ExpenseForm`** - Page minimum height updated
2. **`ManagerSelector`** - Single-select behavior implemented
3. **`LineItemCard`** - Singular attachment behavior implemented, category pills wrap
4. **`app/dashboard/expenses/[id]/edit/page.tsx`** - Uses ExpenseForm, inherits all updates

### Why No Changes Are Needed

Since this is a **new app** with no legacy data:
- All new expenses will have single manager (array with 0 or 1 item)
- All new line items will have singular attachment (array with 0 or 1 item)
- The form's `defaultValues` already handle arrays correctly
- Components enforce single-select/singular behavior at UI level

## Verification Checklist

Since the edit page uses the same components, verify these scenarios work:

1. **Edit Existing Expense**:
   - [ ] Load expense with single manager
   - [ ] Verify manager is correctly selected in ManagerSelector
   - [ ] Load expense with single attachment per line item
   - [ ] Verify attachments are correctly displayed in LineItemCard
   - [ ] Verify form submission works correctly

2. **Edit Expense with No Manager/Attachments**:
   - [ ] Edit expense with no managers (empty array)
   - [ ] Edit expense with no attachments (empty arrays)
   - [ ] Verify form allows adding manager/attachments

3. **UI Behavior**:
   - [ ] Category pills wrap to next line (no horizontal scroll)
   - [ ] Page has minimum height so footer isn't visible initially
   - [ ] Manager selector is single-select (clicking another manager replaces current)
   - [ ] File upload replaces existing attachment (doesn't add multiple)

4. **Form Submission**:
   - [ ] Saving draft works correctly
   - [ ] Submitting for approval works correctly
   - [ ] Only single manager is saved (array with 0 or 1 item)
   - [ ] Only singular attachment per line item is saved (array with 0 or 1 item)

## Files Status

### ✅ No Changes Needed (Already Updated)
1. ✅ `components/expense-form.tsx` - Page minimum height, uses updated components
2. ✅ `components/expenses/ManagerSelector.tsx` - Single-select implemented
3. ✅ `components/expenses/line-item-card.tsx` - Singular attachment, category pills wrap
4. ✅ `app/dashboard/expenses/[id]/edit/page.tsx` - Uses ExpenseForm, inherits all updates

## Implementation Status

**Status**: ✅ **COMPLETE** - No additional implementation needed

The edit page automatically benefits from all the component updates because:
- It uses the same `ExpenseForm` component
- `ExpenseForm` uses the updated `ManagerSelector` and `LineItemCard` components
- All UI constraints (single-select, singular attachments) are enforced at the component level
- Form data structure (arrays) remains compatible with API

## Testing Recommendations

While no code changes are needed, test these scenarios to ensure everything works:

1. **Create → Edit Flow**:
   - Create a new expense with manager and attachments
   - Edit the expense
   - Verify manager and attachments are correctly loaded
   - Verify you can change manager (single-select)
   - Verify you can replace attachment (singular)

2. **Edit → Save Flow**:
   - Edit an existing expense
   - Make changes (update manager, replace attachment)
   - Save draft
   - Verify changes are persisted correctly

3. **UI Consistency**:
   - Verify edit page looks identical to create page
   - Verify category pills wrap correctly
   - Verify footer behavior matches create page

## Success Criteria

✅ Edit page works identically to create page
✅ Single-select manager works correctly
✅ Singular attachment per line item works correctly
✅ Category pills wrap to next line
✅ Page has minimum height so footer isn't visible initially
✅ Form submission saves data correctly
✅ No console errors or warnings

## Notes

- **No code changes needed** - edit page inherits all updates automatically
- All components are shared between create and edit flows
- Database schema uses arrays (compatible with single values)
- API accepts arrays with 0 or 1 item (no changes needed)
