# Form Submission and Data Persistence

Implement the ability to save memory palaces and navigate to the editing interface.

## User Review Required

> [!IMPORTANT]
> I will use **localStorage** for data persistence as it's simple and doesn't require external dependencies. This is appropriate for a client-side application. If you prefer a different approach (IndexedDB, cloud database, etc.), please let me know.

> [!NOTE]
> The palace editor page doesn't exist yet. I'll create a placeholder page at `/palace/[id]` that we can build out in the next phase.

## Proposed Changes

### Data Model

#### [NEW] [types.ts](file:///c:/Users/louis/projects/memorypalace/memorypalace/src/types/types.ts)
Create TypeScript interfaces for the data model:
- `MemoryPalace`: Contains id, name, description, image, rooms
- `Room`: Contains id, name, position, items
- `Item`: Contains id, description, association

### Utilities

#### [NEW] [storage.ts](file:///c:/Users/louis/projects/memorypalace/memorypalace/src/lib/storage.ts)
Create utility functions for localStorage operations:
- `saveMemoryPalace(palace: MemoryPalace): void`
- `getMemoryPalace(id: string): MemoryPalace | null`
- `getAllMemoryPalaces(): MemoryPalace[]`
- `deleteMemoryPalace(id: string): void`

---

### Components

#### [MODIFY] [NewMemoryForm.tsx](file:///c:/Users/louis/projects/memorypalace/memorypalace/src/components/NewMemoryForm.tsx)
Update form submission handler to:
- Validate form inputs (memory text, image selection)
- Handle file upload for local images
- Create a new `MemoryPalace` object with a unique ID
- Save to localStorage
- Navigate to `/palace/[id]` using Next.js router

---

### Pages

#### [NEW] [page.tsx](file:///c:/Users/louis/projects/memorypalace/memorypalace/src/app/palace/[id]/page.tsx)
Create the palace editor page:
- Accept palace ID as route parameter
- Load palace data from localStorage
- Display palace image and basic info
- Placeholder UI for future room editing functionality

## Verification Plan

### Manual Verification
1. Navigate to `/new-memory`
2. Enter a memory description
3. Generate or upload an image
4. Click "Next" button
5. Verify redirect to `/palace/[id]`
6. Verify palace data is saved in localStorage (check browser DevTools > Application > Local Storage)
7. Refresh the page and verify data persists
