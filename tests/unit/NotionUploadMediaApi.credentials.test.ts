import { describe, it, expect } from 'vitest';
import { NotionUploadMediaApi } from '../../credentials/NotionUploadMediaApi.credentials';

describe('NotionUploadMediaApi Credentials', () => {
	let credentials: NotionUploadMediaApi;

	beforeEach(() => {
		credentials = new NotionUploadMediaApi();
	});

	describe('Credential Metadata', () => {
		it('should have correct name', () => {
			expect(credentials.name).toBe('notionUploadMediaApi');
		});

		it('should have correct display name', () => {
			expect(credentials.displayName).toBe('Notion Upload Media API');
		});

		it('should link to Notion authorization docs', () => {
			expect(credentials.documentationUrl).toBe(
				'https://developers.notion.com/docs/authorization',
			);
		});
	});

	describe('Credential Properties', () => {
		it('should have tokenV2 property', () => {
			const tokenProp = credentials.properties.find((p) => p.name === 'tokenV2');
			expect(tokenProp).toBeDefined();
			expect(tokenProp!.type).toBe('string');
			expect(tokenProp!.required).toBe(true);
			expect((tokenProp as any).typeOptions?.password).toBe(true);
		});

		it('should have spaceId property', () => {
			const spaceProp = credentials.properties.find((p) => p.name === 'spaceId');
			expect(spaceProp).toBeDefined();
			expect(spaceProp!.type).toBe('string');
			expect(spaceProp!.required).toBe(true);
		});

		it('should have userId property', () => {
			const userProp = credentials.properties.find((p) => p.name === 'userId');
			expect(userProp).toBeDefined();
			expect(userProp!.type).toBe('string');
			expect(userProp!.required).toBe(true);
		});

		it('should have exactly 3 required properties', () => {
			expect(credentials.properties).toHaveLength(3);
			expect(credentials.properties.every((p) => p.required)).toBe(true);
		});
	});

	describe('Authentication Configuration', () => {
		it('should use generic authentication type', () => {
			expect(credentials.authenticate.type).toBe('generic');
		});

		it('should set Cookie header with token_v2', () => {
			const headers = credentials.authenticate.properties.headers;
			expect(headers).toBeDefined();
			expect(headers!['Cookie']).toContain('token_v2');
			expect(headers!['Cookie']).toContain('{{$credentials.tokenV2}}');
		});

		it('should set notion-client-version header', () => {
			const headers = credentials.authenticate.properties.headers;
			expect(headers!['notion-client-version']).toBeDefined();
			expect(headers!['notion-client-version']).toMatch(/^\d+\.\d+\.\d+/);
		});

		it('should set x-notion-active-user-header with userId', () => {
			const headers = credentials.authenticate.properties.headers;
			expect(headers!['x-notion-active-user-header']).toContain(
				'{{$credentials.userId}}',
			);
		});

		it('should set proper Content-Type', () => {
			const headers = credentials.authenticate.properties.headers;
			expect(headers!['Content-Type']).toBe('application/json');
		});

		it('should set Referer to notion.so', () => {
			const headers = credentials.authenticate.properties.headers;
			expect(headers!['Referer']).toBe('https://www.notion.so/');
		});

		it('should include User-Agent header', () => {
			const headers = credentials.authenticate.properties.headers;
			expect(headers!['User-Agent']).toBeDefined();
			expect(headers!['User-Agent']).toContain('Mozilla');
		});
	});

	describe('Credential Test Configuration', () => {
		it('should test against Notion API v3', () => {
			expect(credentials.test.request.baseURL).toBe('https://www.notion.so/api/v3');
		});

		it('should test using loadUserContent endpoint', () => {
			expect(credentials.test.request.url).toBe('/loadUserContent');
		});

		it('should use POST method for test', () => {
			expect(credentials.test.request.method).toBe('POST');
		});

		it('should send empty body for test', () => {
			expect(credentials.test.request.body).toEqual({});
		});
	});

	describe('Security Considerations', () => {
		it('should mark tokenV2 as password field', () => {
			const tokenProp = credentials.properties.find((p) => p.name === 'tokenV2');
			expect((tokenProp as any).typeOptions?.password).toBe(true);
		});

		it('should have description warning about browser extraction', () => {
			const tokenProp = credentials.properties.find((p) => p.name === 'tokenV2');
			expect(tokenProp!.description).toContain('browser');
			expect(tokenProp!.description).toContain('developer tools');
		});
	});
});
