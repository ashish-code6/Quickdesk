import { Injectable } from '@nestjs/common';
import { TicketCategory, TicketPriority } from '@prisma/client';
import { Document } from '@langchain/core/documents';
import { Embeddings } from '@langchain/core/embeddings';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
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

type DraftReplyChainContext = {
  ticket: TicketForAi;
  ticketText: string;
  articles: KnowledgeBaseArticle[];
  citations: Citation[];
};

const EMBEDDING_WORDS = [
  'vpn',
  'remote',
  'network',
  'password',
  'login',
  'locked',
  'reset',
  'mfa',
  'leave',
  'vacation',
  'sick',
  'expense',
  'reimbursement',
  'receipt',
  'finance',
  'laptop',
  'hardware',
  'device',
  'replacement',
  'admin',
];

class SimpleHelpdeskEmbeddings extends Embeddings {
  constructor() {
    super({});
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return documents.map((document) => this.createVector(document));
  }

  async embedQuery(document: string): Promise<number[]> {
    return this.createVector(document);
  }

  private createVector(text: string): number[] {
    const lowerText = text.toLowerCase();

    return EMBEDDING_WORDS.map((word) => {
      return lowerText.includes(word) ? 1 : 0;
    });
  }
}

@Injectable()
export class AiService {
  private groq: Groq | null = null;
  private vectorStorePromise: Promise<MemoryVectorStore>;

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    }

    this.vectorStorePromise = this.createVectorStore();
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
    try {
      const draftReplyChain = this.createDraftReplyChain();

      return await draftReplyChain.invoke(ticket);
    } catch {
      const articles = await this.findMatchingArticlesWithLangChain(ticket);

      return {
        aiDraftReply: this.createSimpleDraftReply(articles),
        aiCitations: this.createCitations(articles),
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

  private async findMatchingArticlesWithLangChain(
    ticket: TicketForAi,
  ): Promise<KnowledgeBaseArticle[]> {
    const ticketText = `${ticket.title} ${ticket.description}`;
    const hasKeywordMatch = this.hasKnowledgeBaseKeyword(ticketText);

    if (!hasKeywordMatch) {
      return [];
    }

    const vectorStore = await this.vectorStorePromise;
    const documents = await vectorStore.similaritySearch(ticketText, 2);

    return documents.map((document) => ({
      id: String(document.metadata.id),
      title: String(document.metadata.title),
      content: document.pageContent,
      keywords: document.metadata.keywords as string[],
    }));
  }

  private createDraftReplyChain(): RunnableSequence<TicketForAi, DraftReplyResult> {
    return RunnableSequence.from([
      RunnableLambda.from((ticket: TicketForAi) => {
        return {
          ticket,
          ticketText: `${ticket.title} ${ticket.description}`,
          articles: [],
          citations: [],
        };
      }),
      RunnableLambda.from((context) => this.addMatchingArticles(context)),
      RunnableLambda.from((context) => this.addCitations(context)),
      RunnableLambda.from((context) => this.writeDraftReply(context)),
    ]);
  }

  private async addMatchingArticles(
    context: DraftReplyChainContext,
  ): Promise<DraftReplyChainContext> {
    const articles = await this.findMatchingArticlesWithLangChain(context.ticket);

    return {
      ...context,
      articles,
    };
  }

  private addCitations(context: DraftReplyChainContext): DraftReplyChainContext {
    return {
      ...context,
      citations: this.createCitations(context.articles),
    };
  }

  private async writeDraftReply(
    context: DraftReplyChainContext,
  ): Promise<DraftReplyResult> {
    if (context.articles.length === 0) {
      return {
        aiDraftReply:
          'I could not find a relevant knowledge base article for this request. Please review the ticket manually before replying.',
        aiCitations: context.citations,
      };
    }

    if (!this.groq) {
      return {
        aiDraftReply: this.createSimpleDraftReply(context.articles),
        aiCitations: context.citations,
      };
    }

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
            ticket: context.ticket,
            knowledgeBaseArticles: context.articles,
          }),
        },
      ],
    });

    const aiDraft = response.choices[0]?.message?.content?.trim();

    return {
      aiDraftReply: aiDraft || this.createSimpleDraftReply(context.articles),
      aiCitations: context.citations,
    };
  }

  private async createVectorStore(): Promise<MemoryVectorStore> {
    const documents = KNOWLEDGE_BASE.map((article) => {
      return new Document({
        pageContent: article.content,
        metadata: {
          id: article.id,
          title: article.title,
          keywords: article.keywords,
        },
      });
    });

    return MemoryVectorStore.fromDocuments(documents, new SimpleHelpdeskEmbeddings());
  }

  private hasKnowledgeBaseKeyword(text: string): boolean {
    const lowerText = text.toLowerCase();

    for (const article of KNOWLEDGE_BASE) {
      for (const keyword of article.keywords) {
        if (lowerText.includes(keyword)) {
          return true;
        }
      }
    }

    return false;
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
