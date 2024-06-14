import { Injectable, Res } from '@nestjs/common';
import { createAssistantIfNeeded, openai, uploadDocs } from 'src/libs/openai';

const vectorStoreIds = ['vs_T5yfV3mlwQBuRdDXvJN4Yjco'];

@Injectable()
export class AssistantService {

  async run() {

    const assistant = await createAssistantIfNeeded(vectorStoreIds);

    const thread = await openai.beta.threads.create({});

    console.log('Thred has been created: ', thread);

    const message = await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: `给你提供的pdf文件，结合最近的形势，帮我写一个新的
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
  async runStream(@Res() res) {


    const assistant = await createAssistantIfNeeded(vectorStoreIds);

    const thread = await openai.beta.threads.create({});

    console.log('Thred has been created: ', thread);

    const message = await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: `给你提供的pdf文件中的标题，帮我写一个新的稿子; `
    });

    console.log('Adding message to thread: ', message);

    console.log('Thred has been created: ', thread);
    const run = openai.beta.threads.runs.stream(thread.id, {
      assistant_id: assistant.id
    })
      .on('textCreated', (text) => res.write('\nassistant > \r\n'))
      .on('textDelta', (textDelta, snapshot) => res.write(textDelta.value))
      .on('end', () => {
        res.end();
      });
  }

  async updateFileInAssitant() {
    const storeObj = await uploadDocs(['dang-1.pdf', 'dang-2.pdf', 'dang-3.pdf']);
    return storeObj;
  }
}
