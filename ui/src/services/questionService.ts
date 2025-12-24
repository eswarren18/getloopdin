import { baseUrl } from './authService';
import {
    QuestionCategoryOut,
    QuestionCreate,
    QuestionOut,
    OrderUpdate,
    QuestionCategoryOrderUpdate,
} from '../types';

export async function fetchQuestions(
    eventId: number,
    inviteToken?: string | null
): Promise<QuestionOut[]> {
    try {
        // Send GET request to the API
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
            askerUserIds: item.asker_user_ids ?? [],
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

export async function createQuestion(
    eventId: number,
    questionData: QuestionCreate
): Promise<QuestionOut> {
    // Transform payload to snake_case for API consumption
    const payload = {
        question_text: questionData.questionText,
        answer_text: questionData.answerText,
        category_id: questionData.categoryId,
        invite_token: questionData.inviteToken,
        is_published: questionData.isPublished,
    };

    try {
        // Send POST request to the API
        const response = await fetch(
            `${baseUrl}/api/events/${eventId}/questions/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include',
            }
        );
        if (!response.ok) throw new Error('Failed to create event.');

        // Transform Response object to JSON
        const data = await response.json();

        // Transform data to camelCase for UI consumption
        const question: QuestionOut = {
            answerText: data.answer_text,
            askerUserIds: data.asker_user_ids ?? [],
            categoryId: data.category_id,
            draftOrder: data.draft_order,
            eventId: data.event_id,
            id: data.id,
            isPublished: data.is_published,
            publishedOrder: data.published_order,
            questionText: data.question_text,
            userId: data.user_id,
        };
        return question;
    } catch (e) {
        throw e;
    }
}

export async function reorderQuestions(
    eventId: number,
    payload: OrderUpdate
): Promise<void> {
    const response = await fetch(
        `${baseUrl}/api/events/${eventId}/questions/order`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                items: payload.items.map((i) => ({
                    question_id: i.questionId,
                    is_published: i.isPublished,
                    category_id: i.categoryId,
                    published_order: i.publishedOrder,
                    draft_order: i.draftOrder,
                })),
            }),
        }
    );

    if (!response.ok) {
        throw new Error('Failed to reorder questions');
    }
}

export async function reorderQuestionCategories(
    eventId: number,
    payload: QuestionCategoryOrderUpdate
): Promise<void> {
    const response = await fetch(
        `${baseUrl}/api/events/${eventId}/question-categories/order`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                items: payload.items.map((i) => ({
                    category_id: i.categoryId,
                    display_order: i.displayOrder,
                })),
            }),
        }
    );

    if (!response.ok) {
        throw new Error('Failed to reorder categories');
    }
}
