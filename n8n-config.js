// Patch n8n to support large file uploads
const Module = require('module');
const originalRequire = Module.prototype.require;

// Override the body-parser and raw-body modules
Module.prototype.require = function(id) {
    const result = originalRequire.call(this, id);
    
    if (id === 'raw-body') {
        // Return a patched version of raw-body that supports larger files
        return function(stream, options = {}) {
            // Set limit to 4GB if not specified or if it's smaller
            if (!options.limit || parseLimit(options.limit) < parseLimit('4gb')) {
                options.limit = '4gb';
            }
            return result(stream, options);
        };
    }
    
    if (id === 'body-parser') {
        // Patch body-parser to use larger limits
        const bodyParser = result;
        const originalJson = bodyParser.json;
        const originalRaw = bodyParser.raw;
        const originalText = bodyParser.text;
        const originalUrlencoded = bodyParser.urlencoded;
        
        bodyParser.json = function(options = {}) {
            options.limit = options.limit || '4gb';
            return originalJson(options);
        };
        
        bodyParser.raw = function(options = {}) {
            options.limit = options.limit || '4gb';
            return originalRaw(options);
        };
        
        bodyParser.text = function(options = {}) {
            options.limit = options.limit || '4gb';
            return originalText(options);
        };
        
        bodyParser.urlencoded = function(options = {}) {
            options.limit = options.limit || '4gb';
            return originalUrlencoded(options);
        };
    }
    
    return result;
};

// Helper function to parse size limits
function parseLimit(limit) {
    if (typeof limit === 'number') return limit;
    if (typeof limit !== 'string') return 0;
    
    const match = limit.match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
        case 'b': return value;
        case 'kb': return value * 1024;
        case 'mb': return value * 1024 * 1024;
        case 'gb': return value * 1024 * 1024 * 1024;
        default: return 0;
    }
}
