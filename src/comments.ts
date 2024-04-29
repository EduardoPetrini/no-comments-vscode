import { Sign } from './types';
import { languagesCovered } from './commentsSigns';

const languages = languagesCovered();

const stringWrappers = ["'", '"', '`'];

const countOccurrences = (text: string, pattern: string) => {
  const regex = new RegExp(pattern, 'g');
  const matches = text.match(regex);

  return matches ? matches.length : 0;
};

export const isSingleLineComment = (lineText: string, singleLineSign: Sign, languageId: string) => {
  const { sign } = singleLineSign;
  if (!lineText.includes(sign)) {
    return false;
  }

  if (languages.includes(languageId) && !singleLineSign.lang.includes(languageId)) {
    return false;
  }

  let wrappedCommentSign = false;
  for (let strWrapper of stringWrappers) {
    const cleanedText = lineText.replaceAll(`\\${strWrapper}`, '');
    if (!cleanedText.includes(strWrapper)) {
      continue;
    }

    const [firstPart, ...rest] = cleanedText.split(sign);
    const secondPart = rest.join(' ');

    const countFirstPart = countOccurrences(firstPart, strWrapper);
    if (!countFirstPart) {
      continue;
    }

    const countSecondPart = countOccurrences(secondPart, strWrapper);

    if (!countSecondPart) {
      continue;
    }

    if (countFirstPart % 2 !== 0 && countSecondPart % 2 !== 0) {
      wrappedCommentSign = true;
      continue;
    }

    wrappedCommentSign = false;
  }

  if (wrappedCommentSign) {
    return false;
  }

  return true;
};

export const isOpenMultiLineComment = (lineText: string) => {};

export const isCloseMultiLineComment = (lineText: string) => {};
