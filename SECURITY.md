# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it to us responsibly:

1. **Do not** open a public GitHub issue
2. Send an email to [your.email@example.com] with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

## Security Considerations

### Credential Management
- Never commit actual Notion credentials to the repository
- Use the provided `.env.example` as a template
- Ensure your `.env` file is in `.gitignore`

### Token Security
- Notion `token_v2` cookies are sensitive and provide full access to your Notion workspace
- Rotate tokens regularly
- Use environment variables for credential storage
- Never log or expose credentials in error messages

### Network Security
- The node makes HTTPS requests to Notion's API
- File uploads are handled securely through Notion's official endpoints
- No credentials are stored permanently by the node

## Best Practices

1. **Environment Variables**: Always use environment variables for sensitive data
2. **Access Control**: Limit access to systems running this node
3. **Regular Updates**: Keep the node and its dependencies updated
4. **Monitoring**: Monitor for unusual API usage patterns
5. **Backup**: Ensure you have backups before making bulk changes

## Response Timeline

- We will acknowledge receipt of vulnerability reports within 48 hours
- We will provide a detailed response within 7 days
- We will release fixes as soon as possible, typically within 30 days

Thank you for helping keep our project secure!