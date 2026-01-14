# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-14

### Breaking Changes

- **n8n v2.0 Compatibility**: Updated to support n8n v2.x (requires n8n-workflow ^2.0.0)
- Changed `NodeConnectionType.Main` to `NodeConnectionTypes.Main` (plural) per n8n v2 API
- Removed direct n8n dependency from package (not needed for community nodes)
- Minimum Node.js version recommended: 20.15+

### Added

- **NotionListMedia Node**: New node to list and retrieve media files from Notion pages and databases
  - List media from pages with `loadPageChunk` API
  - Query media from databases with `queryCollection` API
  - Filter by media type (image, video, audio, file)
  - Optional metadata extraction (captions, dimensions, timestamps)
  - Optional file download capability
- **Comprehensive Test Suite**: 55 unit tests using Vitest
  - Tests for n8n v2 API compatibility
  - Mock utilities for IExecuteFunctions
  - Tests for node metadata, binary handling, error handling
  - Credential validation tests
- **CI Test Integration**: GitHub Actions now runs tests on every push/PR

### Changed

- Updated `n8n-workflow` dependency to `^2.0.0`
- Updated `@types/node` to `^22.10.0`
- Updated import style to use `import type` for type-only imports
- Registered NotionListMedia node in package.json
- Updated package description and keywords

### Development

- Added Vitest testing framework with coverage support
- Added test scripts: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`
- Created AGENTS.md documentation for AI agent assistance

## [1.1.1] - 2025-01-13

### Fixed

- Fix CI workflow to support tags without 'v' prefix
- Handle existing releases in release workflow

## [1.1.0] - 2025-01-12

### Added

- Auto-cleanup for temporary binary data
- Binary data TTL configuration (60 minutes default)
- Execution data pruning settings

## [1.0.6] - 2025-06-25

### Added

- Added npm package reference to README Resources section for better discoverability

## [1.0.5] - 2025-06-25

### Fixed

- Fixed CI/CD workflow npm publishing issues
- Removed unnecessary main field from package.json for n8n community nodes
- Added proper publishConfig for npm registry
- Improved GitHub Packages publishing with proper permissions and scoped naming
- Made GitHub Packages publishing optional to prevent CI failures

## [1.0.4] - 2025-06-25

### Fixed

- Fixed GitHub Actions release workflow to use correct project name (notion-upload-media instead of notion-set-icon)
- Updated release asset naming to match project name
- Corrected default release notes to reference the correct node type

## [1.0.3] - 2025-06-25

### Fixed

- Improved npm publishing workflow for better CI/CD automation
- Updated publishing method to use npm instead of pnpm for compatibility
- Added explicit access public flag for first-time package publishing

## [1.0.2] - 2025-06-25

### Fixed

- Updated CI workflow pnpm version to match package.json (10.12.3)

## [1.0.1] - 2025-06-25

### Added

- GitHub Actions CI/CD workflow for automated testing and publishing
- Comprehensive `.npmignore` file for cleaner npm packages
- Enhanced README with better installation instructions and NPM installation guide

### Changed

- Enhanced README documentation with better descriptions and formatting
- Added comprehensive keywords to package.json for better npm discoverability
- Updated package.json files field to include essential documentation

### Fixed

- Updated @typescript-eslint/parser and @typescript-eslint/eslint-plugin to resolve TypeScript version compatibility warnings

## [1.0.0] - 2025-06-25

### Added

- Initial release of n8n Notion Upload Media node
- Support for uploading media files to Notion blocks
- Multiple media type support: images, videos, audio, and documents
- Comprehensive credential management for Notion API
- Local development and testing environment
- Support for multiple block ID formats (UUID, URL, raw hex)

### Features

- **Upload Media to Blocks**: Upload various media files directly to Notion blocks
- **Multiple Media Types**: Support for images, videos, audio files, and documents
- **Flexible Block ID Support**: Accept various block ID formats for convenience
- **Secure Credential Management**: Proper handling of Notion authentication tokens

### Development

- TypeScript implementation with full type safety
- ESLint and Prettier configuration for code quality
- Gulp build system for asset management
- Comprehensive testing environment with n8n integration
- Environment variable management for secure development
