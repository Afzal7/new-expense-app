# Project brief

# Overview

This app is an employee expense management system with organizational structure support. The system handles two types of expense submissions:  
\*\*single expenses\*\* (one-off transactions like "Uber ride \- ₹450") and   
\*\*expense reports\*\* (multi-line-item collections like business trips with multiple receipts).  
The core principle is \*\*flexibility\*\* \- no hardcoded workflows, employee controls submission flow, manager responds accordingly.

# Objectives

### Company objectives

* Core Value Proposition: Transform chaotic receipt management into a seamless three-click experience—snap, submit, reimburse.  
* Unlike enterprise tools (Concur, Expensify) that overwhelm small-to-medium teams with complexity, This app offers AI-powered automation with a consumer-grade interface specifically built for teams of 10-500 employees.

### Project objectives

* Add key project objectives and outcomes  
* Define key success metrics

# Strategy

### Approach

Outline a plan of action to accomplish the mentioned objectives. Collaborate with the team to ensure that the plan is feasible and achievable within the given timeframe.

### Target audience

* Describe the audience for the project  
* Be specific and make sure the audience is well-defined  
* Consider demographics, accessibility, and scalability

### Measurement

* Establish clear and measurable metrics to track success or progress  
* Select metrics that are relevant to the specific objectives and align with the overall goals  
* Determine a baseline or starting point to measure growth and improvement over time

# Roles

| Role | Name |
| :---- | :---- |
| Owners |  [umaiz iqbal](mailto:umaiziqbal@gmail.com) [Afzal](mailto:md.afzal1234@gmail.com) |
| Approvers | Person Person |
| Contributors | Person Person Person |
| Informed | Person Person |

# Milestones

| Date | Milestone | Description | Expected outcome |
| :---- | :---- | :---- | :---- |
| Date | Milestone 1 | Add description | Add outcome |
| Date | Milestone 2 | Add description | Add outcome |
| Date | Milestone 3 | Add description | Add outcome | 

## **Core Entities & Structure**

### **Organizations**

- Central to the system structure  
- Managers belong to organizations  
- Employees can optionally join organizations (not mandatory at login/signup)  
- **Database design:** Must support many-to-many relationship (one user account can belong to multiple organizations in future)  
- **MVP restriction:** User can only belong to ONE active organization at a time in the UI  
- Organization has creator and managers who have administrative permissions  
- Organizations provide grouping/reporting structure but don't block expense approval

### **User Roles (Not Mutually Exclusive)**

**Employee (Base Role \- Everyone Has This):**

- Can submit single expenses  
- Can create and submit expense reports  
- Can request to join organizations  
- Can be invited to organizations  
- Sees "My Expenses" dashboard

**Manager (Employee \+ Approval Permissions):**

- Has ALL employee capabilities (managers are also employees)  
- Can submit their own expenses to THEIR manager (hierarchical chain)  
- Can approve/reject expenses from their direct reports  
- Can approve/reject expense reports from their direct reports  
- Can approve organization join requests  
- Belongs to one organization  
- Sees "My Expenses" tab AND "Approvals" tab  
- **Cannot approve their own expenses** (system prevents self-approval)

**Organization Creator:**

- Manager role \+ administrative control over organization  
- Can approve join requests  
- Can invite team members  
- Full organizational settings access

---

## **Feature 1: Single Expense Submission**

### **What It Is**

One-off transaction submitted individually (e.g., "Uber ride \- ₹450", "Client lunch \- ₹2,200")

### **Employee Submission Flow**

**If Employee NOT in Organization:**

1. Employee creates single expense  
2. Enters manager email manually  
3. Expense submits and immediately visible to manager (no blocking)  
4. Manager sees indicator: "Employee not in organization yet"  
5. Manager can:  
   - Approve/reject expense (approval independent of org membership)  
   - Invite employee to join organization (optional, can do simultaneously)  
   - Employee reimbursement never delayed by org approval

**If Organization Rejects Join Request:**

- Manager still sees the expense with "Join request rejected" warning  
- Manager can still approve the expense  
- Org membership is for reporting/grouping, not a hard requirement for approval

**If Employee Already in Organization:**

- Employee sees dropdown list of managers within their organization  
- Selects manager from list (no manual email entry, validated)  
- Submits expense  
- Cleaner, error-free flow

### **Submission Options (Employee Chooses)**

Employee decides submission type:

