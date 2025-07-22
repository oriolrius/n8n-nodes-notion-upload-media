# n8n-notion-upload-media Project Overview

## Project Summary
This is an n8n community node that enables uploading media files (images, videos, audio, documents) to Notion blocks using Notion's internal API. The node works around n8n's file size limitations by implementing a custom patch that allows uploads up to 4GB.

## Key Features
- Upload media files to existing Notion blocks
- Support for images, videos, audio files, and documents
- Auto-detection of media type based on file content
- Handles multiple Notion block ID formats (UUID, URL, hex)
- Large file support (up to 4GB) through custom patching
- Three-step upload process using Notion's internal API

## Technical Architecture

### Core Components
1. **NotionUploadMedia.node.ts** (`/nodes/NotionUploadMedia/NotionUploadMedia.node.ts`): Main node implementation
   - Implements n8n's INodeType interface
   - Handles the three-step upload process
   - Manages media type detection and block ID formatting

2. **NotionUploadMediaApi.credentials.ts** (`/credentials/NotionUploadMediaApi.credentials.ts`): Authentication credentials
   - Requires Token V2 (Notion cookie)
   - Space ID (workspace identifier)
   - User ID for authentication headers

3. **n8n-config.js**: Large file support patch
   - Patches Node.js module loading to override body-parser limits
   - Enables 4GB file uploads by intercepting raw-body and body-parser modules

### Technology Stack
- **Language**: TypeScript (ES2022)
- **Runtime**: Node.js 18.10+
- **Framework**: n8n workflow automation platform
- **Build Tools**: TypeScript compiler + Gulp
- **Package Manager**: pnpm (enforced)
- **Key Dependencies**: form-data (file uploads), n8n-workflow

### Upload Process Flow
```
1. Get Upload URL from Notion API (/api/v3/getUploadFileUrl)
   ↓
2. Upload File to S3 (using pre-signed URL)
   ↓
3. Update Notion Block (/api/v3/saveTransactionsFanout)
```

## Development Setup

### Prerequisites
- Node.js 18.10 or higher
- pnpm package manager
- n8n CLI installed globally (optional)

### Quick Start
```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Start development environment
./start-n8n.sh
```

### Environment Variables
Create `.env` file from `.env.example`:
```
N8N_USER_FOLDER=/home/oriol/n8n-notion-upload-media
N8N_CUSTOM_EXTENSIONS=/home/oriol/n8n-notion-upload-media
WEBHOOK_URL=http://localhost:5678
```

## Important Code Locations

### Main Functionality
- Node implementation: `/nodes/NotionUploadMedia/NotionUploadMedia.node.ts:1-547`
- Credentials definition: `/credentials/NotionUploadMediaApi.credentials.ts:1-67`
- Large file patch: `/n8n-config.js:1-51`

### Key Functions
- `formatBlockId()`: `/nodes/NotionUploadMedia/NotionUploadMedia.node.ts:443-466` - Handles multiple block ID formats
- `uploadMediaToNotionBlock()`: `/nodes/NotionUploadMedia/NotionUploadMedia.node.ts:165-267` - Main upload orchestration
- `uploadLargeFileToS3()`: `/nodes/NotionUploadMedia/NotionUploadMedia.node.ts:269-344` - Custom S3 upload for large files

### Configuration Files
- TypeScript config: `/tsconfig.json`
- ESLint config: `/.eslintrc.js`
- Build config: `/gulpfile.js`
- Package config: `/package.json`

## CI/CD Pipeline

### GitHub Actions Workflows
1. **ci.yml**: Main CI/CD pipeline
   - Tests on Node.js 18, 20, and 22
   - Runs linting and build checks
   - Publishes to npm and GitHub Packages on version tags

2. **release.yml**: GitHub release creation
   - Creates releases with changelog
   - Attaches dist folder as downloadable asset

## Testing and Quality

### Current State
- **Linting**: ESLint with n8n-specific rules
- **Formatting**: Prettier with n8n configuration
- **Type Checking**: Strict TypeScript configuration
- **Manual Testing**: Development environment with `start-n8n.sh`

### Missing/Recommended
- Unit tests for main functionality
- Integration tests for Notion API
- Test coverage reporting
- Automated E2E tests

## Known Limitations and Risks

1. **Uses Notion Internal API**: Not officially supported, may break with Notion updates
2. **Large File Patch**: Modifies Node.js module behavior at runtime
3. **No Automated Tests**: Relies on manual testing
4. **Authentication Method**: Uses cookie-based auth (Token V2) which may expire

## Common Commands

```bash
# Build the project
pnpm build

# Run linting
pnpm lint

# Format code
pnpm format

# Start development environment
./start-n8n.sh

# Watch mode for development
pnpm dev
```

## Project Structure
```
/
├── credentials/                 # Authentication definitions
├── nodes/                      # Node implementations
│   └── NotionUploadMedia/
├── dist/                       # Compiled output (gitignored)
├── examples/                   # Example workflows
├── .github/workflows/          # CI/CD pipelines
├── .claude/                    # Claude AI documentation
└── Various config files
```

## Future Improvements

1. **Add Comprehensive Test Suite**
   - Unit tests for core functionality
   - Integration tests with mocked Notion API
   - E2E tests with real Notion workspace

2. **Enhance Error Handling**
   - More detailed error messages
   - Retry logic for failed uploads
   - Better validation of inputs

3. **Add Features**
   - Batch upload support
   - Progress tracking for large files
   - Support for official Notion API when available

4. **Documentation**
   - API documentation with JSDoc
   - Troubleshooting guide
   - Video tutorials

## Security Considerations

- Never commit credentials to the repository
- Token V2 should be kept secure
- Consider implementing credential rotation
- Monitor for suspicious upload activity
- Validate file types and sizes before upload

## Contributing

See CONTRIBUTING.md for detailed guidelines. Key points:
- Follow existing code style
- Add tests for new features
- Update documentation
- Create detailed pull requests
- Follow semantic versioning

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Notion API Reference](https://developers.notion.com/)
- [Project Repository](https://github.com/oriolrius/n8n-notion-upload-media)
- [npm Package](https://www.npmjs.com/package/n8n-nodes-notion-upload-media)