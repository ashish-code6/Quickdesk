export type KnowledgeBaseArticle = {
  id: string;
  title: string;
  content: string;
  keywords: string[];
};

export const KNOWLEDGE_BASE: KnowledgeBaseArticle[] = [
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