- **Draft:** Work in progress, not visible to manager yet  
- **Submit for Approval:** Final submission requesting reimbursement  
- System doesn't enforce any sequence, employee controls workflow

---

## **Feature 2: Expense Reports (Multi-Line-Item)**

### **What It Is**

Collection of multiple related expenses grouped together, typically for business trips or projects. Example: "Mumbai Business Trip" containing plane ticket, hotel, multiple cab rides, meals, etc.

### **Structure**

- One expense report \= container for multiple line items  
- Each line item has: Date, Amount, Merchant, Category, Receipt photo(s), Description  
- Manager sees chronological timeline view of all line items  
- Total amount calculated automatically

### **Employee Workflow (Completely Flexible)**

Employee can choose ANY of these paths:

**Path 1: Pre-Approval First (Employee Requests Permission)**

1. Employee creates expense report: "Mumbai Client Meeting Trip"  
2. Adds trip details: purpose, estimated budget, dates  
3. **Submits for Pre-Approval** to manager  
4. Manager reviews and approves/rejects travel request  
5. After approval, employee goes on trip  
6. Employee adds actual line items (receipts, amounts, dates) to the same report  
7. **Submits for Final Approval** to manager  
8. Manager reviews complete report and approves/rejects for reimbursement

**Path 2: Direct Submission (No Pre-Approval)**

1. Employee goes on trip (or incurs expenses)  
2. Employee creates expense report  
3. Adds all line items with receipts  
4. **Submits directly for Final Approval** to manager  
5. Manager reviews and approves/rejects in one step

**Path 3: Save as Draft Anytime**

- Employee can save incomplete report as draft  
- Return later to add more line items  
- Submit when ready

**Key Point:** System doesn't enforce pre-approval. Employee decides which path makes sense for their situation.

### **Manager Review Experience**

When manager opens expense report, they see:

- Report title and purpose  
- Status: Draft, Awaiting Pre-Approval, Awaiting Final Approval, Approved, Rejected  
- If pre-approved: Timeline showing approval history  
- **Chronological timeline** of all line items sorted by date  
- Each line item showing: Date, Merchant, Category, Amount, Receipt thumbnail  
- Total amount  
- If estimated budget provided: Comparison of estimated vs actual

Manager can:

- Approve entire report  
- Reject entire report (with reason)  
- Approve/reject individual line items (if system supports granular control)  
- Request changes/clarification

---

## **Organization Membership Flows**

### **Two Entry Paths to Organization:**

**Path 1: Reactive (Employee Discovers Org Through Expense)**

1. Employee submits expense to manager email  
2. System detects manager belongs to organization  
3. Employee sees option to request join organization  
4. Employee requests to join  
5. Organization admin/manager approves or rejects request  
6. If approved: Employee now member, can select managers from dropdown  
7. If rejected: Employee can still submit expenses, manager sees rejection indicator

**Path 2: Proactive (Organization Invites Directly)**

1. Organization admin/manager invites employee by email  
2. Employee receives invitation  
3. Employee accepts invitation  
4. Employee becomes member immediately  
5. Can now submit expenses using manager dropdown

### **Organization Permissions**

Who can approve join requests:

- Organization creator  
- Managers in the organization

---

## **Flexible Workflow System**

### **Core Principle: No Hardcoded Rules**

**System Does NOT Enforce:**

- Pre-approval before final submission  
- Specific status sequences  
- Organization membership for expense submission  
- Amount thresholds for approval levels (MVP scope)

**System DOES Track:**

- Current status of each expense/report  
- Timeline of status changes  
- Who approved/rejected and when  
- Submission type chosen by employee

**Employee Controls:**

- What type of submission (draft, pre-approval request, final approval)  
- When to submit (no forced timing)  
- What information to include

**Manager Controls:**

- Approve, reject, or request changes  
- Invite to organization or not  
- Approve organization join requests

**Status Types Supported:**

- Draft  
- Awaiting Pre-Approval  
- Pre-Approved  
- Awaiting Final Approval  
- Approved  
- Rejected  
- (System flexible enough for additional statuses)

---

## **Dashboard Requirements**

### **Employee Dashboard**

Shows all expenses/reports user has submitted:

**Tab/View Organization:**

