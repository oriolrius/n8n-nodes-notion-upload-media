import type {
	ICredentialDataDecryptedObject,
	IDataObject,
	IExecuteFunctions,
	INode,
	INodeExecutionData,
	IHttpRequestOptions,
	IBinaryData,
} from 'n8n-workflow';
import { vi } from 'vitest';

export interface MockExecuteFunctionsOptions {
	nodeParameters?: Record<string, unknown>;
	credentials?: ICredentialDataDecryptedObject;
	inputData?: INodeExecutionData[];
	binaryData?: Record<string, IBinaryData>;
	httpRequestMock?: (options: IHttpRequestOptions) => Promise<unknown>;
}

export function createMockExecuteFunctions(
	options: MockExecuteFunctionsOptions = {},
): IExecuteFunctions {
	const {
		nodeParameters = {},
		credentials = {},
		inputData = [{ json: {} }],
		binaryData = {},
		httpRequestMock,
	} = options;

	const mockNode: INode = {
		id: 'test-node-id',
		name: 'Test Node',
		type: 'n8n-nodes-notion-upload-media.notionUploadMedia',
		typeVersion: 2,
		position: [0, 0],
		parameters: nodeParameters as IDataObject,
	};

	// Merge binary data into input data
	const inputDataWithBinary = inputData.map((item, index) => ({
		...item,
		binary: index === 0 ? binaryData : item.binary,
	}));

	const mockExecuteFunctions: Partial<IExecuteFunctions> = {
		getInputData: vi.fn().mockReturnValue(inputDataWithBinary),

		getNodeParameter: vi.fn((paramName: string, itemIndex: number, fallback?: unknown) => {
			const value = nodeParameters[paramName];
			return value !== undefined ? value : fallback;
		}) as IExecuteFunctions['getNodeParameter'],

		getCredentials: vi.fn().mockResolvedValue(credentials),

		getNode: vi.fn().mockReturnValue(mockNode),

		continueOnFail: vi.fn().mockReturnValue(false),

		helpers: {
			assertBinaryData: vi.fn((itemIndex: number, propertyName: string) => {
				const binary = binaryData[propertyName];
				if (!binary) {
					throw new Error(`No binary data found for property "${propertyName}"`);
				}
				return binary;
			}),

			getBinaryDataBuffer: vi.fn(async (itemIndex: number, propertyName: string) => {
				const binary = binaryData[propertyName];
				if (!binary) {
					throw new Error(`No binary data found for property "${propertyName}"`);
				}
				// Decode base64 data to buffer
				if (binary.data) {
					return Buffer.from(binary.data, 'base64');
				}
				return Buffer.from([]);
			}),

			httpRequest: httpRequestMock
				? vi.fn(httpRequestMock)
				: vi.fn().mockResolvedValue({}),

			prepareBinaryData: vi.fn(async (binaryBuffer: Buffer, fileName?: string, mimeType?: string) => ({
				data: binaryBuffer.toString('base64'),
				fileName: fileName || 'file',
				mimeType: mimeType || 'application/octet-stream',
			})),

			returnJsonArray: vi.fn((items: IDataObject[]) =>
				items.map((item) => ({ json: item })),
			),
		} as unknown as IExecuteFunctions['helpers'],
	};

	return mockExecuteFunctions as IExecuteFunctions;
}

export function createMockBinaryData(
	content: string | Buffer,
	fileName: string = 'test-file.png',
	mimeType: string = 'image/png',
): IBinaryData {
	const buffer = typeof content === 'string' ? Buffer.from(content) : content;
	return {
		data: buffer.toString('base64'),
		fileName,
		mimeType,
	};
}

export function createMockCredentials(): ICredentialDataDecryptedObject {
	return {
		tokenV2: 'mock-token-v2-value',
		spaceId: 'mock-space-id-12345678',
		userId: 'mock-user-id-12345678',
	};
}
