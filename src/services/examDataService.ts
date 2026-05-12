export interface OfflineCoachingCenter {
    id: number;
    name: string;
    address: string;
    mapUrl: string;
}

// On localhost, use relative URLs (Vite proxy handles them).
// On any other domain (e.g. Hostinger), fetch from the Vercel backend directly.
const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const API_BASE_URL = isLocalhost ? '' : 'https://agri-backend-plux.vercel.app';

class ExamDataService {
    async getOfflineCoachingCenters(): Promise<OfflineCoachingCenter[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/offline-coaching`);
            if (!response.ok) throw new Error('Failed to fetch offline coaching centers');
            return await response.json();
        } catch (error) {
            console.error("Error fetching offline coaching centers:", error);
            return [];
        }
    }

    async saveOfflineCoachingCenter(center: Partial<OfflineCoachingCenter>): Promise<OfflineCoachingCenter> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/save-offline-coaching`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(center)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to save offline coaching center');
            return data;
        } catch (error) {
            console.error("Error saving offline coaching center:", error);
            throw error;
        }
    }

    async deleteOfflineCoachingCenter(id: number | string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/delete-offline-coaching`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error('Failed to delete offline coaching center: ' + text.substring(0, 50));
            }
        } catch (error) {
            console.error("Error deleting offline coaching center:", error);
            throw error;
        }
    }

}

export const examDataService = new ExamDataService();
