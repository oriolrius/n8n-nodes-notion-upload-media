# AGENTS.md - AI Agent Guide for n8n-notion-upload-media

> This document provides comprehensive guidance for AI agents (Claude, Copilot, Cursor, etc.) working with this codebase.

## Project Identity

**What this is**: An n8n community node package that enables uploading and listing media files (images, videos, audio, documents) to/from Notion using Notion's internal (unofficial) API.

**Why it exists**: The official Notion API doesn't support file uploads to blocks. This package uses reverse-engineered internal API endpoints to enable this functionality, plus includes a runtime patch to bypass n8n's default 16MB file size limit, allowing uploads up to 4GB.

**Primary author**: Oriol Rius (oriol@joor.net)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        n8n Runtime                               │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ NotionUploadMedia │  │ NotionListMedia  │  ← Node Classes    │
│  └────────┬─────────┘  └────────┬─────────┘                     │
│           │                     │                                │
│           └──────────┬──────────┘                                │
│                      ▼                                           │
│  ┌───────────────────────────────────────┐                      │
│  │     NotionUploadMediaApi Credentials  │  ← Authentication    │
│  │  (token_v2, spaceId, userId)          │                      │
│  └───────────────────┬───────────────────┘                      │
│                      │                                           │
└──────────────────────┼───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Notion Internal API                            │
│  POST /api/v3/getUploadFileUrl    ← Get S3 signed URL            │
│  POST /api/v3/saveTransactionsFanout ← Update block metadata     │
│  POST /api/v3/loadPageChunk       ← Get page content             │
│  POST /api/v3/queryCollection     ← Query database               │
│  POST /api/v3/loadUserContent     ← Credential validation        │
└──────────────────────────────────────────────────────────────────┘
```

### Three-Step Upload Process (Critical Knowledge)

```
1. getUploadFileUrl → Returns S3 signed POST URL + fields + final URL
        │
        ▼
2. POST to S3 → Multipart form with fields from step 1 + file
        │
        ▼
3. saveTransactionsFanout → Updates Notion block with:
   - properties.source (S3 URL)
   - properties.size
   - properties.title (filename)
   - format.display_source
   - type (image/video)
   - last_edited_time/by
```

---

## File Structure Map

```
/
├── nodes/
│   ├── NotionUploadMedia/
│   │   ├── NotionUploadMedia.node.ts   # Main upload node (494 lines)
│   │   └── notionUploadMedia.svg       # Node icon
│   └── NotionListMedia/
│       ├── NotionListMedia.node.ts     # Media listing node (458 lines)
│       └── notionListMedia.svg         # Node icon
├── credentials/
│   └── NotionUploadMediaApi.credentials.ts  # Auth definition (63 lines)
├── n8n-config.js                       # CRITICAL: Large file patch
├── start-n8n.sh                        # Dev environment launcher
├── package.json                        # n8n node registration
├── tsconfig.json                       # TypeScript strict mode
├── gulpfile.js                         # Icon copying
└── .github/workflows/
    ├── ci.yml                          # Test + publish to npm
    └── release.yml                     # GitHub release creation
```

---

## Critical Code Locations

### Upload Logic
| Function | File:Line | Purpose |
|----------|-----------|---------|
| `execute()` | `NotionUploadMedia.node.ts:160-255` | Main workflow execution |
| `uploadMediaToNotionBlock()` | `NotionUploadMedia.node.ts:283-437` | Three-step upload orchestration |
| `uploadLargeFileToS3()` | `NotionUploadMedia.node.ts:448-493` | Custom HTTPS upload with FormData |
| `formatBlockId()` | `NotionUploadMedia.node.ts:258-281` | Block ID normalization |

### List/Query Logic
| Function | File:Line | Purpose |
|----------|-----------|---------|
| `execute()` | `NotionListMedia.node.ts:189-338` | Page/database query execution |
| `extractMediaFromBlocks()` | `NotionListMedia.node.ts:364-426` | Parse media from page chunks |
| `extractMediaFromDatabase()` | `NotionListMedia.node.ts:429-442` | Parse media from DB results |

### Large File Support
| File | Purpose |
|------|---------|
| `n8n-config.js` | Runtime patch intercepting `require()` to override body-parser limits |
| `start-n8n.sh:10` | Loads patch via `NODE_OPTIONS="--require ./n8n-config.js"` |

---

## Development Commands

```bash
# Install dependencies (pnpm REQUIRED, enforced by preinstall hook)
pnpm install

