export interface MockTest {
    id: number | string;
    title: string;
    description: string;
    category: string;
    price: number;
    isActive?: boolean;
    imageUrl?: string;
    questions?: MockQuestion[];
}

export interface MockQuestion {
    id: number | string;
    mockTestId: number | string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    image?: string;
    marks: number;
    topic: string;
}

export interface UserPurchase {
    id: number | string;
    userId: string;
    mockTestId: number | string;
    amount: number;
    status: string;
    purchasedAt: string;
}

export interface ExamSubmission {
    id: string | number;
    userId: string;
    mockTestId: string | number;
    testTitle: string;
    score: number;
    totalQuestions: number;
    submittedAt: string;
    answers?: Record<string, number>;
}

// On localhost, use relative URLs (Vite proxy handles them).
// On any other domain (e.g. Hostinger), fetch from the Vercel backend directly.
const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const API_BASE_URL = isLocalhost ? '' : 'https://agri-backend-plux.vercel.app';

class ExamDataService {
    public readonly BUNDLE_PRICE = 2000;
    public readonly BUNDLE_ACCESS_ID = -1;

    async getMockTests(activeOnly: boolean = true): Promise<MockTest[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mock-tests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activeOnly })
            });
            if (!response.ok) throw new Error('Failed to fetch mock tests');
            const data = await response.json();
            return data.map((t: any) => ({
                id: t.id,
                title: t.title,
                description: t.description,
                category: t.category,
                price: parseFloat(t.price),
                imageUrl: t.image_url
            }));
        } catch (error) {
            console.error("Error fetching mock tests:", error);
            return [];
        }
    }

    async getMockTestById(id: string | number): Promise<MockTest | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mock-questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ test_id: id })
            });
            if (!response.ok) throw new Error('Failed to fetch test details');
            const data = await response.json();

            if (!data.test) return null;

            return {
                id: data.test.id,
                title: data.test.title,
                description: data.test.description,
                category: data.test.category,
                price: parseFloat(data.test.price),
                imageUrl: data.test.image_url,
                questions: data.questions.map((q: any) => ({
                    id: q.id,
                    mockTestId: q.mock_test_id,
                    question: q.question_text,
                    options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
                    correctOptionIndex: q.correct_option_index,
                    image: q.image_url,
                    marks: q.marks,
                    topic: q.topic
                }))
            };
        } catch (error) {
            console.error("Error fetching mock test:", error);
            return null;
        }
    }

    async getUserPurchases(userId: string): Promise<UserPurchase[]> {
        if (!userId) return [];
        try {
            const response = await fetch(`${API_BASE_URL}/api/index`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get-user-purchases', payload: { userId } })
            });
            if (!response.ok) return [];
            const data = await response.json();
            const arr = Array.isArray(data) ? data : (data.data || []);
            return arr.map((item: any) => ({
                id: item.id,
                userId: item.userId,
                mockTestId: item.mockTestId,
                amount: item.amount,
                status: item.status,
                purchasedAt: item.purchasedAt
            }));
        } catch {
            return [];
        }
    }

    async getUserSubmissions(email: string): Promise<any[]> {
        return [];
    }

    async grantUserAccess(userId: string, testId: string | number, amount: number): Promise<void> {
        console.log(`Granted access to user ${userId} for test ${testId}`);
    }

    hasBundleAccess(purchases: UserPurchase[]): boolean {
        return purchases.some(p => Number(p.mockTestId) === Number(this.BUNDLE_ACCESS_ID) && p.status === 'active');
    }

    // --- Admin Operations ---

    async uploadImage(file: File, pathFolder: string = 'exam_images'): Promise<string> {
        try {
            const { supabase } = await import('@/lib/supabase');
            const filename = `${pathFolder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;

            const { error } = await supabase.storage
                .from('magazine-files')
                .upload(filename, file);

            if (error) throw error;

            const { data } = supabase.storage
                .from('magazine-files')
                .getPublicUrl(filename);

            return data.publicUrl;
        } catch (error) {
            console.error("Error uploading image to Supabase Storage:", error);
            throw new Error("Failed to upload image.");
        }
    }

    async saveMockTest(test: Partial<MockTest>): Promise<MockTest> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/index`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save-mock-test', payload: test })
            });
            const textData = await response.text();
            let data;
            try { data = JSON.parse(textData); } catch(e) { throw new Error('Invalid backend response: ' + textData.substring(0, 100)); }
            if (!response.ok) throw new Error(data.error || 'Failed to save mock test');
            return data;
        } catch (error) {
            console.error("Error saving mock test:", error);
            throw error;
        }
    }

    async saveMockQuestion(question: Partial<MockQuestion>): Promise<MockQuestion> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/index`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save-mock-question', payload: question })
            });
            const textData = await response.text();
            let data;
            try { data = JSON.parse(textData); } catch(e) { throw new Error('Invalid backend response: ' + textData.substring(0, 100)); }
            if (!response.ok) throw new Error(data.error || 'Failed to save mock question');
            return data;
        } catch (error) {
            console.error("Error saving mock question:", error);
            throw error;
        }
    }

    async deleteMockTest(id: number | string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/index`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete-mock-test', payload: { id } })
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error('Failed to delete mock test: ' + text.substring(0, 50));
            }
        } catch (error) {
            console.error("Error deleting mock test:", error);
            throw error;
        }
    }

    async deleteMockQuestion(id: number | string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/index`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete-mock-question', payload: { id } })
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error('Failed to delete mock question: ' + text.substring(0, 50));
            }
        } catch (error) {
            console.error("Error deleting mock question:", error);
            throw error;
        }
    }
}

export const examDataService = new ExamDataService();
