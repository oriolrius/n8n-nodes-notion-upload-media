import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NotionUploadMediaApi implements ICredentialType {
	name = 'notionUploadMediaApi';
	displayName = 'Notion Upload Media API';
	documentationUrl = 'https://developers.notion.com/docs/authorization';
	properties: INodeProperties[] = [
		{
			displayName: 'Token V2',
			name: 'tokenV2',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Notion token_v2 cookie value. You can find this in your browser\'s developer tools when logged into Notion.',
		},
		{
			displayName: 'Space ID',
			name: 'spaceId',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Notion workspace space ID. This can be found in the URL or browser developer tools.',
		},
		{
			displayName: 'User ID',
			name: 'userId',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Notion user ID. This can be found in your browser\'s developer tools when logged into Notion.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Cookie': '=token_v2={{$credentials.tokenV2}};',
				'Accept': '*/*',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
				'Content-Type': 'application/json',
				'notion-client-version': '23.13.0.2800',
				'x-notion-active-user-header': '={{$credentials.userId}}',
				'Referer': 'https://www.notion.so/',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://www.notion.so/api/v3',
			url: '/loadUserContent',
			method: 'POST',
			body: {},
		},
	};
}
