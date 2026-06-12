import { API_BASE_URL } from "./examDataService";

export interface AdminSubject {
  id: string;
  name: string;
  release: string;
  releaseISO: string;
  papers: number;
  isReleased: boolean;
}

export interface AdminQuestion {
  id: string;
  paper_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface AdminUser {
  id: string;
  phone: string;
  fullName: string;
  gmail: string;
  category: string;
  university: string;
  isAdmin: boolean;
  createdAt: string;
}

class AoAaoAdminService {
  private async request(action: string, token: string, payload: any = {}) {
    const response = await fetch(`${API_BASE_URL}/api`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload: { ...payload, token } }),
    });
    
    if (!response.ok) {
      let msg = `Request failed for action ${action}`;
      try {
        const errData = await response.json();
        msg = errData.error || msg;
      } catch {
        try {
          const text = await response.text();
          if (text) msg = text;
        } catch {}
      }
      throw new Error(msg);
    }
    
    return response.json();
  }

  async listSubjects(token: string): Promise<{ subjects: AdminSubject[] }> {
    return this.request("ao-aao-admin-list-subjects", token);
  }

  async setSubjectRelease(token: string, subjectId: string, isReleased: boolean): Promise<{ ok: boolean }> {
    return this.request("ao-aao-admin-set-subject-release", token, { subjectId, isReleased });
  }

  async addPaper(token: string, subjectId: string): Promise<{ ok: boolean; papers: number }> {
    return this.request("ao-aao-admin-add-paper", token, { subjectId });
  }

  async deletePaper(token: string, subjectId: string, paperNumber: number): Promise<{ ok: boolean; papers: number }> {
    return this.request("ao-aao-admin-delete-paper", token, { subjectId, paperNumber });
  }

  async listQuestions(token: string, subjectId: string): Promise<{ questions: AdminQuestion[]; paperNames: Record<number, string> }> {
    return this.request("ao-aao-admin-list-questions", token, { subjectId });
  }

  async addQuestion(token: string, params: {
    subjectId: string;
    paperNumber: number;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: "A" | "B" | "C" | "D";
    explanation?: string;
  }): Promise<{ ok: boolean }> {
    return this.request("ao-aao-admin-add-question", token, params);
  }

  async deleteQuestion(token: string, questionId: string): Promise<{ ok: boolean }> {
    return this.request("ao-aao-admin-delete-question", token, { questionId });
  }

  async bulkAddQuestions(token: string, subjectId: string, questions: any[]): Promise<{ ok: boolean; count: number }> {
    return this.request("ao-aao-admin-bulk-add-questions", token, { subjectId, questions });
  }

  async editPaperName(token: string, subjectId: string, paperNumber: number, name: string): Promise<{ ok: boolean }> {
    return this.request("ao-aao-admin-edit-paper-name", token, { subjectId, paperNumber, name });
  }

  async listUsers(token: string): Promise<{ users: AdminUser[] }> {
    return this.request("ao-aao-admin-list-users", token);
  }

  async toggleUserUnlock(token: string, userId: string, targetUnlocked: boolean): Promise<{ ok: boolean }> {
    return this.request("ao-aao-admin-toggle-unlock", token, { userId, targetUnlocked });
  }

  async clearUserDevice(token: string, userId: string): Promise<{ ok: boolean }> {
    return this.request("ao-aao-admin-clear-device", token, { userId });
  }

  async savePaymentSettings(token: string, upiId: string, qrCode: string): Promise<{ ok: boolean }> {
    return this.request("ao-aao-admin-save-payment-settings", token, { upiId, qrCode });
  }

  async listFreeTest(token: string): Promise<{ subjectId: string; questions: any[] }> {
    return this.request("ao-aao-admin-list-free-test", token);
  }

  async addFreeTestQuestion(token: string, params: {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: "A" | "B" | "C" | "D";
    explanation?: string;
  }): Promise<{ ok: boolean }> {
    return this.request("ao-aao-admin-add-free-test", token, params);
  }

  async deleteFreeTestQuestion(token: string, questionId: string): Promise<{ ok: boolean }> {
    return this.request("ao-aao-admin-delete-free-test", token, { questionId });
  }

  async bulkAddFreeTestQuestions(token: string, questions: any[]): Promise<{ ok: boolean; count: number }> {
    return this.request("ao-aao-admin-bulk-add-free-test", token, { questions });
  }
}

export const aoAaoAdminService = new AoAaoAdminService();
