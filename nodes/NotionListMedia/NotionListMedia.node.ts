import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { version } from '../../package.json';

export class NotionListMedia implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Notion List Media',
		name: 'notionListMedia',
		icon: 'file:notionListMedia.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: `List and retrieve media files from Notion blocks (v${version})`,
		defaults: {
			name: 'Notion List Media',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'notionUploadMediaApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Page',
						value: 'page',
					},
					{
						name: 'Database',
						value: 'database',
					},
				],
				default: 'page',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['page'],
					},
				},
				options: [
					{
						name: 'List Media',
						value: 'listMedia',
						description: 'List all media files in a Notion page',
						action: 'List media in a page',
					},
				],
				default: 'listMedia',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['database'],
					},
				},
				options: [
					{
						name: 'Query Media',
						value: 'queryMedia',
						description: 'Query media files from a Notion database',
						action: 'Query media from database',
					},
				],
				default: 'queryMedia',
			},
			{
				displayName: 'Page ID',
				name: 'pageId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['listMedia'],
					},
				},
				default: '',
				placeholder: 'e9a7c6b5-4f3b-4c7e-8a2d-1b9e8f7d6c5a',
				description: 'The ID of the Notion page to list media from',
			},
			{
				displayName: 'Database ID',
				name: 'databaseId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['database'],
						operation: ['queryMedia'],
					},
				},
				default: '',
				placeholder: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
				description: 'The ID of the Notion database to query media from',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['page', 'database'],
					},
				},
				options: [
					{
						displayName: 'Media Type Filter',
						name: 'mediaTypeFilter',
						type: 'multiOptions',
						default: [],
						options: [
							{
								name: 'Image',
								value: 'image',
							},
							{
								name: 'Video',
								value: 'video',
							},
							{
								name: 'Audio',
								value: 'audio',
							},
							{
								name: 'File',
								value: 'file',
							},
						],
						description: 'Filter results by media type',
					},
					{
						displayName: 'Include Metadata',
						name: 'includeMetadata',
						type: 'boolean',
						default: true,
						description: 'Whether to include metadata like file size, upload date, etc.',
					},
					{
						displayName: 'Max Results',
						name: 'maxResults',
						type: 'number',
						default: 100,
						description: 'Maximum number of results to return',
					},
					{
						displayName: 'Download Files',
						name: 'downloadFiles',
						type: 'boolean',
						default: false,
						description: 'Whether to download the media files as binary data',
					},
				],
			},
			{
				displayName: `Package Version: ${version}`,
				name: 'version',
				type: 'notice',
				default: '',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('notionUploadMediaApi');

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const options = this.getNodeParameter('options', i) as {
					mediaTypeFilter?: string[];
					includeMetadata?: boolean;
					maxResults?: number;
					downloadFiles?: boolean;
				};

				const baseHeaders = {
					'Cookie': `token_v2=${credentials.tokenV2};`,
					'Accept': '*/*',
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
					'Content-Type': 'application/json',
					'notion-client-version': '23.13.0',
					'x-notion-active-user-header': credentials.userId,
					'Referer': 'https://www.notion.so/',
				};

				if (resource === 'page' && operation === 'listMedia') {
					const pageId = this.getNodeParameter('pageId', i) as string;
					const cleanPageId = formatBlockId(pageId);
					
					if (!cleanPageId) {
						throw new NodeOperationError(this.getNode(), `Invalid page ID: ${pageId}`, {
							itemIndex: i,
						});
					}

					// Get page content
					const pageData = await this.helpers.httpRequest({
						method: 'POST',
						url: 'https://www.notion.so/api/v3/loadPageChunk',
						body: {
							pageId: cleanPageId,
							limit: options.maxResults || 100,
							cursor: { stack: [] },
							chunkNumber: 0,
							verticalColumns: false,
						},
						json: true,
						headers: baseHeaders,
					});

					// Extract media blocks
					const mediaItems = extractMediaFromBlocks(
						pageData.recordMap?.block || {},
						options.mediaTypeFilter || [],
						options.includeMetadata !== false
					);

					// Download files if requested
					if (options.downloadFiles) {
						for (const mediaItem of mediaItems) {
							if (mediaItem.url) {
								try {
									// Download the file
									const response = await this.helpers.httpRequest({
										method: 'GET',
										url: mediaItem.url,
										encoding: 'arraybuffer',
										returnFullResponse: true,
									});
									
									const binaryData = Buffer.from(response.body);
									
									mediaItem.binary = {
										data: binaryData.toString('base64'),
										mimeType: mediaItem.mimeType || response.headers['content-type'] || 'application/octet-stream',
										fileName: mediaItem.fileName || 'media',
									};
								} catch (error) {
									console.error(`Failed to download media: ${mediaItem.url}`, error instanceof Error ? error.message : String(error));
								}
							}
						}
					}

					returnData.push(...mediaItems.map(item => ({ json: item })));

				} else if (resource === 'database' && operation === 'queryMedia') {
					const databaseId = this.getNodeParameter('databaseId', i) as string;
					const cleanDatabaseId = formatBlockId(databaseId);
					
					if (!cleanDatabaseId) {
						throw new NodeOperationError(this.getNode(), `Invalid database ID: ${databaseId}`, {
							itemIndex: i,
						});
					}

					// Query database
					const databaseData = await this.helpers.httpRequest({
						method: 'POST',
						url: 'https://www.notion.so/api/v3/queryCollection',
						body: {
							collectionId: cleanDatabaseId,
							collectionViewId: '',
							query: {
								filter: {},
								sort: [],
							},
							loader: {
								type: 'reducer',
								reducers: {
									collection_group_results: {
										type: 'results',
										limit: options.maxResults || 100,
									},
								},
							},
						},
						json: true,
						headers: baseHeaders,
					});

					// Extract media from database results
					const mediaItems = extractMediaFromDatabase(
						databaseData,
						options.mediaTypeFilter || [],
						options.includeMetadata !== false
					);

					returnData.push(...mediaItems.map(item => ({ json: item })));
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// Helper function to format block IDs (reused from upload node)
function formatBlockId(blockId: string): string | null {
	if (!blockId || typeof blockId !== 'string') {
		return null;
	}

	let cleanedStr = blockId.trim().toLowerCase();
	cleanedStr = cleanedStr.replace(/[^a-f0-9-]/g, '');

	if (cleanedStr.includes('-')) {
		return cleanedStr;
	}

	const uuidMatch = cleanedStr.match(/^([a-f0-9]{32})$/);
	if (!uuidMatch) {
		return null;
	}

	const raw = uuidMatch[1];
	return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

// Extract media from page blocks
function extractMediaFromBlocks(blocks: any, typeFilter: string[], includeMetadata: boolean): any[] {
	const mediaItems: any[] = [];

	for (const blockId in blocks) {
		const block = blocks[blockId]?.value;
		if (!block) continue;

		// Check for media blocks
		if (block.type && ['image', 'video', 'audio', 'file', 'pdf'].includes(block.type)) {
			const mediaType = getMediaType(block.type);
			
			// Apply type filter
			if (typeFilter.length > 0 && !typeFilter.includes(mediaType)) {
				continue;
			}

			const mediaItem: any = {
				id: block.id,
				type: mediaType,
				blockType: block.type,
			};

			// Extract URL
			if (block.format?.display_source) {
				mediaItem.url = block.format.display_source;
			} else if (block.properties?.source?.[0]?.[0]) {
				mediaItem.url = block.properties.source[0][0];
			}

			// Extract metadata if requested
			if (includeMetadata) {
				mediaItem.metadata = {
					createdTime: block.created_time,
					lastEditedTime: block.last_edited_time,
					createdBy: block.created_by_id,
					lastEditedBy: block.last_edited_by_id,
				};

				// Extract caption
				if (block.properties?.caption?.[0]?.[0]) {
					mediaItem.metadata.caption = block.properties.caption[0][0];
				}

				// Extract filename
				if (block.properties?.title?.[0]?.[0]) {
					mediaItem.fileName = block.properties.title[0][0];
				}

				// Extract size if available
				if (block.format?.block_width) {
					mediaItem.metadata.width = block.format.block_width;
				}
				if (block.format?.block_height) {
					mediaItem.metadata.height = block.format.block_height;
				}
			}

			mediaItems.push(mediaItem);
		}
	}

	return mediaItems;
}

// Extract media from database query results
function extractMediaFromDatabase(databaseData: any, typeFilter: string[], includeMetadata: boolean): any[] {
	const mediaItems: any[] = [];
	
	// Extract from collection results
	const results = databaseData.result?.reducerResults?.collection_group_results?.blockIds || [];
	const blocks = databaseData.recordMap?.block || {};

	for (const blockId of results) {
		const mediaFromBlock = extractMediaFromBlocks({ [blockId]: blocks[blockId] }, typeFilter, includeMetadata);
		mediaItems.push(...mediaFromBlock);
	}

	return mediaItems;
}

// Determine media type from block type
function getMediaType(blockType: string): string {
	switch (blockType) {
		case 'image':
			return 'image';
		case 'video':
			return 'video';
		case 'audio':
			return 'audio';
		case 'file':
		case 'pdf':
		default:
			return 'file';
	}
}