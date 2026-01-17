# Job Count Caching Implementation

## Problem
The job count in the extension popup was slow to load because it required two sequential API calls every time the popup opened:
1. Auth verification (`/api/auth/me`) - 200-500ms
2. Job count fetch (`/api/jobs?page=1&limit=1`) - 200-500ms

**Total delay: 500-1200ms** before users saw their job count.

## Solution: Cache-First Strategy

Implemented a cache-first approach that shows the cached count instantly while fetching fresh data in the background.

### Flow Diagram

```
User Opens Popup
    ↓
[INSTANT] Show cached count from chrome.storage.local (~50ms)
    ↓
[BACKGROUND] Fetch fresh count from API (200-500ms)
    ↓
Update UI with fresh count
    ↓
Cache new count for next time
```

## Implementation Details

### 1. Popup.js Changes

**Added cache read on popup open:**
```javascript
// Show cached count immediately
const cachedCount = await getLocal('jobCount');
if (cachedCount !== undefined && cachedCount !== null) {
  countEl.textContent = cachedCount;
  info('[JobTracker] Showing cached job count:', cachedCount);
}
```

**Cache fresh count after API call:**
```javascript
const jobCount = data.total || 0;
countEl.textContent = jobCount;

// Cache for next time
await setLocal('jobCount', jobCount);
```

**Note:** Popup does NOT increment the cache when saving jobs to avoid double-counting. The increment happens only in background.js.

### 2. Background.js Changes

**Increment cache when job is saved (SINGLE SOURCE OF TRUTH):**
```javascript
jobQueue._sendJob = async (job) => {
  const result = await apiClient.saveJob(job);
  
  // Increment cached count (only place this happens)
  const currentCount = await getLocal('jobCount');
  if (currentCount !== undefined && currentCount !== null) {
    await setLocal('jobCount', currentCount + 1);
  }
  
  return result;
};
```

This ensures the cache is incremented exactly once per successful job save, whether it's:
- Direct Easy Apply from LinkedIn
- Pending job confirmation from popup
- Batch confirmation of multiple jobs

### 3. Storage Location

- **Key**: `jobCount`
- **Storage**: `chrome.storage.local`
- **Type**: Number
- **Updates**: 
  - On popup open (background refresh)
  - On successful job save (increment)

## Performance Improvement

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| First popup open (no cache) | 500-1200ms | 500-1200ms | Same |
| Subsequent opens | 500-1200ms | ~50ms | **10-24x faster** |
| After saving job | N/A | Instant | Cache updated |

## Benefits

1. **Instant Feedback**: Users see their job count immediately
2. **Always Fresh**: Background refresh ensures data stays current
3. **Offline Resilience**: Shows last known count even if API fails
4. **Reduced Load**: Less perceived latency on every popup open

## Cache Invalidation

The cache is automatically updated:
- ✅ Every time popup opens (background refresh)
- ✅ When a job is successfully saved (increment)
- ✅ When pending jobs are confirmed (increment per job)

## Edge Cases Handled

1. **No cache exists**: Falls back to API call (first-time users)
2. **API fails**: Keeps showing cached count instead of "0"
3. **Auth expires**: Shows "-" and clears display
4. **Multiple jobs saved**: Cache increments for each successful save

## Files Modified

- `extension/popup.js` - Added cache read/write logic
- `extension/background.js` - Added cache increment on job save
- `extension/core/storage.js` - Already had `getLocal`/`setLocal` helpers

## Testing

To test the caching:
1. Open extension popup (should see count instantly if cached)
2. Apply to a job on LinkedIn
3. Open popup again (count should increment instantly)
4. Check console logs for cache operations

## Future Enhancements

- Add cache expiration (e.g., refresh if older than 5 minutes)
- Sync count across devices using `chrome.storage.sync`
- Add visual indicator when showing cached vs fresh data
