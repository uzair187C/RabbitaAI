const getMCPConfig = () => {
  return {
    type: 'url',
    url: process.env.MONGODB_MCP_URL || 'https://mcp.mongodb.com',
    name: 'mongodb-mcp',
  };
};

const getMongoTools = () => {
  return [
    {
      name: 'findRequests',
      description: 'Find requests by status or userId.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'The status of the requests to find.' },
          userId: { type: 'string', description: 'The userId of the requests to find.' },
        },
        required: [],
      },
    },
    {
      name: 'updateRequestStatus',
      description: 'Update a request\'s status.',
      parameters: {
        type: 'object',
        properties: {
          requestId: { type: 'string', description: 'The ID of the request to update.' },
          status: { type: 'string', description: 'The new status to set.' },
        },
        required: ['requestId', 'status'],
      },
    },
    {
      name: 'saveConversationMessage',
      description: 'Append a message to a request\'s conversation array.',
      parameters: {
        type: 'object',
        properties: {
          requestId: { type: 'string', description: 'The ID of the request.' },
          message: {
            type: 'object',
            properties: {
              direction: { type: 'string' },
              message: { type: 'string' },
              sentBy: { type: 'string' },
            },
            required: ['direction', 'message', 'sentBy'],
          },
        },
        required: ['requestId', 'message'],
      },
    },
    {
      name: 'getProviderHistory',
      description: 'Get past providers used by a user.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'The ID of the user.' },
        },
        required: ['userId'],
      },
    },
  ];
};

module.exports = {
  getMCPConfig,
  getMongoTools,
};