# Build TypeScript + copy icons
pnpm build

# Watch mode for development
pnpm dev

# Lint TypeScript files
pnpm lint
pnpm lintfix  # Auto-fix

# Format with Prettier
pnpm format

# Start development n8n instance
pnpm start  # or ./start-n8n.sh
```

---

## Key Technical Patterns

### 1. Block ID Handling
The codebase accepts multiple formats and normalizes to UUID:
```typescript
// Input formats accepted:
"214c413b2a68800f9f9ad234e37d1380"           // 32-char hex
"214c413b-2a68-800f-9f9a-d234e37d1380"       // UUID
"https://notion.so/Page-214c413b2a68800f9f9ad234e37d1380"  // URL

// Always normalized to:
"214c413b-2a68-800f-9f9a-d234e37d1380"
```

### 2. Notion Headers (Required for all API calls)
```typescript
const baseHeaders = {
    'Cookie': `token_v2=${credentials.tokenV2};`,
    'notion-client-version': '23.13.0.2800',  // Must be recent
    'x-notion-active-user-header': credentials.userId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0...',  // Browser-like UA
    'Referer': 'https://www.notion.so/',
};
```

### 3. Transaction Format for Block Updates
```typescript
{
    requestId: generateUUID(),
    transactions: [{
        id: generateUUID(),
        spaceId: credentials.spaceId,
        debug: { userAction: 'N8nMediaUpload' },
        operations: [
            { pointer: {...}, path: ['properties'], command: 'update', args: {...} },
            // Multiple operations in single transaction
        ]
    }]
}
```

### 4. Binary Data Handling
Uses n8n's filesystem mode for large files:
```typescript
// Get buffer - handles both memory and filesystem modes
const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
```

---

## Common Agent Tasks

### Adding a New Node Parameter
1. Add to `properties` array in `description` object
2. Add type to options retrieval in `execute()`
3. Use with `this.getNodeParameter('paramName', i)`

### Modifying API Calls
1. All Notion API calls use `this.helpers.httpRequest()`
2. Headers are in `baseHeaders` constant
3. Always use `json: true` for Notion endpoints

### Adding New Media Types
1. Update `mediaType` options in node properties
2. Modify type detection in `execute()` (line ~204)
3. Update `blockType` assignment logic

### Debugging Upload Issues
1. Check `n8n.log` for buffer size logs
2. Verify credentials are valid (token_v2 expires)
3. Check `notion-client-version` header is current
4. Test with small file first to isolate size vs API issues

---

## Testing Procedures

### Manual Testing (Current State)
```bash
# 1. Start dev environment
./start-n8n.sh

