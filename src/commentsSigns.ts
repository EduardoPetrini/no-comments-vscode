import { Sign, BlockSign, SignStructure } from './types';

export const commentSigns: SignStructure = {
  singleLine: [
    { sign: '#', lang: ['python', 'py', 'perl', 'bash', 'ruby', 'powershell', 'ps'] },
    { sign: '//', lang: ['js', 'javascript', 'ts', 'typescript', 'c', 'java', 'c++', 'cpp', 'rust', 'go', 'c#'] },
    { sing: '--', lang: ['sql'] },
  ] as Sign[],

  multiline: [
    { open: '<#', close: '#>', lang: [] },
    { open: '/*', close: '*/', lang: [] },
    { open: '<!--', close: '-->', lang: [] },
  ] as BlockSign[],
};

export const languagesCovered = () => commentSigns.singleLine.map(s => s.lang).flatMap(m => m);
