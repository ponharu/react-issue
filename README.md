# react-issue

Minimal reproduction for a **race condition bug** in React DOM's Server-Side Rendering (Fizz) that causes `Cannot read properties of null (reading 'parentNode')` error.

## Bug Description

The `$RS` (completeSegment) function in React DOM's SSR doesn't check if `parentNode` is null before accessing it, causing a race condition error when Suspense boundaries resolve.

**Error:**
```
Cannot read properties of null (reading 'parentNode')
```

## Affected Versions

- **React DOM**: 19.2.0
- **Next.js**: 16.0.1 (uses React DOM)
- **Environment**: Production builds only

## Reproduction Steps

1. Clone this repository
2. Run `npm install`
3. Run `npm run build` (production build required)
4. Run `npm run start`
5. Navigate to http://localhost:3000
6. **Note**: The bug may not occur on the first page load. Reload the page several times if needed.
7. Check browser console for the error

## How the Bug Occurs

1. Page uses Suspense with `loading.tsx` (Chakra UI Spinner)
2. Async page component has 1-second delay
3. When Suspense resolves, React's `$RS` function tries to move DOM nodes
4. **Race condition**: `parentNode` is already `null` when accessed
5. Error thrown: `Cannot read properties of null (reading 'parentNode')`

## Bug Location (React DOM)

**File:** `react-dom-bindings/src/server/fizz-instruction-set/ReactDOMFizzInstructionSetInlineCodeStrings.js`

**Function:** `completeSegment` (line 15)

**Buggy Code:**
```javascript
export const completeSegment =
  '$RS=function(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};';
```

**Problem:**
- No null checks on `a.parentNode` or `b.parentNode`
- During Suspense resolution, nodes can be removed, setting `parentNode` to `null`

## Proposed Fix

Add null safety checks:

```javascript
export const completeSegment =
  '$RS=function(a,b){a=document.getElementById(a);b=document.getElementById(b);if(a&&b&&a.parentNode&&b.parentNode){for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)}};';
```

## Why Production Only?

The bug manifests in production builds because:
1. React DOM generates optimized inline `$RS` function for SSR
2. Production builds enable stricter timing for Suspense resolution
3. The race condition is more likely to occur in production

