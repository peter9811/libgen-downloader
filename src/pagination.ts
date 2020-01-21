import questions from './questions';
import { IQuestionChoice } from './interfaces.namespace';
import { getUrl } from './url';

export const getPaginations = (query: string, currentPage: number, isNextPageExist: boolean): IQuestionChoice[] => {
    let choices: IQuestionChoice[] = [];

    choices.push(questions.getQuestionChoice('>> Search', { pagination: false, url: '', id: 'searchAgain' }));

    if (isNextPageExist) {
        let nextPageUrl = getUrl(query, currentPage + 1);
        choices.push(questions.getQuestionChoice('-> Next Page', { pagination: 'next', url: nextPageUrl, id: '' }));
    }

    if (currentPage > 1) {
        let prevPageUrl = getUrl(query, currentPage - 1);
        choices.push(questions.getQuestionChoice('<- Previous Page', { pagination: 'prev', url: prevPageUrl, id: '' }));
    }

    choices.push(questions.getQuestionChoice('<< Exit', { pagination: false, url: '', id: 'exit' }));

    return choices;
}