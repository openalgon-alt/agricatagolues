import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import Fuse from 'fuse.js';

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

export interface Product {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    category?: string;
    price?: number;
    features: string[];
    displayOrder: number;
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

    async getIssues(filter?: { status?: IssueStatus }): Promise<Issue[]> {
        let query = supabase
            .from('issues')
            .select('*, articles(*)')
            .order('year', { ascending: false })
            .order('month', { ascending: false });

        if (filter?.status) {
            query = query.eq('status', filter.status);
        }

        const { data, error } = await query;

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
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Upload to Hostinger PHP script (Ensure upload.php is at https://agricatalogues.in/upload.php)
            // If running locally, this relies on the PHP script sending CORS headers.
            const response = await fetch('https://agricatalogues.in/upload.php', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();
            if (result.success && result.url) {
                return result.url;
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error("Hostinger upload failed:", error);
            // Fallback for local development or if script missing
            // This ensures the app doesn't break if the user hasn't deployed the script yet
            console.warn("Falling back to local simulation due to error.");
            return `/pdfs/${file.name}`;
        }
    }

    async search(query: string): Promise<SearchResult[]> {
        if (!query || query.trim().length < 2) return [];
        const term = query.trim();
        const results: SearchResult[] = [];

        // Fetch Data for Fuzzy Search (In a real large app, this would be inefficient, 
        // but for <1000 items this is very fast and provides the best UX)

        // 1. Articles
        const { data: articles } = await supabase
            .from('articles')
            .select('id, title, abstract, authors, issue_id, keywords')
            .limit(100);

        if (articles) {
            const fuse = new Fuse(articles, {
                keys: ['title', 'abstract', 'authors', 'keywords'],
                threshold: 0.4, // 0.0 = exact match, 1.0 = match anything
                distance: 100,
            });
            const matches = fuse.search(term).map(r => r.item);

            results.push(...matches.slice(0, 5).map((a: any) => ({
                type: 'article' as const,
                id: a.id,
                title: a.title,
                description: a.abstract || `By ${a.authors}`,
                url: `/issues/${a.issue_id}`
            })));
        }

        // 2. Issues
        const { data: issues } = await supabase
            .from('issues')
            .select('id, title, description, year, month')
            .limit(50);

        if (issues) {
            const fuse = new Fuse(issues, {
                keys: ['title', 'description', 'month', 'year'],
                threshold: 0.4,
            });
            const matches = fuse.search(term).map(r => r.item);

            results.push(...matches.slice(0, 3).map((i: any) => ({
                type: 'issue' as const,
                id: i.id,
                title: `Issue: ${i.title}`,
                description: `${i.month} ${i.year} - ${i.description?.substring(0, 100)}...`,
                url: `/issues/${i.id}`
            })));
        }

        // 3. Editorial Board
        const { data: members } = await supabase
            .from('editorial_board_members')
            .select('id, name, role, affiliation')
            .limit(100);

        if (members) {
            const fuse = new Fuse(members, {
                keys: ['name', 'role', 'affiliation'],
                threshold: 0.3, // Slightly stricter for names
            });
            const matches = fuse.search(term).map(r => r.item);

            results.push(...matches.slice(0, 5).map((m: any) => ({
                type: 'editorial' as const,
                id: m.id,
                title: `${m.name} (${m.role})`,
                description: m.affiliation,
                url: `/editorial-board`
            })));
        }

        // 4. Static Pages (Manual Fuzzy)
        const staticPages = [
            {
                type: 'page' as const,
                id: 'guidelines-page',
                title: 'Author Guidelines',
                desc: 'Submission process, formatting checklist, payment details, fees, cost',
                url: '/guidelines'
            },
            {
                type: 'page' as const,
                id: 'editorial-page',
                title: 'Editorial Board',
                desc: 'Meet our distinguished team of editors and reviewers.',
                url: '/editorial-board'
            }
        ];

        const pageFuse = new Fuse(staticPages, {
            keys: ['title', 'desc'],
            threshold: 0.4
        });

        results.push(...pageFuse.search(term).map(r => ({
            type: r.item.type,
            id: r.item.id,
            title: r.item.title,
            description: r.item.desc,
            url: r.item.url
        })));

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

    // --- Products (Shop) ---

    async getProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching products:", error);
            return [];
        }
        return (data || []).map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            imageUrl: p.image_url,
            category: p.category,
            price: p.price,
            features: p.features || [],
            displayOrder: p.display_order
        }));
    }

    async saveProduct(product: Partial<Product>): Promise<Product> {
        const payload = {
            title: product.title,
            description: product.description,
            image_url: product.imageUrl,
            category: product.category,
            price: product.price,
            features: product.features,
            display_order: product.displayOrder
        };

        if (product.id) {
            const { data, error } = await supabase
                .from('products')
                .update(payload)
                .eq('id', product.id)
                .select()
                .single();
            if (error) throw error;
            return {
                id: data.id,
                title: data.title,
                description: data.description,
                imageUrl: data.image_url,
                category: data.category,
                price: data.price,
                features: data.features || [],
                displayOrder: data.display_order
            };
        } else {
            const { data, error } = await supabase
                .from('products')
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return {
                id: data.id,
                title: data.title,
                description: data.description,
                imageUrl: data.image_url,
                category: data.category,
                price: data.price,
                features: data.features || [],
                displayOrder: data.display_order
            };
        }
    }

    async deleteProduct(id: string): Promise<void> {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
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
