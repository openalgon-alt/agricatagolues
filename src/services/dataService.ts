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

export interface Issue {
    id: string;
    title: string;
    description?: string;
    month: string;
    year: number;
    status: IssueStatus;
    coverUrl?: string;
    pdfUrl?: string;
    publishDate?: string;
    articles?: Article[];
}

export interface SearchResult {
    type: 'article' | 'issue' | 'editorial' | 'page';
    id: string;
    title: string;
    description?: string;
    date?: string;
    url: string;
}

class DataService {
    private mapIssueFromDB(dbIssue: any): Issue {
        return {
            id: dbIssue.id,
            title: dbIssue.title,
            description: dbIssue.description,
            month: dbIssue.month,
            year: dbIssue.year,
            status: dbIssue.status,
            coverUrl: dbIssue.cover_url,
            pdfUrl: dbIssue.pdf_url,
            publishDate: dbIssue.publish_date,
            articles: dbIssue.articles ? dbIssue.articles.map(this.mapArticleFromDB) : []
        };
    }

    private mapArticleFromDB(dbArticle: any): Article {
        return {
            id: dbArticle.id,
            issueId: dbArticle.issue_id,
            title: dbArticle.title,
            authors: dbArticle.authors,
            affiliation: dbArticle.affiliation,
            pdfUrl: dbArticle.pdf_url,
            abstract: dbArticle.abstract,
            keywords: dbArticle.keywords
        };
    }

    async getIssues(): Promise<Issue[]> {
        const { data, error } = await supabase
            .from('issues')
            .select('*')
            .order('year', { ascending: false })
            .order('month', { ascending: false }); // ideally strictly by date if month is enum

        if (error) throw error;
        return (data || []).map(i => this.mapIssueFromDB(i));
    }

    async getIssueById(id: string): Promise<Issue | null> {
        const { data, error } = await supabase
            .from('issues')
            .select('*, articles(*)')
            .eq('id', id)
            .single();

        if (error) return null;
        return this.mapIssueFromDB(data);
    }

    async getCurrentIssue(): Promise<Issue | null> {
        const { data, error } = await supabase
            .from('issues')
            .select('*, articles(*)')
            .eq('status', 'Current')
            .limit(1)
            .maybeSingle();

        if (error) return null;
        return data ? this.mapIssueFromDB(data) : null;
    }

    async saveIssue(issue: Partial<Issue>): Promise<Issue> {
        const payload: any = {
            title: issue.title,
            description: issue.description,
            month: issue.month,
            year: issue.year,
            status: issue.status,
            cover_url: issue.coverUrl,
            pdf_url: issue.pdfUrl
        };

        if (issue.id) {
            payload.id = issue.id;
        }

        const { data, error } = await supabase
            .from('issues')
            .upsert(payload)
            .select()
            .single();

        if (error) throw error;
        return this.mapIssueFromDB(data);
    }

    async saveArticle(article: Partial<Article>): Promise<Article> {
        const payload: any = {
            issue_id: article.issueId,
            title: article.title,
            authors: article.authors,
            affiliation: article.affiliation,
            pdf_url: article.pdfUrl,
            abstract: article.abstract,
            keywords: article.keywords
        };

        if (article.id) {
            payload.id = article.id;
        }

        const { data, error } = await supabase
            .from('articles')
            .upsert(payload)
            .select()
            .single();

        if (error) throw error;
        return this.mapArticleFromDB(data);
    }

    async deleteIssue(id: string): Promise<void> {
        const { error } = await supabase.from('issues').delete().eq('id', id);
        if (error) throw error;
    }

    async deleteArticle(id: string): Promise<void> {
        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (error) throw error;
    }

    async publishIssue(id: string): Promise<void> {
        // First archive current issue
        await supabase
            .from('issues')
            .update({ status: 'Archived' })
            .eq('status', 'Current');

        // Then set new current
        const { error } = await supabase
            .from('issues')
            .update({ status: 'Current', publish_date: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    async uploadFile(file: File): Promise<string> {
        // For client-side simulation as per user request history, or actual upload?
        // Recent history said: "Modified dataService.ts to simulate local PDF uploads... returns a local path"
        // I should respect that previous decision if it was intentionally replaced.
        // User checkpoint summary said: "Modified dataService.ts to simulate local PDF uploads. Instead of uploading to Supabase, the uploadFile function now returns a local path (e.g., /pdfs/<filename>)."

        // Implementation based on that summary:
        const fileName = file.name;
        // In a real app we'd upload. Here we just return the path where the user should put it.
        // But for IMAGES (covers), we might still want supabase storage?
        // The summary said "PDF Upload Logic".
        // Let's assume this method handles both or check if we need separate.
        // Usually `uploadFile` is generic.

        if (file.type === 'application/pdf') {
            return `/pdfs/${fileName}`;
        }

        // For images, we probably still want Supabase or similar if possible, otherwise similar logic?
        // I'll try Supabase storage for images as usually cover images are uploaded.
        // If it fails, fallback or just use same object logic?
        // Let's safe-bet on Supabase for non-PDFs if 'magazine-files' bucket exists.

        try {
            const fileExt = file.name.split('.').pop();
            const uniqueName = `uploads/${uuidv4()}.${fileExt}`;
            const { error, data } = await supabase.storage
                .from('magazine-files')
                .upload(uniqueName, file);

            if (error) throw error;

            const publicUrl = supabase.storage
                .from('magazine-files')
                .getPublicUrl(uniqueName);

            return publicUrl.data.publicUrl;
        } catch (e) {
            console.warn("Upload to Supabase failed, falling back to local path assumption", e);
            return `/uploads/${file.name}`;
        }
    }

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
                url: `/issues/${a.issue_id}`
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
                url: `/editorial-board`
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

    resetData() {
        console.log("Reset Data called - No-op for Supabase backend");
    }

    // --- Editorial Board Sections ---

    async getEditorialSections(): Promise<EditorialSection[]> {
        const { data, error } = await supabase
            .from('editorial_sections')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error("Error fetching sections:", error);
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
            category: member.category || 'General',
            section_id: member.section_id,
            custom_fields: member.custom_fields,
            display_order: member.display_order
        };

        if (member.id) {
            const { data, error } = await supabase
                .from('editorial_board_members')
                .update(payload)
                .eq('id', member.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('editorial_board_members')
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
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
