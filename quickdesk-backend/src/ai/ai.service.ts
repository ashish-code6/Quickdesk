import { Injectable } from '@nestjs/common';
import { TicketCategory, TicketPriority } from '@prisma/client';
import Groq from 'groq-sdk';

type CategoryPrioritySuggestion = {
  category: TicketCategory;
  priority: TicketPriority;
};

type KnowledgeBaseArticle = {
  id: string;
  title: string;
  content: string;
  keywords: string[];
};

type DraftReplyResult = {
  aiDraftReply: string;
  aiCitations: {
    id: string;
    title: string;
  }[];
};

const KNOWLEDGE_BASE: KnowledgeBaseArticle[] = [
  {
    id: 'vpn-setup',
    title: 'VPN Setup',
    keywords: ['vpn', 'remote', 'network', 'connect', 'connection', 'client'],
    content:
      'Employees who need remote access should install the company VPN client from the IT portal, sign in with their work email, and approve the MFA prompt. If the VPN connects but internal tools do not load, disconnect and reconnect once, then restart the browser. Persistent VPN failures should include the error message, operating system, and whether home internet is working.',
  },
  {
    id: 'password-reset-policy',
    title: 'Password Reset Policy',
    keywords: ['password', 'login', 'locked', 'reset', 'account', 'mfa'],
    content:
      'Employees can reset a forgotten password from the sign-in page using the Reset Password link. The reset requires MFA verification and a new password that has not been used recently. Locked accounts usually unlock after fifteen minutes, but urgent lockouts can be escalated to IT with the employee email and screenshot of the sign-in error.',
  },
  {
    id: 'leave-application-process',
    title: 'Leave Application Process',
    keywords: ['leave', 'vacation', 'holiday', 'sick', 'pto', 'absence'],
    content:
      'Leave requests should be submitted through the HR portal with the leave type, start date, end date, and manager approval. Sick leave can be submitted after the employee returns if advance notice was not possible. HR reviews policy questions and can correct balances when an approved leave does not appear in the portal.',
  },
  {
    id: 'expense-reimbursement',
    title: 'Expense Reimbursement',
    keywords: ['expense', 'reimbursement', 'receipt', 'finance', 'claim', 'payment'],
    content:
      'Expense claims must include a valid receipt, business purpose, cost center, and manager approval. Finance processes approved reimbursements in the next payroll cycle. Missing receipts or unclear business purposes delay payment, so employees should attach the invoice or card statement and explain the expense clearly.',
  },
  {
    id: 'laptop-request',
    title: 'Laptop Request',
    keywords: ['laptop', 'hardware', 'device', 'replacement', 'new joiner', 'computer'],
    content:
      'Laptop requests are handled by Admin and IT. New employee devices should be requested at least five business days before the joining date. Replacement requests should include the current asset tag, issue description, and manager approval. Urgent hardware failures can be prioritized when the employee cannot work without the device.',
  },
];

@Injectable()
export class AiService {
  private groq = process.env.GROQ_API_KEY
    ? new Groq({
        apiKey: process.env.GROQ_API_KEY,
      })
    : null;

  async generateCategoryAndPriority(
    title: string,
    description = '',
  ): Promise<CategoryPrioritySuggestion> {
    const ticketText = `${title}\n${description}`.trim();

    if (!this.groq) {
      return this.localCategoryAndPriority(ticketText);
    }

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'Analyze the employee helpdesk ticket. Return only valid JSON: {"category":"IT|HR|FINANCE|ADMIN|OTHER","priority":"LOW|MEDIUM|HIGH"}',
          },
          {
            role: 'user',
            content: ticketText,
          },
        ],
      });

      return this.parseSuggestion(response.choices[0]?.message?.content);
    } catch {
      return this.localCategoryAndPriority(ticketText);
    }
  }

  async generateDraftReply(ticket: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
  }): Promise<DraftReplyResult> {
    const articles = this.findRelevantArticles(`${ticket.title} ${ticket.description}`);
    const aiCitations = articles.map(({ id, title }) => ({ id, title }));

    if (articles.length === 0) {
      return {
        aiDraftReply:
          'I could not find a relevant knowledge base article for this request. Please review the ticket manually before replying.',
        aiCitations,
      };
    }

    if (!this.groq) {
      return {
        aiDraftReply: this.localDraftReply(articles),
        aiCitations,
      };
    }

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'Draft a concise helpdesk reply using only the supplied knowledge base articles. Do not invent facts. Include clear next steps.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              ticket,
              knowledgeBase: articles.map(({ title, content }) => ({ title, content })),
            }),
          },
        ],
      });

      return {
        aiDraftReply:
          response.choices[0]?.message?.content?.trim() || this.localDraftReply(articles),
        aiCitations,
      };
    } catch {
      return {
        aiDraftReply: this.localDraftReply(articles),
        aiCitations,
      };
    }
  }

  private parseSuggestion(content?: string | null): CategoryPrioritySuggestion {
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
        category: this.isTicketCategory(category) ? category : TicketCategory.OTHER,
        priority: this.isTicketPriority(priority) ? priority : TicketPriority.MEDIUM,
      };
    } catch {
      return {
        category: TicketCategory.OTHER,
        priority: TicketPriority.MEDIUM,
      };
    }
  }

  private localCategoryAndPriority(text: string): CategoryPrioritySuggestion {
    const normalized = text.toLowerCase();
    const category = this.hasAny(normalized, ['leave', 'holiday', 'sick', 'pto'])
      ? TicketCategory.HR
      : this.hasAny(normalized, ['expense', 'reimbursement', 'invoice', 'payment'])
        ? TicketCategory.FINANCE
        : this.hasAny(normalized, ['laptop', 'device', 'hardware', 'admin'])
          ? TicketCategory.ADMIN
          : this.hasAny(normalized, ['password', 'vpn', 'login', 'network', 'software', 'wifi'])
            ? TicketCategory.IT
            : TicketCategory.OTHER;

    const priority = this.hasAny(normalized, ['urgent', 'blocked', 'cannot work', 'down', 'critical'])
      ? TicketPriority.HIGH
      : this.hasAny(normalized, ['soon', 'delay', 'issue', 'problem'])
        ? TicketPriority.MEDIUM
        : TicketPriority.LOW;

    return { category, priority };
  }

  private findRelevantArticles(query: string): KnowledgeBaseArticle[] {
    const normalized = query.toLowerCase();

    return KNOWLEDGE_BASE.map((article) => ({
      article,
      score: article.keywords.filter((keyword) => normalized.includes(keyword)).length,
    }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(({ article }) => article);
  }

  private localDraftReply(articles: KnowledgeBaseArticle[]): string {
    const titles = articles.map((article) => article.title).join(', ');

    return `Thanks for raising this ticket. Based on the knowledge base article(s): ${titles}, please follow the documented steps and share any requested details or screenshots if the issue continues.`;
  }

  private hasAny(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }

  private isTicketCategory(value?: string): value is TicketCategory {
    return Object.values(TicketCategory).includes(value as TicketCategory);
  }

  private isTicketPriority(value?: string): value is TicketPriority {
    return Object.values(TicketPriority).includes(value as TicketPriority);
  }
}
