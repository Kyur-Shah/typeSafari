const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = "TypeSafariDB";
const containerId = "Progress";

const createDefaultGlobalState = () => ({
  id: "global_progress",
  users: {
    user_1: {
      id: 'user_1',
      name: 'Little Typist',
      level: 1,
      points: 0,
      accuracy: 100,
      wpm: 0,
      completedLessons: [],
      badges: [],
      avatar: 'penguin',
      highScore: 0
    }
  },
  activeUserId: 'user_1',
  settings: {
    keyboardSound: 'default',
    showDiagnostics: false
  }
});

let _client;
function getClient() {
  if (!_client) {
    _client = new CosmosClient({ endpoint, key });
  }
  return _client;
}

app.http('progress', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const client = getClient();
      const database = client.database(databaseId);
      const container = database.container(containerId);

      if (request.method === 'GET') {
        const { resource } = await container.item("global_progress", "global_progress").read();
        
        if (resource) {
          return { jsonBody: resource };
        } else {
          // Document does not exist, return default state
          const defaultState = createDefaultGlobalState();
          return { jsonBody: defaultState };
        }
      } else if (request.method === 'POST') {
        const body = await request.json();
        
        // Upsert the entire global state document
        body.id = "global_progress";
        await container.items.upsert(body);

        return { jsonBody: { success: true } };
      }
    } catch (error) {
      context.error('Cosmos DB Error:', error);
      return { status: 500, jsonBody: { error: 'Internal Server Error', details: error.message } };
    }
  }
});
