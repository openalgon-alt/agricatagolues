import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export type IssueStatus = 'Current' | 'Archived' | 'Draft';

export interface Article {
    id: string;
    issueId: string;
    title: string;
    authors: string;
    affiliation: string;
    pdfUrl: string;
    abstract?: string;
    keywords?: string;
}

export interface SearchResult {
    type: 'article' | 'issue' | 'editorial' | 'page';
    id: string;
    title: string;
    description?: string; // Abstract for article, Description for issue
    date?: string; // Publish date or Year
    url: string; // Link to view
}

// ... (Issue interface remains unchanged)

class DataService {
    // ... (mapIssueFromDB remains unchanged)
    // ... (getIssues remains unchanged)
    // ... (getIssueById remains unchanged)
    // ... (getCurrentIssue remains unchanged)
    // ... (saveIssue remains unchanged)
    // ... (deleteIssue remains unchanged)
    // ... (publishIssue remains unchanged)
    // ... (uploadFile remains unchanged)

    async search(query: string): Promise<SearchResult[]> {
        if (!query || query.trim().length < 2) return [];
        const term = `%${query.trim()}%`;
        const lowerQuery = query.toLowerCase();
        const results: SearchResult[] = [];

        // 1. Search Articles
        const { data: articles, error: articleError } = await supabase
            .from('articles')
            .select('id, title, abstract, authors, issue_id')
            .or(`title.ilike.${term},abstract.ilike.${term},authors.ilike.${term},keywords.ilike.${term}`)
            .limit(5);

        if (!articleError && articles) {
            results.push(...articles.map((a: any) => ({
                type: 'article' as const,
                id: a.id,
                title: a.title,
                description: a.abstract || `By ${a.authors}`,
                url: `/issues/${a.issue_id}` // Articles don't have direct pages, usually open in issue view? Or maybe we should link to PDF?
                // For now keeping consistent: open issue view
            })));
        }

        // 2. Search Issues
        const { data: issues, error: issueError } = await supabase
            .from('issues')
            .select('id, title, description, year, month')
            .or(`title.ilike.${term},description.ilike.${term}`)
            .limit(3);

        if (!issueError && issues) {
            results.push(...issues.map((i: any) => ({
                type: 'issue' as const,
                id: i.id,
                title: `Issue: ${i.title}`,
                description: `${i.month} ${i.year} - ${i.description?.substring(0, 100)}...`,
                url: `/issues/${i.id}`
            })));
        }

        // 3. Search Editorial Board
        const { data: members, error: memberError } = await supabase
            .from('editorial_board_members')
            .select('id, name, role, affiliation')
            .or(`name.ilike.${term},role.ilike.${term},affiliation.ilike.${term}`)
            .limit(5);

        if (!memberError && members) {
            results.push(...members.map((m: any) => ({
                type: 'editorial' as const,
                id: m.id,
                title: `${m.name} (${m.role})`,
                description: m.affiliation,
                url: `/editorial-board` // All point to the main board page
            })));
        }

        // 4. Search Static Pages (Guidelines, etc.)
        const guidelineKeywords = ['guideline', 'author', 'submission', 'submit', 'format', 'payment', 'fee', 'check'];
        if (guidelineKeywords.some(k => lowerQuery.includes(k))) {
            results.push({
                type: 'page',
                id: 'guidelines-page',
                title: 'Author Guidelines',
                description: 'Submission process, formatting checklist, payment details, and publication policies.',
                url: '/guidelines'
            });
        }

        // Editorial Board page specific search
        if (['editorial', 'board', 'editor', 'team'].some(k => lowerQuery.includes(k))) {
            results.push({
                type: 'page',
                id: 'editorial-page',
                title: 'Editorial Board',
                description: 'Meet our distinguished team of editors and reviewers.',
                url: '/editorial-board'
            });
        }

        return results;
    }

    // resetData is not relevant for Supabase, but keeping method signature to avoid breaking calling code if any
    resetData() {
        console.log("Reset Data called - No-op for Supabase backend (Delete tables manually in dashboard if needed)");
        alert("Cannot reset remote Supabase database from here. Please use Supabase Dashboard.");
    }

    // --- Editorial Board Sections ---

    async getEditorialSections(): Promise<EditorialSection[]> {
        const { data, error } = await supabase
            .from('editorial_sections')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error("Error fetching sections:", error);
            // Fallback for UI if table doesn't exist yet
            return [];
        }
        return data || [];
    }

    async saveEditorialSection(section: Partial<EditorialSection>): Promise<EditorialSection> {
        if (section.id) {
            const { data, error } = await supabase
                .from('editorial_sections')
                .update({ title: section.title, display_order: section.display_order })
                .eq('id', section.id)
                .select().single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('editorial_sections')
                .insert({ title: section.title, display_order: section.display_order })
                .select().single();
            if (error) throw error;
            return data;
        }
    }

    async deleteEditorialSection(id: string): Promise<void> {
        const { error } = await supabase.from('editorial_sections').delete().eq('id', id);
        if (error) throw error;
    }

    // --- Editorial Board Members ---

    async getEditorialBoardMembers(): Promise<EditorialBoardMember[]> {
        const { data, error } = await supabase
            .from('editorial_board_members')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error("Error fetching editorial board:", error);
            return [];
        }
        return data || [];
    }

    async saveEditorialMember(member: Partial<EditorialBoardMember>): Promise<EditorialBoardMember> {
        const payload = {
            name: member.name,
            role: member.role,
            affiliation: member.affiliation,
            location: member.location,
            email: member.email,
            profile_link: member.profile_link,
            image_url: member.image_url,
            category: member.category || 'General', // Fallback for legacy NOT NULL constraint
            section_id: member.section_id,
            custom_fields: member.custom_fields,
            display_order: member.display_order
        };

        let data, error;

        if (member.id) {
            // Update
            const response = await supabase
                .from('editorial_board_members')
                .update(payload)
                .eq('id', member.id)
                .select()
                .single();
            data = response.data;
            error = response.error;
        } else {
            // Insert
            const response = await supabase
                .from('editorial_board_members')
                .insert(payload)
                .select()
                .single();
            data = response.data;
            error = response.error;
        }

        if (error) throw error;
        return data;
    }

    async deleteEditorialMember(id: string): Promise<void> {
        const { error } = await supabase
            .from('editorial_board_members')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }

    async uploadMemberImage(file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `members/${uuidv4()}.${fileExt}`;

        const { error } = await supabase.storage
            .from('magazine-files')
            .upload(fileName, file);

        if (error) throw error;

        const { data } = supabase.storage
            .from('magazine-files')
            .getPublicUrl(fileName);

        return data.publicUrl;
    }
}

export interface EditorialSection {
    id: string;
    title: string;
    display_order: number;
}

export interface EditorialBoardMember {
    id: string;
    name: string;
    role: string;
    affiliation?: string;
    location?: string;
    email?: string;
    profile_link?: string;
    image_url?: string;
    category?: string;
    section_id?: string;
    custom_fields?: { label: string; value: string }[];
    display_order: number;
}

export const dataService = new DataService();
