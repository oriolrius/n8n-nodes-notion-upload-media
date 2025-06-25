# Notion Upload Media - Video Upload Example

This directory contains an example workflow demonstrating how to use the Notion Upload Media custom node for uploading video files (.mp4).

## Files

### my-workflow.json

Example workflow for uploading video files to Notion. This workflow demonstrates:

- Manual trigger to start the workflow
- Reading a video file (.mp4) from disk
- Uploading the video to a Notion block using the custom node

## Setup Instructions

1. **Import the workflow**: Copy the content of `my-workflow.json` and import it into your n8n instance.

2. **Configure file paths**: Update the `fileSelector` parameter in the "Read/Write Files from Disk" node to point to your actual .mp4 video file.

3. **Set up credentials**:
   - Create a new credential of type "Notion Upload Media API"
   - Replace `YOUR_CREDENTIAL_ID` with your actual credential ID
   - Update the credential name if needed

4. **Configure Notion Block ID**:
   - Replace `YOUR_NOTION_BLOCK_ID_HERE` with the actual Notion block ID where you want to upload the video
   - You can get this ID from the Notion page URL or by inspecting the block

## Node Configuration

### Required Parameters

- `blockId`: The ID of the Notion block where the video will be uploaded
- File input: Provided by the "Read/Write Files from Disk" node (must be .mp4 format)

### Optional Parameters

- `options`: Additional configuration options for the upload

## Notes

- This example is specifically designed for .mp4 video files
- Make sure you have the proper permissions to upload media to the specified Notion block
- The custom node uses version 2 of the typeVersion
- This example uses placeholder values for sensitive information like credentials and block IDs
- Ensure your video file is accessible from the n8n instance
