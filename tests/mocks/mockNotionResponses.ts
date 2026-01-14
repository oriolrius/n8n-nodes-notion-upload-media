export const mockUploadUrlResponse = {
	signedUploadPostUrl: 'https://s3.us-west-2.amazonaws.com/secure.notion-static.com/test-upload',
	fields: {
		'Content-Type': 'image/png',
		key: 'secure.notion-static.com/test-key',
		'x-amz-credential': 'test-credential',
		'x-amz-algorithm': 'AWS4-HMAC-SHA256',
		'x-amz-date': '20240101T000000Z',
		policy: 'test-policy',
		'x-amz-signature': 'test-signature',
	},
	url: 'https://prod-files-secure.s3.us-west-2.amazonaws.com/test-space/test-block/test-file.png',
};

export const mockSaveTransactionResponse = {
	success: true,
};

export const mockLoadUserContentResponse = {
	recordMap: {
		notion_user: {
			'mock-user-id': {
				value: {
					id: 'mock-user-id',
					email: 'test@example.com',
					given_name: 'Test',
					family_name: 'User',
				},
			},
		},
	},
};

export const mockLoadPageChunkResponse = {
	recordMap: {
		block: {
			'block-1': {
				value: {
					id: 'block-1',
					type: 'image',
					properties: {
						source: [['https://example.com/image1.png']],
						title: [['test-image.png']],
						caption: [['Test caption']],
					},
					format: {
						display_source: 'https://example.com/image1.png',
						block_width: 800,
						block_height: 600,
					},
					created_time: 1704067200000,
					last_edited_time: 1704153600000,
					created_by_id: 'user-1',
					last_edited_by_id: 'user-1',
				},
			},
			'block-2': {
				value: {
					id: 'block-2',
					type: 'video',
					properties: {
						source: [['https://example.com/video1.mp4']],
						title: [['test-video.mp4']],
					},
					format: {
						display_source: 'https://example.com/video1.mp4',
					},
					created_time: 1704067200000,
					last_edited_time: 1704153600000,
					created_by_id: 'user-1',
					last_edited_by_id: 'user-1',
				},
			},
			'block-3': {
				value: {
					id: 'block-3',
					type: 'text',
					properties: {
						title: [['Just a text block']],
					},
				},
			},
		},
	},
};

export const mockQueryCollectionResponse = {
	result: {
		reducerResults: {
			collection_group_results: {
				blockIds: ['block-1', 'block-2'],
			},
		},
	},
	recordMap: {
		block: {
			'block-1': mockLoadPageChunkResponse.recordMap.block['block-1'],
			'block-2': mockLoadPageChunkResponse.recordMap.block['block-2'],
		},
	},
};
