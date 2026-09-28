# Backlog API Integration Guide

## Overview
The backlog component has been updated to fetch data from an API instead of using static data. The integration includes:
- Automatic data fetching on component mount
- Proper error handling with retry functionality
- Loading states
- API response mapping to component data structures

## Setup Instructions

### 1. Configure API Endpoint

Edit `services/backlogService.ts` and update the API endpoints:

```typescript
export const fetchBacklogTasks = async (
  projectId: string,
  authToken?: string
): Promise<ApiBacklogResponse> => {
  // Replace this URL with your actual API endpoint
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  const endpoint = `${apiBaseUrl}/api/projects/${projectId}/backlog`;
  // ... rest of function
};
```

### 2. Add Environment Variables

Create or update `.env` file in your project root:

```env
EXPO_PUBLIC_API_URL=http://your-api-domain.com
```

### 3. Update Component to Call API

In `components/ui/backlogContent/index.tsx`, update the `useEffect` hook:

```typescript
useEffect(() => {
  const fetchBacklogData = async () => {
    try {
      setIsLoadingBacklog(true);
      setBacklogError(null);

      // Get projectId from route params or context
      const projectId = "your-project-id"; // TODO: Get from route/context
      const token = "your-auth-token"; // TODO: Get from AuthContext

      // Call the actual API
      const data = await fetchBacklogTasks(projectId, token);

      if (data.success && data.data) {
        const projectPrefix = data.data[0]?.project?.projectName || "PRJ Key";
        const mappedTasks = flattenApiTasks(data.data, projectPrefix);
        setBacklogTasks(mappedTasks);
      } else {
        setBacklogError(data.message || "Failed to fetch backlog data");
      }
    } catch (error) {
      console.error("Error fetching backlog:", error);
      setBacklogError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsLoadingBacklog(false);
    }
  };

  fetchBacklogData();
}, []);
```

### 4. API Response Format

The API should return data in this format:

```json
{
  "success": true,
  "message": "Successfully fetched project backlog tasks",
  "meta": {
    "limit": 10,
    "page": 1,
    "totalRecords": 2,
    "totalPages": 1
  },
  "data": [
    {
      "id": "task-id",
      "name": "Task Name",
      "description": "Task description",
      "parentId": null,
      "sprint": null,
      "project": {
        "id": "project-id",
        "projectName": "Project Name"
      },
      "taskType": {
        "id": "type-id",
        "name": "Story",
        "colorCode": "#FF5733",
        "levelWeight": 2
      },
      "status": {
        "id": "status-id",
        "name": "Todo",
        "colorCode": "#E00028"
      },
      "priority": {
        "id": "priority-id",
        "name": "High",
        "colorCode": "#FF5733"
      },
      "assignees": [],
      "tags": [
        {
          "id": "tag-id",
          "name": "Feature",
          "colorCode": "#0072C4"
        }
      ],
      "createdBy": {
        "id": "user-id",
        "displayName": "John Doe",
        "dP": "https://example.com/profile.jpg"
      },
      "hasChildren": false,
      "startDate": "2026-05-29T00:00:00.000Z",
      "endDate": "2026-06-29T00:00:00.000Z",
      "createdAt": "2026-06-04T13:30:37.781Z",
      "updatedAt": "2026-06-04T13:30:37.781Z",
      "children": []
    }
  ]
}
```

## Data Mapping

The component automatically maps API data to the internal format:

| API Field | Component Field | Notes |
|-----------|-----------------|-------|
| `id` | `id` | Unique identifier |
| `taskType.name` | `type` | Converts: Story→story, Task→task, Bug→bug, Epic→story |
| `project.projectName` | `key` | Used as task key prefix |
| `name` | `title` | Task title |
| `tags[0].name` \| `parentId.name` | `epic` | Epic/category |
| `status.name` | `status` | Converts: Todo→TO DO, InProgress→IN PROGRESS, Done→DONE |

## Handling Nested Tasks

The component automatically handles nested tasks (children) by flattening them. If your API returns:

```json
{
  "id": "parent-task",
  "name": "Parent Task",
  "children": [
    {
      "id": "child-task",
      "name": "Child Task",
      "children": []
    }
  ]
}
```

Both parent and child tasks will be displayed in the backlog.

## Error Handling

The component shows:
- **Loading State**: While fetching data
- **Error State**: With error message and retry button
- **Empty State**: When no tasks are returned

Users can click "Retry" to re-fetch if an error occurs.

## Authentication

If your API requires authentication:

1. Get the auth token from your AuthContext
2. Pass it to the service functions
3. Update the Authorization header in `backlogService.ts`:

```typescript
if (authToken) {
  headers["Authorization"] = `Bearer ${authToken}`;
}
```

## Future Features to Implement

- Pagination support for large datasets
- Caching with invalidation
- Real-time updates via WebSocket
- Offline support with local storage
- Optimistic updates when moving tasks
