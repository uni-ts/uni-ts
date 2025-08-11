import { flow } from '@uni-ts/composition';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const processData = flow(
  (data: string) => data.toUpperCase(),
  async (data) => {
    await delay(100);
    return data.split('');
  },
  (chars) => chars.reverse(),
  (chars) => chars.join('-'),
);

const result = await processData('hello'); // "O-L-L-E-H"
