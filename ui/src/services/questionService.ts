import { QuestionCategoryOut, QuestionOut } from '../types';

export const baseUrl = import.meta.env.VITE_API_URL;
if (!baseUrl) {
    throw new Error('VITE_API_URL was not defined');
}

export async function fetchQuestions(
    eventId: number,
    inviteToken?: string | null
): Promise<QuestionOut[]> {
    try {
        // Send GET request to the API
        const url = new URL(`${baseUrl}/api/events/${eventId}/questions/`);
        const response = await fetch(
            `${baseUrl}/api/events/${eventId}/questions/`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok) {
            throw new Error('Failed to retrieve questions.');
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const questions: QuestionOut[] = data.map((item: any) => ({
            answerText: item.answer_text,
            categoryId: item.category_id,
            draftOrder: item.draft_order,
            eventId: item.event_id,
            id: item.id,
            isPublished: item.is_published,
            publishedOrder: item.published_order,
            questionText: item.question_text,
            userId: item.user_id,
        }));

        return questions;
    } catch (e) {
        throw e;
    }
}

export async function fetchQuestionCategories(
    eventId: number,
    inviteToken?: string | null
): Promise<QuestionCategoryOut[]> {
    try {
        // Send GET request to the API
        const response = await fetch(
            `${baseUrl}/api/events/${eventId}/question-categories`,
            {
                credentials: 'include',
            }
        );
        if (!response.ok) {
            throw new Error('Failed to retrieve question categories.');
        }

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const categories: QuestionCategoryOut[] = data.map((item: any) => ({
            id: item.id,
            eventId: item.event_id,
            name: item.name,
            displayOrder: item.display_order,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }));

        return categories;
    } catch (e) {
        throw e;
    }
}
