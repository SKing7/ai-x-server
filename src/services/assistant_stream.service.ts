import { createAssistantIfNeeded, openai } from "src/libs/openai";


async function main(res) {

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

  console.log('Thred has been created: ', thread);
  const run = openai.beta.threads.runs.stream(thread.id, {
    assistant_id: assistant.id
  })
    .on('textCreated', (text) => res.write('\nassistant > '))
    .on('textDelta', (textDelta, snapshot) => res.write(textDelta.value))
    .on('end', () => {
      res.end();
    });
}

export default main;