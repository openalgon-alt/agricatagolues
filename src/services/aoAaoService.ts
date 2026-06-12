import { API_BASE_URL } from "./examDataService";

export interface AoAaoUser {
  id: string;
  phone: string;
  fullName: string;
  gmail: string;
  category: string;
  university: string;
  deviceId: string;
  deviceModel: string;
  isAdmin: boolean;
}

export interface AoAaoSubject {
  id: string;
  name: string;
  release: string;
  releaseISO: string;
  papers: number;
  isReleased: boolean;
}

export interface AoAaoQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
}

class AoAaoService {
  private getSessionToken(): string {
    if (typeof window === "undefined") return "";
    const raw = localStorage.getItem("agri_session");
    if (!raw) return "";
    try {
      return JSON.parse(raw).token || "";
    } catch {
      return "";
    }
  }

  private async request(action: string, payload: any = {}) {
    const response = await fetch(`${API_BASE_URL}/api`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
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

  async checkPhone(phone: string): Promise<{ exists: boolean; phone: string }> {
    return this.request("ao-aao-check-phone", { phone });
  }

  async register(params: any): Promise<{ token: string; user: AoAaoUser }> {
    return this.request("ao-aao-register", params);
  }

  async login(params: any): Promise<{ token: string; user: AoAaoUser }> {
    return this.request("ao-aao-login", params);
  }

  async getSession(token: string): Promise<{ user: AoAaoUser | null }> {
    return this.request("ao-aao-get-session", { token });
  }

  async logout(): Promise<{ ok: boolean }> {
    const token = this.getSessionToken();
    return this.request("ao-aao-logout", { token });
  }

  async listSubjects(): Promise<{ subjects: AoAaoSubject[] }> {
    const token = this.getSessionToken();
    return this.request("ao-aao-list-subjects", { token });
  }

  async getSubjectTests(subjectId: string): Promise<{
    subject: AoAaoSubject;
    paperQuestionCounts: Record<number, number>;
    paperNames: Record<number, string>;
  }> {
    const token = this.getSessionToken();
    return this.request("ao-aao-get-subject-tests", { token, subjectId });
  }

  async getPaperQuestions(subjectId: string, paperNumber: number): Promise<{
    paperName: string;
    questions: AoAaoQuestion[];
  }> {
    const token = this.getSessionToken();
    return this.request("ao-aao-get-paper-questions", { token, subjectId, paperNumber });
  }

  async getFreeTest(): Promise<{ questions: AoAaoQuestion[] }> {
    return this.request("ao-aao-get-free-test");
  }

  async unlockUser(): Promise<{ ok: boolean }> {
    const token = this.getSessionToken();
    return this.request("ao-aao-unlock", { token });
  }

  async getPaymentSettings(): Promise<{ upiId: string; qrCode: string }> {
    return this.request("ao-aao-get-payment-settings");
  }

  async submitUtr(utr: string): Promise<{ ok: boolean }> {
    const token = this.getSessionToken();
    return this.request("ao-aao-submit-utr", { token, utr });
  }
}

export const aoAaoService = new AoAaoService();
