
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const assistantName = 'Official Doc Assistant';
const openaiIns = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = openaiIns;

export async function uploadDocsIfNeeded() {
  const docFile = await openai.files.create({
    file: fs.createReadStream(path.join(__dirname, '../../resources/2023.pdf')),
    purpose: 'assistants',
  });

  console.log('Upload file for assistant: ', docFile.id);

  const vectorStore = await openai.beta.vectorStores.create(
    {
      name: 'smarter_store_gt',
      file_ids: [docFile.id]
    }
  );
  console.log('Create vectorStore for assistant: ', vectorStore.id);
  return [vectorStore.id]
}

export async function createAssistantIfNeeded() {
  try {

    // Check if the assistant already exists
    const existingAssistants = await openai.beta.assistants.list();
    const existingAssistant = existingAssistants.data.find(
      (assistant) => assistant.name === assistantName
    );

    if (existingAssistant) {
      console.log('Assistant already exists:', existingAssistant);
      return existingAssistant; // Return the existing assistant if found
    }

    const vectorStoreIds = await uploadDocsIfNeeded();
    // If not found, create a new assistant
    const assistant = await openai.beta.assistants.create({
      name: assistantName,
      instructions: '公文助理',
      model: 'gpt-4o',
      tools: [{ type: 'file_search' }],
      tool_resources: {
        file_search: {
          vector_store_ids: vectorStoreIds,
        },
      },
    });

    console.log('New assistant created:', assistant);
    return assistant;
  } catch (error) {
    console.error('Error creating assistant:', error);
  }
}

