import { Injectable, Res } from '@nestjs/common';
import { createAssistantIfNeeded, openai } from 'src/libs/openai';


@Injectable()
export class AssistantService {

  async run() {

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
  async runStream(@Res() res) {


    console.log('--------2-----------------', res);
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
      .on('textCreated', (text) => res.write('\nassistant > \r\n'))
      .on('textDelta', (textDelta, snapshot) => res.write(textDelta.value))
      .on('end', () => {
        res.end();
      });
  }
}