- Drafts (incomplete, not submitted)  
- Pending Pre-Approval (trip requests awaiting approval)  
- Pre-Approved (trips approved, can add line items)  
- Pending Final Approval (submitted for reimbursement)  
- Approved (reimbursement approved)  
- Rejected (with rejection reasons)

**Employee Can:**

- Create single expense  
- Create expense report  
- View all submissions with status  
- Edit drafts  
- Add line items to pre-approved reports  
- Track approval status  
- See organization membership status  
- Request to join organization

### **Manager Dashboard**

Shows TWO contexts (if user is manager):

**"My Expenses" Tab (Acting as Employee):**

- Manager's own submitted expenses  
- Same view as employee dashboard  
- Submits to THEIR manager

**"Approvals" Tab (Acting as Manager):**

- All expenses/reports from direct reports  
- Pending pre-approval requests  
- Pending final approval submissions  
- Previously approved/rejected items  
- Organization join requests (if applicable)

**Manager Can:**

- Approve/reject expenses  
- Approve/reject expense reports  
- Request changes with comments  
- View timeline of expense report line items  
- See employee org membership status  
- Invite employees to organization  
- Approve organization join requests

**Visual Indicators:**

- "Not in organization" warning on expenses from non-members  
- "Join request rejected" indicator if applicable  
- Pre-approved vs direct submission (for context)  
- Clear status badges (color-coded)

---

## **Receipt Management**

### **For Single Expenses:**

- Employee can upload multiple receipt photos/PDFs  
- Each receipt max 5MB  
- Supported formats: JPG, PNG, PDF  
- Receipts optional but encouraged

### **For Expense Reports:**

- Each line item can have multiple receipts  
- Same file size and format restrictions  
- Receipts shown in timeline view per line item

### **Receipt Display:**

- Thumbnail grid view  
- Click to open full-size viewer  
- Zoom capability on mobile and desktop  
- Download/save option for managers

---

## **Key User Experience Principles**

1. **No Friction:** Employee reimbursement never delayed by organization approval process  
2. **Employee Control:** Employee decides submission type and workflow path  
3. **Manager Flexibility:** Manager can approve expense regardless of org membership status  
4. **Transparency:** Clear status indicators and timeline views  
5. **Hierarchical Structure:** Managers submit to their managers (chain of approval)  
6. **Organization Optional:** System works with or without organization membership  
7. **Dual Role Support:** Same user can be both manager and employee seamlessly

---

## **MVP Scope Boundaries**

**INCLUDED in MVP:**

- Single expenses and expense reports (both types)  
- Flexible submission (draft, pre-approval, final approval)  
- Organization structure with join requests  
- Manager approvals with timeline view  
- Receipt upload and viewing  
- Hierarchical manager-employee relationships  
- Dual role support (manager is also employee)

**NOT INCLUDED in MVP (Future Enhancements):**

- Organization-level workflow configuration/rules  
- Amount threshold-based approval routing  
- Multi-level approval chains (beyond direct manager)  
- Expense categories/tags  
- Budget tracking and alerts  
- Analytics and spending reports  
- Integrations with accounting systems  
- Multi-currency support  
- Per diem calculations

---

## **Technical Considerations**

### **Database Must Support:**

- Many-to-many relationship: Users ↔ Organizations (future-proofing)  
- Hierarchical relationships: Manager → Manager → Manager chain  
- Expense reports containing multiple line items (one-to-many)  
- Multiple receipts per expense/line item (one-to-many)  
- Status tracking with timestamp history  
- Organization join requests with approval status

### **UI Must Handle:**

- Switching context: "I'm submitting expense" vs "I'm approving expenses"  
- Dropdown manager selection when in org vs email entry when not  
- Timeline view for expense reports (chronological line items)  
- Mobile-first responsive design  
- Receipt upload with progress indicators  
- Status badges with clear visual hierarchy

---

## **Critical Business Rules**

1. **Organization membership is descriptive, not prescriptive** \- It groups users but doesn't block workflows  
2. **Managers cannot self-approve** \- System must prevent this  
3. **Expense approval independent of org approval** \- Manager can approve expense even if join request rejected  
4. **Employee controls workflow** \- No forced pre-approval or submission sequence  
5. **Immediate visibility** \- All submissions go directly to manager, no blocking steps  
6. **Hierarchical approval** \- Managers submit to their managers, creating approval chain

# Open questions

| Name | Open question |
| :---- | :---- |
| Person | Add question |
| Person | Add question |
| Person | Add question |
