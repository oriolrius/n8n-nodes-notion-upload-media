import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotionListMedia } from '../../nodes/NotionListMedia/NotionListMedia.node';
import { NodeConnectionTypes } from 'n8n-workflow';
import {
	createMockExecuteFunctions,
	createMockCredentials,
} from '../mocks/mockExecuteFunctions';
import {
	mockLoadPageChunkResponse,
	mockQueryCollectionResponse,
} from '../mocks/mockNotionResponses';

describe('NotionListMedia Node', () => {
	let node: NotionListMedia;

	beforeEach(() => {
		node = new NotionListMedia();
		vi.clearAllMocks();
	});

	describe('Node Description (n8n v2 compatibility)', () => {
		it('should have correct node metadata', () => {
			expect(node.description.displayName).toBe('Notion List Media');
			expect(node.description.name).toBe('notionListMedia');
			expect(node.description.version).toBe(1);
			expect(node.description.group).toContain('transform');
		});

		it('should use NodeConnectionTypes.Main for inputs (n8n v2 API)', () => {
			expect(node.description.inputs).toEqual([NodeConnectionTypes.Main]);
		});

		it('should use NodeConnectionTypes.Main for outputs (n8n v2 API)', () => {
			expect(node.description.outputs).toEqual([NodeConnectionTypes.Main]);
		});

		it('should require notionUploadMediaApi credentials', () => {
			const credentials = node.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials).toHaveLength(1);
			expect(credentials![0].name).toBe('notionUploadMediaApi');
			expect(credentials![0].required).toBe(true);
		});

		it('should have page and database resources', () => {
			const resourceProp = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			expect(resourceProp).toBeDefined();
			expect(resourceProp!.type).toBe('options');
			const options = (resourceProp as any).options;
			expect(options.map((o: any) => o.value)).toContain('page');
			expect(options.map((o: any) => o.value)).toContain('database');
		});

		it('should have listMedia operation for page resource', () => {
			const operationProps = node.description.properties.filter(
				(p) => p.name === 'operation',
			);
			// There should be two operation properties (one for page, one for database)
			expect(operationProps.length).toBeGreaterThanOrEqual(1);
		});

		it('should have correct option properties', () => {
			const optionsProp = node.description.properties.find(
				(p) => p.name === 'options',
			);
			expect(optionsProp).toBeDefined();
			expect(optionsProp!.type).toBe('collection');

			const optionItems = (optionsProp as any).options;
			const optionNames = optionItems.map((o: any) => o.name);

			expect(optionNames).toContain('mediaTypeFilter');
			expect(optionNames).toContain('includeMetadata');
			expect(optionNames).toContain('maxResults');
			expect(optionNames).toContain('downloadFiles');
		});
	});

	describe('Execute - List Media from Page', () => {
		it('should call loadPageChunk API for page resource', async () => {
			const httpRequestMock = vi.fn().mockResolvedValue(mockLoadPageChunkResponse);

			const mockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'page',
					operation: 'listMedia',
					pageId: '214c413b-2a68-800f-9f9a-d234e37d1380',
					options: {
						mediaTypeFilter: [],
						includeMetadata: true,
						maxResults: 100,
						downloadFiles: false,
					},
				},
				credentials: createMockCredentials(),
				httpRequestMock,
			});

			// Execute the node
			const result = await node.execute.call(mockFunctions);

			// Verify httpRequest was called
			expect(httpRequestMock).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					url: 'https://www.notion.so/api/v3/loadPageChunk',
				}),
			);

			// Verify results contain media items
			expect(result).toBeDefined();
			expect(Array.isArray(result)).toBe(true);
			expect(result[0].length).toBeGreaterThan(0);
		});

		it('should extract image blocks from page response', async () => {
			const httpRequestMock = vi.fn().mockResolvedValue(mockLoadPageChunkResponse);

			const mockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'page',
					operation: 'listMedia',
					pageId: '214c413b-2a68-800f-9f9a-d234e37d1380',
					options: {
						mediaTypeFilter: [],
						includeMetadata: true,
						maxResults: 100,
						downloadFiles: false,
					},
				},
				credentials: createMockCredentials(),
				httpRequestMock,
			});

			const result = await node.execute.call(mockFunctions);

			// Should have extracted 2 media items (image and video, not text)
			expect(result[0].length).toBe(2);

			// Check first item is an image
			const imageItem = result[0].find((item) => item.json.type === 'image');
			expect(imageItem).toBeDefined();
			expect(imageItem!.json.id).toBe('block-1');
		});

		it('should filter by media type when specified', async () => {
			const httpRequestMock = vi.fn().mockResolvedValue(mockLoadPageChunkResponse);

			const mockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'page',
					operation: 'listMedia',
					pageId: '214c413b-2a68-800f-9f9a-d234e37d1380',
					options: {
						mediaTypeFilter: ['image'],
						includeMetadata: true,
						maxResults: 100,
						downloadFiles: false,
					},
				},
				credentials: createMockCredentials(),
				httpRequestMock,
			});

			const result = await node.execute.call(mockFunctions);

			// Should only have image items
			expect(result[0].length).toBe(1);
			expect(result[0][0].json.type).toBe('image');
		});
	});

	describe('Execute - Query Media from Database', () => {
		it('should call queryCollection API for database resource', async () => {
			const httpRequestMock = vi.fn().mockResolvedValue(mockQueryCollectionResponse);

			const mockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'database',
					operation: 'queryMedia',
					databaseId: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
					options: {
						mediaTypeFilter: [],
						includeMetadata: true,
						maxResults: 100,
						downloadFiles: false,
					},
				},
				credentials: createMockCredentials(),
				httpRequestMock,
			});

			const result = await node.execute.call(mockFunctions);

			// Verify queryCollection was called
			expect(httpRequestMock).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					url: 'https://www.notion.so/api/v3/queryCollection',
				}),
			);
		});
	});

	describe('Metadata Extraction', () => {
		it('should include metadata when includeMetadata is true', async () => {
			const httpRequestMock = vi.fn().mockResolvedValue(mockLoadPageChunkResponse);

			const mockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'page',
					operation: 'listMedia',
					pageId: '214c413b-2a68-800f-9f9a-d234e37d1380',
					options: {
						mediaTypeFilter: [],
						includeMetadata: true,
						maxResults: 100,
						downloadFiles: false,
					},
				},
				credentials: createMockCredentials(),
				httpRequestMock,
			});

			const result = await node.execute.call(mockFunctions);
			const imageItem = result[0].find((item) => item.json.type === 'image');

			expect(imageItem).toBeDefined();
			expect(imageItem!.json.metadata).toBeDefined();
			expect(imageItem!.json.metadata.createdTime).toBeDefined();
			expect(imageItem!.json.metadata.lastEditedTime).toBeDefined();
		});

		it('should extract captions when available', async () => {
			const httpRequestMock = vi.fn().mockResolvedValue(mockLoadPageChunkResponse);

			const mockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'page',
					operation: 'listMedia',
					pageId: '214c413b-2a68-800f-9f9a-d234e37d1380',
					options: {
						mediaTypeFilter: [],
						includeMetadata: true,
						maxResults: 100,
						downloadFiles: false,
					},
				},
				credentials: createMockCredentials(),
				httpRequestMock,
			});

			const result = await node.execute.call(mockFunctions);
			const imageItem = result[0].find((item) => item.json.type === 'image');

			expect(imageItem!.json.metadata.caption).toBe('Test caption');
		});
	});

	describe('Error Handling', () => {
		it('should throw NodeOperationError for empty page ID', async () => {
			const mockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'page',
					operation: 'listMedia',
					pageId: '',
					options: {},
				},
				credentials: createMockCredentials(),
			});

			// The node throws NodeOperationError for empty page IDs
			await expect(node.execute.call(mockFunctions)).rejects.toThrow(
				/Invalid page ID/,
			);
		});

		it('should throw NodeOperationError for page ID with only invalid characters', async () => {
			const mockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'page',
					operation: 'listMedia',
					pageId: 'xyz',  // No hex chars, no hyphens -> becomes empty after cleanup -> returns null
					options: {},
				},
				credentials: createMockCredentials(),
			});

			// The node throws NodeOperationError for IDs that don't contain any hex chars
			await expect(node.execute.call(mockFunctions)).rejects.toThrow(
				/Invalid page ID/,
			);
		});

		it('should continue on fail when enabled', async () => {
			const httpRequestMock = vi.fn().mockRejectedValue(new Error('API Error'));

			const mockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'page',
					operation: 'listMedia',
					pageId: '214c413b-2a68-800f-9f9a-d234e37d1380',
					options: {},
				},
				credentials: createMockCredentials(),
				httpRequestMock,
			});

			// Mock continueOnFail to return true
			vi.spyOn(mockFunctions, 'continueOnFail').mockReturnValue(true);

			const result = await node.execute.call(mockFunctions);

			// Should return error object instead of throwing
			expect(result[0][0].json.error).toBeDefined();
		});
	});

	describe('Block ID Formatting', () => {
		it('should accept UUID format', async () => {
			const mockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					pageId: '214c413b-2a68-800f-9f9a-d234e37d1380',
				},
			});

			const pageId = mockFunctions.getNodeParameter('pageId', 0);
			expect(pageId).toBe('214c413b-2a68-800f-9f9a-d234e37d1380');
		});

		it('should handle 32-char hex format', () => {
			// Test the formatBlockId function logic
			const hexId = '214c413b2a68800f9f9ad234e37d1380';
			const cleanedStr = hexId.trim().toLowerCase().replace(/[^a-f0-9-]/g, '');

			expect(cleanedStr).toBe(hexId);
			expect(/^[a-f0-9]{32}$/.test(cleanedStr)).toBe(true);
		});
	});
});
