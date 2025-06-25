# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