# 2. Open http://localhost:5678
# 3. Create workflow with Notion Upload Media node
# 4. Configure credentials (token_v2, spaceId, userId)
# 5. Test with various file sizes and types
```

### Credential Testing
The credential type includes built-in test:
```typescript
test: ICredentialTestRequest = {
    request: {
        baseURL: 'https://www.notion.so/api/v3',
        url: '/loadUserContent',
        method: 'POST',
        body: {},
    },
};
```

### No Automated Tests Yet
This is a known gap. Test files should go in same directory as nodes with `.test.ts` extension (excluded from build).

---

## Code Conventions

### TypeScript
- **Strict mode enabled**: All strict flags in tsconfig.json
- **Target**: ES2022
- **Module**: CommonJS

### Linting
- Uses `eslint-plugin-n8n-nodes-base` for n8n-specific rules
- Many rules set to `warn` to allow gradual improvement
- Run `pnpm lint` before committing

### Formatting
- Prettier with n8n-workflow config
- Run `pnpm format` before committing

### n8n Node Structure
```typescript
export class NodeName implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Human Readable Name',
        name: 'camelCaseName',
        icon: 'file:iconName.svg',
        // ...
        properties: [/* parameters */],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // Implementation
    }
}
```

---

## Important Gotchas

### 1. Internal API Instability
- Notion's internal API is undocumented and may change
- `notion-client-version` header may need periodic updates
- Current version: `23.13.0.2800`

### 2. Token Expiration
- `token_v2` is a session cookie that expires
- Users must re-extract from browser periodically
- No refresh mechanism available

### 3. Large File Patch Requirement
- Without `n8n-config.js`, uploads fail at ~16MB
- Patch must be loaded via NODE_OPTIONS before n8n starts
- Only affects development; production n8n has own limits

### 4. Binary Data Modes
- n8n supports `default` (memory) and `filesystem` modes
- Large files require filesystem mode
- Set via `N8N_DEFAULT_BINARY_DATA_MODE=filesystem`

### 5. Package Registration
```json
// package.json - n8n field registers nodes
"n8n": {
    "credentials": ["dist/credentials/NotionUploadMediaApi.credentials.js"],
    "nodes": ["dist/nodes/NotionUploadMedia/NotionUploadMedia.node.js"]
}
```
**Note**: NotionListMedia is NOT registered in package.json yet (appears to be in development).

### 6. FormData for S3
```typescript
// S3 multipart requires specific field order
const formData = new FormData();
Object.entries(s3Fields).forEach(([key, value]) => {
    formData.append(key, value);  // S3 fields FIRST
});
formData.append('file', fileBuffer, { filename, contentType });  // File LAST
```

---

## CI/CD Pipeline

### Triggers
- **Push to main/master**: Runs tests only
- **Pull requests**: Runs tests only
- **Version tags** (v1.0.0 or 1.0.0): Runs tests + publishes

### Publishing
1. Build project
2. Publish to npm as `n8n-nodes-notion-upload-media`
3. Publish to GitHub Packages as `@oriolrius/n8n-nodes-notion-upload-media`

### Release Creation
1. Extracts changelog for version
2. Creates GitHub release with notes
3. Attaches `dist/` folder as zip asset

---

## Security Considerations

- **Never commit credentials** - `.env` is gitignored
- **token_v2 is sensitive** - Provides full Notion access
- **No credential rotation** - Manual token refresh required
- **TLS disabled in dev** - `NODE_TLS_REJECT_UNAUTHORIZED=0` in start-n8n.sh

---

## Extending This Package

### Adding a New Node
1. Create `nodes/NewNode/NewNode.node.ts`
2. Create icon as `nodes/NewNode/newNode.svg`
3. Register in `package.json` n8n.nodes array
4. Build with `pnpm build`

### Adding New Operations
1. Add to `operation` options in properties
2. Add displayOptions to show relevant parameters
3. Handle in execute() switch/if blocks

### Updating Notion API Version
1. Update `notion-client-version` in:
   - `NotionUploadMedia.node.ts:297`
   - `NotionListMedia.node.ts:210`
   - `NotionUploadMediaApi.credentials.ts:48`

---

## Quick Reference

| Task | Command/Location |
|------|------------------|
| Build | `pnpm build` |
| Dev mode | `pnpm dev` |
| Start n8n | `./start-n8n.sh` |
| View logs | `tail -f n8n.log` |
| Clean tmp | `rm -rf tmp/workflows/*/executions/*/binary_data/*` |
| Upload node | `nodes/NotionUploadMedia/NotionUploadMedia.node.ts` |
| List node | `nodes/NotionListMedia/NotionListMedia.node.ts` |
| Credentials | `credentials/NotionUploadMediaApi.credentials.ts` |
| Large file patch | `n8n-config.js` |

---

## Version History Context

- **1.1.1**: Current release
- **1.1.0**: Added auto-cleanup for temp binary data
- **1.0.x**: Initial releases with CI/CD fixes
- **NotionListMedia**: New node (not yet registered in package.json)

---

*Last updated: Based on codebase analysis. This is an unofficial n8n community node using Notion's internal API.*
