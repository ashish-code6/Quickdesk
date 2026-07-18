import { Injectable } from '@nestjs/common';
import { TicketCategory, TicketPriority } from '@prisma/client';
import Groq from 'groq-sdk';
import { KNOWLEDGE_BASE, KnowledgeBaseArticle } from './knowledge-base';

type CategoryPrioritySuggestion = {
  category: TicketCategory;
  priority: TicketPriority;
};

type TicketForAi = {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
};

type Citation = {
  id: string;
  title: string;
};

type DraftReplyResult = {
  aiDraftReply: string;
  aiCitations: Citation[];
};

@Injectable()
export class AiService {
  private groq: Groq | null = null;

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    }
  }

  async generateCategoryAndPriority(
    title: string,
    description = '',
  ): Promise<CategoryPrioritySuggestion> {
    const ticketText = `${title}\n${description}`.trim();

    if (!this.groq) {
      return this.getCategoryAndPriorityWithoutAi(ticketText);
    }

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'Return only JSON. Example: {"category":"IT","priority":"HIGH"}. Category must be IT, HR, FINANCE, ADMIN, or OTHER. Priority must be LOW, MEDIUM, or HIGH.',
          },
          {
            role: 'user',
            content: ticketText,
          },
        ],
      });

      const aiText = response.choices[0]?.message?.content;

      return this.convertAiTextToSuggestion(aiText);
    } catch {
      return this.getCategoryAndPriorityWithoutAi(ticketText);
    }
  }

  async generateDraftReply(ticket: TicketForAi): Promise<DraftReplyResult> {
    const articles = this.findMatchingArticles(ticket);
    const citations = this.createCitations(articles);

    if (articles.length === 0) {
      return {
        aiDraftReply:
          'I could not find a relevant knowledge base article for this request. Please review the ticket manually before replying.',
        aiCitations: citations,
      };
    }

    if (!this.groq) {
      return {
        aiDraftReply: this.createSimpleDraftReply(articles),
        aiCitations: citations,
      };
    }

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'Write a professional helpdesk reply in only 4 to 5 short lines. Use only the given knowledge base articles. Do not make up information.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              ticket,
              knowledgeBaseArticles: articles,
            }),
          },
        ],
      });

      const aiDraft = response.choices[0]?.message?.content?.trim();

      return {
        aiDraftReply: aiDraft || this.createSimpleDraftReply(articles),
        aiCitations: citations,
      };
    } catch {
      return {
        aiDraftReply: this.createSimpleDraftReply(articles),
        aiCitations: citations,
      };
    }
  }

  private convertAiTextToSuggestion(content?: string | null): CategoryPrioritySuggestion {
    if (!content) {
      return this.defaultSuggestion();
    }

    try {
      const parsed = JSON.parse(content) as {
        category?: string;
        priority?: string;
      };

      const category = parsed.category?.toUpperCase();
      const priority = parsed.priority?.toUpperCase();

      return {
        category: this.isValidCategory(category) ? category : TicketCategory.OTHER,
        priority: this.isValidPriority(priority) ? priority : TicketPriority.MEDIUM,
      };
    } catch {
      return this.defaultSuggestion();
    }
  }

  private getCategoryAndPriorityWithoutAi(text: string): CategoryPrioritySuggestion {
    const lowerText = text.toLowerCase();
    let category: TicketCategory = TicketCategory.OTHER;
    let priority: TicketPriority = TicketPriority.LOW;

    if (this.containsAnyWord(lowerText, ['password', 'vpn', 'login', 'network', 'software', 'wifi'])) {
      category = TicketCategory.IT;
    }

    if (this.containsAnyWord(lowerText, ['leave', 'holiday', 'sick', 'pto'])) {
      category = TicketCategory.HR;
    }

    if (this.containsAnyWord(lowerText, ['expense', 'reimbursement', 'invoice', 'payment'])) {
      category = TicketCategory.FINANCE;
    }

    if (this.containsAnyWord(lowerText, ['laptop', 'device', 'hardware', 'admin'])) {
      category = TicketCategory.ADMIN;
    }

    if (this.containsAnyWord(lowerText, ['soon', 'delay', 'issue', 'problem'])) {
      priority = TicketPriority.MEDIUM;
    }

    if (this.containsAnyWord(lowerText, ['urgent', 'blocked', 'cannot work', 'down', 'critical'])) {
      priority = TicketPriority.HIGH;
    }

    return {
      category,
      priority,
    };
  }

  private findMatchingArticles(ticket: TicketForAi): KnowledgeBaseArticle[] {
    const ticketText = `${ticket.title} ${ticket.description}`.toLowerCase();
    const matchingArticles: {
      article: KnowledgeBaseArticle;
      score: number;
    }[] = [];

    for (const article of KNOWLEDGE_BASE) {
      let score = 0;

      for (const keyword of article.keywords) {
        if (ticketText.includes(keyword)) {
          score = score + 1;
        }
      }

      if (score > 0) {
        matchingArticles.push({
          article,
          score,
        });
      }
    }

    matchingArticles.sort((a, b) => b.score - a.score);

    return matchingArticles.slice(0, 2).map((item) => item.article);
  }

  private createCitations(articles: KnowledgeBaseArticle[]): Citation[] {
    return articles.map((article) => ({
      id: article.id,
      title: article.title,
    }));
  }

  private createSimpleDraftReply(articles: KnowledgeBaseArticle[]): string {
    const articleTitles = articles.map((article) => article.title).join(', ');

    return `Thank you for raising this ticket.
Based on the knowledge base article(s): ${articleTitles}, please follow the documented steps.
If the issue continues, share the error message and any relevant screenshot.
We will review the details and assist you further.`;
  }

  private defaultSuggestion(): CategoryPrioritySuggestion {
    return {
      category: TicketCategory.OTHER,
      priority: TicketPriority.MEDIUM,
    };
  }

  private containsAnyWord(text: string, words: string[]): boolean {
    for (const word of words) {
      if (text.includes(word)) {
        return true;
      }
    }

    return false;
  }

  private isValidCategory(value?: string): value is TicketCategory {
    return Object.values(TicketCategory).includes(value as TicketCategory);
  }

  private isValidPriority(value?: string): value is TicketPriority {
    return Object.values(TicketPriority).includes(value as TicketPriority);
  }
}
