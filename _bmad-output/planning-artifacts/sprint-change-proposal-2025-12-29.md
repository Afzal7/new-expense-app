# Sprint Change Proposal: Receipt Attachment Pipeline Enhancement

**Date:** 2025-12-29  
**Proposed by:** Course Correction Analysis  
**Trigger:** User request to replace UploadThing with Uppy + Transloadit

## Issue Summary
During implementation review of Story 1.4 (Receipt Attachment Pipeline), it was identified that UploadThing lacks native camera/photo capture functionality critical for mobile-first expense capture. Additionally, Transloadit provides superior image optimizations (resizing, malware protection) that better align with our performance and security goals. This change enhances user experience without altering core scope.

## Impact Analysis
- **Epic Impact:** Isolated to Epic 1 (Personal Expense Management) - Story 1.4 needs implementation update.
- **Artifact Conflicts:** Architecture.md Section 5.3 requires update to reflect new storage decision.
- **Technical Impact:** Medium effort for integration, low risk - maintains transactional integrity and audit patterns.
- **User Impact:** Positive - enables photo capture, improves mobile UX, enhances security/performance.

## Recommended Approach
**Direct Adjustment:** Modify existing Story 1.4 to implement Uppy + Transloadit while preserving all acceptance criteria. This approach maintains project timeline, addresses user needs proactively, and carries low technical risk. Effort estimate: 2-3 weeks for dev team.

## Detailed Change Proposals
1. **Story 1.4 Update:** Change implementation from UploadThing to Uppy (UI) + Transloadit (storage). Update acceptance criteria to include photo capture and optimization benefits.
2. **Architecture Revision:** Update Section 5.3 to specify Uppy + Transloadit, ensuring alignment with fail-safe file handling rules.

## Implementation Handoff
**Scope:** Minor - direct implementation by development team.  
**Responsibilities:** Dev team to update components, integrate APIs, test transactions, and validate compliance.  
**Success Criteria:** Photo capture works on mobile, optimizations active, no regression in audit/file handling.