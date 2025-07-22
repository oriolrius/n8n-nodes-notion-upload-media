-- Script to update test workflow with new video file and block ID
-- Run with: sqlite3 ~/.n8n/database.sqlite < update-test-workflow.sql

-- First, let's see what workflows exist
SELECT id, name FROM workflow WHERE name LIKE '%notion%' OR name LIKE '%test%' OR name LIKE '%upload%';

-- Update the workflow (you'll need to replace WORKFLOW_ID with the actual ID from above)
-- This assumes the workflow structure matches the example
UPDATE workflow 
SET nodes = json_set(
    json_set(
        nodes,
        '$[1].parameters.fileSelector',
        '/home/oriol/incoming/GMT20250721-132747_Recording_4704x1986.mp4'
    ),
    '$[2].parameters.blockId',
    '238c413b2a68814fb35de98e4352ce03'
)
WHERE id = 'WORKFLOW_ID';  -- Replace WORKFLOW_ID with actual ID

-- Verify the update
SELECT id, name, json_extract(nodes, '$[1].parameters.fileSelector') as video_file, 
       json_extract(nodes, '$[2].parameters.blockId') as block_id 
FROM workflow 
WHERE id = 'WORKFLOW_ID';  -- Replace WORKFLOW_ID with actual ID