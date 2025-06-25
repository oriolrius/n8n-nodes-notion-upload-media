# Contributing to n8n Notion Upload Media

Thank you for your interest in contributing to this project! This guide will help you get started.

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/oriolrius/n8n-nodes-notion-upload-media.git
   cd n8n-nodes-notion-upload-media
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual Notion credentials
   ```

4. **Build the project**:
   ```bash
   pnpm build
   ```

## Development Workflow

1. **Start the development environment**:
   ```bash
   pnpm start
   ```
   This will start n8n at `http://localhost:5678` with your custom node loaded.

2. **Make your changes** to the source code in:
   - `nodes/NotionUploadMedia/` - Main node implementation
   - `credentials/` - Credential definitions

3. **Rebuild and test**:
   ```bash
   pnpm build
   # Restart n8n (Ctrl+C and run pnpm start again)
   ```

4. **Code quality checks**:
   ```bash
   pnpm lint        # Check for linting errors
   pnpm lintfix     # Auto-fix linting errors
   pnpm format      # Format code with Prettier
   ```

## Project Structure

```
├── nodes/
│   └── NotionUploadMedia/
│       ├── NotionUploadMedia.node.ts    # Main node implementation
│       └── notionUploadMedia.svg        # Node icon
├── credentials/
│   └── NotionUploadMediaApi.credentials.ts  # Credential definition
├── examples/                        # Example workflows
├── dist/                           # Built files (auto-generated)
└── ...
```

## Code Style

- Use TypeScript for all source code
- Follow the existing code style (enforced by ESLint and Prettier)
- Add JSDoc comments for public methods and complex logic
- Use meaningful variable and function names

## Testing

- Test your changes in the local n8n environment
- Verify media upload functionality with different file types
- Test with different block ID formats
- Ensure error handling works correctly

## Submitting Changes

1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following the guidelines above
4. **Test thoroughly** in the development environment
5. **Commit your changes**: `git commit -m "Add your descriptive commit message"`
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Create a Pull Request** on GitHub

## Pull Request Guidelines

- Provide a clear description of what your PR does
- Include any relevant issue numbers
- Make sure all code quality checks pass
- Test your changes thoroughly
- Update documentation if needed

## Getting Help

- Check existing [issues](https://github.com/oriolrius/n8n-nodes-notion-upload-media/issues)
- Create a new issue if you need help or found a bug
- Be specific about your environment and the problem you're facing

## Code of Conduct

Please be respectful and constructive in all interactions. We want to maintain a welcoming environment for all contributors.