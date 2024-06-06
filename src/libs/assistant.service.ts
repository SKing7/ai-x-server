import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const assistantName = 'Official Doc Assistant';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function uploadDocsIfNeeded() {
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

async function createAssistantIfNeeded() {
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

async function main() {
  const assistant = await createAssistantIfNeeded();

  const thread = await openai.beta.threads.create({});

  console.log('Thred has been created: ', thread);

  const message = await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content:
      `给你提供了2023年山东省政府工作报告的pdf，根据2023年的，帮我写一个2024年的山东省的政府工作报告公文;
      并且要突出提到习近平主席，向党看齐
      `,
  });

  console.log('Adding message to thread: ', message);

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant?.id || '',

  })

  console.log('Run has been created: ', run);

  const checkRun = async () => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        const retrieveRun = await openai.beta.threads.runs.retrieve(
          thread.id,
          run.id
        );

        console.log('Run status: ', retrieveRun.status);

        if (retrieveRun.status === 'completed') {
          console.log('Run completed: ', retrieveRun);

          clearInterval(interval);
          resolve(retrieveRun);
        }
      }, 3000);
    });
  };

  await checkRun();

  const messages = await openai.beta.threads.messages.list(thread.id);

  const answer = messages.data[0];
  const content = answer.content[0];
  if (content.type === 'text') {
    return (content.text.value);
  }
  // return run;
}

export default main;
