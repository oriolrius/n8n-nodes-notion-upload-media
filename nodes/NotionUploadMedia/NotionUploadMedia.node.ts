import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

import FormData from 'form-data';
import { request } from 'https';
import { URL } from 'url';
import { version } from '../../package.json';

export class NotionUploadMedia implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Notion Upload Media',
		name: 'notionUploadMedia',
		icon: 'file:notionUploadMedia.svg',
		group: ['transform'],
		version: 2,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: `Upload media files to Notion blocks (v${version})`,
		defaults: {
			name: 'Notion Upload Media',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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
						name: 'Block',
						value: 'block',
					},
				],
				default: 'block',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['block'],
					},
				},
				options: [
					{
						name: 'Upload Media',
						value: 'uploadMedia',
						description: 'Upload a media file to a Notion block',
						action: 'Upload media to a block',
					},
				],
				default: 'uploadMedia',
			},
			{
				displayName: 'Block ID',
				name: 'blockId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['block'],
						operation: ['uploadMedia'],
					},
				},
				default: '',
				placeholder: '214c413b-2a68-800f-9f9a-d234e37d1380',
				description: 'The ID of the Notion block where the media will be uploaded. Can be extracted from the block URL.',
			},
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['block'],
						operation: ['uploadMedia'],
					},
				},
				default: 'data',
				description: 'Name of the binary property containing the media file to upload',
			},
			{
				displayName: 'Media Type',
				name: 'mediaType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['block'],
						operation: ['uploadMedia'],
					},
				},
				options: [
					{
						name: 'Auto-Detect',
						value: 'auto',
						description: 'Automatically detect media type from file MIME type',
					},
					{
						name: 'Image',
						value: 'image',
						description: 'Force upload as image',
					},
					{
						name: 'Video',
						value: 'video',
						description: 'Force upload as video',
					},
				],
				default: 'auto',
				description: 'Type of media to upload',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['block'],
						operation: ['uploadMedia'],
					},
				},
				options: [
					{
						displayName: 'File Name',
						name: 'fileName',
						type: 'string',
						default: '',
						description: 'Custom file name for the uploaded media. If not specified, the original file name will be used.',
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

				if (resource === 'block' && operation === 'uploadMedia') {
					const blockId = this.getNodeParameter('blockId', i) as string;
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const mediaType = this.getNodeParameter('mediaType', i) as string;
					const options = this.getNodeParameter('options', i) as { fileName?: string };

					// Clean and format block ID
					const cleanBlockId = formatBlockId(blockId);
					if (!cleanBlockId) {
						throw new NodeOperationError(this.getNode(), `Invalid block ID: ${blockId}`, {
							itemIndex: i,
						});
					}

					// Get binary data
					const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
					
					// Use n8n helper to get buffer - handles both memory and filesystem modes
					const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
					
					// Check if buffer is empty
					if (!fileBuffer || fileBuffer.length === 0) {
						throw new NodeOperationError(this.getNode(), 'Binary data is empty or could not be retrieved', {
							itemIndex: i,
						});
					}
					
					// Log buffer size for debugging
					console.log(`[NotionUploadMedia] Buffer size: ${fileBuffer.length} bytes`);
					
					const fileName = options.fileName || binaryData.fileName || 'media';
					const mimeType = binaryData.mimeType || 'application/octet-stream';

					// Determine block type based on media type and MIME type
					let blockType: string;
					if (mediaType === 'auto') {
						blockType = mimeType.startsWith('video/') ? 'video' : 'image';
					} else {
						blockType = mediaType;
					}

					// Upload media file to Notion
					const result = await uploadMediaToNotionBlock(
						this,
						fileBuffer,
						fileName,
						mimeType,
						cleanBlockId,
						blockType,
						credentials,
					);

					returnData.push({
						json: {
							success: true,
							blockId: cleanBlockId,
							mediaUrl: result.mediaUrl,
							fileName,
							blockType,
							size: result.size,
							message: 'Media uploaded successfully to Notion block',
						},
						pairedItem: {
							item: i,
						},
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
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

function formatBlockId(input: string): string | null {
	// Remove hyphens and handle both URL and direct ID cases
	const cleanedStr = input.replace(/-/g, '');
	
	let raw: string;
	
	// If it's a URL, extract the ID part
	if (input.includes('/')) {
		const match = cleanedStr.match(/([a-f0-9]{32})$/);
		if (!match) {
			return null;
		}
		raw = match[1];
	} else {
		// If it's just an ID, ensure it's 32 chars of hex
		if (!/^[a-f0-9]{32}$/.test(cleanedStr)) {
			return null;
		}
		raw = cleanedStr;
	}

	// Format as UUID: 8-4-4-4-12
	return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

async function uploadMediaToNotionBlock(
	executeFunctions: IExecuteFunctions,
	fileBuffer: Buffer,
	fileName: string,
	mimeType: string,
	blockId: string,
	blockType: string,
	credentials: any,
): Promise<{ mediaUrl: string; size: string }> {
	const baseHeaders = {
		'Cookie': `token_v2=${credentials.tokenV2};`,
		'Accept': '*/*',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
		'Content-Type': 'application/json',
		'notion-client-version': '23.13.0.2800',
		'x-notion-active-user-header': credentials.userId,
		'Referer': 'https://www.notion.so/',
	};

	// Step 1: Get upload URL
	const uploadUrlPayload = {
		bucket: 'secure',
		name: fileName,
		contentType: mimeType,
		record: {
			table: 'block',
			id: blockId,
			spaceId: credentials.spaceId,
		},
		supportExtraHeaders: true,
		contentLength: fileBuffer.length,
	};

	const uploadUrlResponse = await executeFunctions.helpers.httpRequest({
		method: 'POST',
		url: 'https://www.notion.so/api/v3/getUploadFileUrl',
		body: uploadUrlPayload,
		json: true,
		headers: baseHeaders,
		timeout: 300000, // 5 minutes timeout for large files
	});

	const signedUploadUrl = uploadUrlResponse.signedUploadPostUrl;
	const s3Fields = uploadUrlResponse.fields || {};
	const finalAttachmentUrl = uploadUrlResponse.url;

	if (!signedUploadUrl || !finalAttachmentUrl) {
		throw new NodeOperationError(executeFunctions.getNode(), 'Failed to get upload URL from Notion');
	}

	// Step 2: Upload to S3 with custom large file handling
	const formData = new FormData();
	
	// Add S3 fields first
	Object.entries(s3Fields).forEach(([key, value]) => {
		formData.append(key, value as string);
	});
	
	// Add file last - ensure buffer is not corrupted
	console.log(`[NotionUploadMedia] Uploading buffer of size: ${fileBuffer.length} bytes`);
	formData.append('file', fileBuffer, {
		filename: fileName,
		contentType: mimeType,
	});

	await uploadLargeFileToS3(signedUploadUrl, formData);

	// Step 3: Update Notion block with media info
	const requestId = generateUUID();
	const transactionId = generateUUID();
	const currentTimestamp = Date.now();
	const fileSizeKb = `${(fileBuffer.length / 1024).toFixed(1)}KB`;

	const saveTransactionPayload = {
		requestId,
		transactions: [
			{
				id: transactionId,
				spaceId: credentials.spaceId,
				debug: { userAction: 'N8nMediaUpload' },
				operations: [
					{
						pointer: {
							table: 'block',
							id: blockId,
							spaceId: credentials.spaceId,
						},
						path: ['properties'],
						command: 'update',
						args: {
							source: [[finalAttachmentUrl]],
							size: [[fileSizeKb]],
						},
					},
					{
						pointer: {
							table: 'block',
							id: blockId,
							spaceId: credentials.spaceId,
						},
						path: ['properties', 'title'],
						command: 'set',
						args: [[fileName]],
					},
					{
						pointer: {
							table: 'block',
							id: blockId,
							spaceId: credentials.spaceId,
						},
						path: ['format'],
						command: 'update',
						args: { display_source: finalAttachmentUrl },
					},
					{
						pointer: {
							table: 'block',
							id: blockId,
							spaceId: credentials.spaceId,
						},
						path: [],
						command: 'update',
						args: { type: blockType },
					},
					{
						pointer: {
							table: 'block',
							id: blockId,
							spaceId: credentials.spaceId,
						},
						path: [],
						command: 'update',
						args: {
							last_edited_time: currentTimestamp,
							last_edited_by_id: credentials.userId,
							last_edited_by_table: 'notion_user',
						},
					},
				],
			},
		],
	};

	await executeFunctions.helpers.httpRequest({
		method: 'POST',
		url: 'https://www.notion.so/api/v3/saveTransactionsFanout',
		body: saveTransactionPayload,
		json: true,
		headers: baseHeaders,
	});

	return {
		mediaUrl: finalAttachmentUrl,
		size: fileSizeKb,
	};
}

function generateUUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

async function uploadLargeFileToS3(signedUploadUrl: string, formData: FormData): Promise<void> {
	return new Promise((resolve, reject) => {
		// Get the content length from FormData
		formData.getLength((err, length) => {
			if (err) {
				reject(err);
				return;
			}

			const url = new URL(signedUploadUrl);
			const headers = formData.getHeaders();
			
			// Add Content-Length header
			headers['Content-Length'] = length.toString();

			const options = {
				hostname: url.hostname,
				port: url.port || 443,
				path: url.pathname + url.search,
				method: 'POST',
				headers: headers,
			};

			const req = request(options, (res) => {
				let responseBody = '';
				
				res.on('data', (chunk) => {
					responseBody += chunk;
				});
				
				res.on('end', () => {
					if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
						resolve();
					} else {
						console.error(`[NotionUploadMedia] Upload failed with status: ${res.statusCode}, body: ${responseBody}`);
						reject(new Error(`Upload failed with status: ${res.statusCode}`));
					}
				});
			});

			req.on('error', reject);
			
			// Pipe the form data to the request
			formData.pipe(req);
		});
	});
}
