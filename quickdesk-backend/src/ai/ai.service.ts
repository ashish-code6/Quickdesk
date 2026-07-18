import { Injectable } from '@nestjs/common';
import { TicketCategory, TicketPriority } from '@prisma/client';
import Groq from 'groq-sdk';

type CategoryPrioritySuggestion = {
    category: TicketCategory;
    priority: TicketPriority;
};

@Injectable()
export class AiService {
    private groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    async generateCategoryAndPriority(
        description: string,
    ): Promise<CategoryPrioritySuggestion> {
        const response = await this.groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `
                        You are an IT Helpdesk Assistant.

                        Analyze the employee ticket and return:
                        1. Category (IT, HR, Finance, Admin, Other)
                        2. Priority (Low, Medium, High)

                        Return only valid JSON in this format:
                        {"category":"IT","priority":"MEDIUM"}`,
                },
                {
                    role: 'user',
                    content: description,
                },
            ],
        });

        return this.parseSuggestion(response.choices[0]?.message?.content);
    }

    private parseSuggestion(
        content?: string | null,
    ): CategoryPrioritySuggestion {
        if (!content) {
            return {
                category: TicketCategory.OTHER,
                priority: TicketPriority.MEDIUM,
            };
        }

        try {
            const parsed = JSON.parse(content) as {
                category?: string;
                priority?: string;
            };

            const category = parsed.category?.toUpperCase();
            const priority = parsed.priority?.toUpperCase();

            return {
                category: this.isTicketCategory(category)
                    ? category
                    : TicketCategory.OTHER,
                priority: this.isTicketPriority(priority)
                    ? priority
                    : TicketPriority.MEDIUM,
            };
        } catch {
            return {
                category: TicketCategory.OTHER,
                priority: TicketPriority.MEDIUM,
            };
        }
    }

    private isTicketCategory(
        value?: string,
    ): value is TicketCategory {
        return Object.values(TicketCategory).includes(value as TicketCategory);
    }

    private isTicketPriority(
        value?: string,
    ): value is TicketPriority {
        return Object.values(TicketPriority).includes(value as TicketPriority);
    }
}
