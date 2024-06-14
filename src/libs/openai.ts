import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const assistantName = 'Official Doc Assistant new';
const openaiIns = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = openaiIns;

export async function uploadDocs(files) {
  const fileIds = [];
  for (const f of files) {
    const docFile = await openai.files.create({
      file: fs.createReadStream(path.join(__dirname, `../../res/${f}`)),
      purpose: 'assistants',
    });
    fileIds.push(docFile.id);
  }

  console.log('Upload file for assistant: ');

  const vectorStore = await openai.beta.vectorStores.create(
    {
      name: String(new Date().getTime()),
      file_ids: fileIds
    }
  );
  console.log('Create vectorStore for assistant: ', vectorStore.id);
  return vectorStore
}

export async function createAssistantIfNeeded(vectorStoreIds) {
  try {

    // Check if the assistant already exists
    // const existingAssistants = await openai.beta.assistants.list();
    // const existingAssistant = existingAssistants.data.find(
    //   (assistant) => assistant.name === assistantName
    // );

    // if (existingAssistant) {
    //   console.log('Assistant already exists:', existingAssistant);
    //   // return existingAssistant; // Return the existing assistant if found
    // }

    // If not found, create a new assistant
    const assistant = await openai.beta.assistants.create({
      name: assistantName,
      instructions: '公文助理',
      model: 'gpt-4o',
      tools: [{ type: 'file_search' }],
      tool_resources: {
        file_search: {
          // vector_store_ids: vectorStoreIds,
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

