# Small CLs - Google's Engineering Practices

Source: https://google.github.io/eng-practices/review/developer/small-cls.html

## Why Write Small CLs?

- **Faster reviews**: Easier for reviewer to find 5 minutes several times than a 30 minute block
- **More thorough examination**: Large changes cause frustration that leads to missed issues
- **Lower bug risk**: Fewer modifications make impact analysis easier
- **Reduced wasted effort**: Rejection of substantial work represents significant loss
- **Simpler merging**: Large projects create frequent conflicts
- **Better design quality**: Refinement is easier on limited scope work
- **Unblocked progress**: Self-contained portions enable continued development during review
- **Easier rollbacks**: Smaller footprints minimize related complications

**Critical note**: Reviewers can reject your change for being too large.

## Defining "Small"

A proper CL is "one self-contained change":

- Addresses a single aspect, typically one feature component
- Incorporates relevant test code
- Contains all necessary context for understanding
- Maintains system functionality post-submission

**Size guidelines**:
- ~100 lines is usually reasonable
- ~1000 lines is usually too large
- 200 lines across 50 files typically exceeds acceptable limits

## Splitting Strategies

### By Type (Horizontal)
- Separate refactorings from feature work and bug fixes
- Create shared code or interfaces isolating technical layers
- Example: proto changes separate from code using proto

### By Feature (Vertical)
- Implement independent full-stack features separately
- Each PR delivers complete, working functionality

### By Files/Reviewers
- Separate modifications affecting different reviewers
- Group files needing same expertise

### Stacking Changes
- Submit PR1 for review, immediately begin dependent PR2
- Don't wait sequentially between submissions

## Handling Refactoring

Keep separate from features and bug fixes:
- Moving/renaming a class -> different CL from fixing a bug in that class
- Minor cleanups within related changes are acceptable

## Test Code Requirements

- Include relevant tests in the same CL
- All logic modifications require accompanying tests
- Refactoring-only CLs need existing or new test coverage

## Build Integrity

Each PR must maintain working system after submission.

## Unavoidable Large Changes

Before accepting as necessary:
1. Consider refactoring CLs that enable cleaner implementation
2. Consult teammates for decomposition strategies

If truly unavoidable:
- Get consent from reviewers in advance
- Expect extended review cycles
- Ensure comprehensive testing
