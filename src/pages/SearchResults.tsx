import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { dataService, SearchResult } from '@/services/dataService';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Calendar, User, BookOpen, Search as SearchIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const data = await dataService.search(query);
                setResults(data);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchResults, 300); // Debounce if typing fast, though usually separate page
        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <Layout>
            <Helmet>
                <title>Search Results: {query} | AgriScience</title>
            </Helmet>
            <div className="container-magazine py-12 md:py-16 min-h-[60vh]">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h1 className="text-3xl font-bold font-display">
                        Search Results for "{query}"
                    </h1>

                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full rounded-xl" />
                            <Skeleton className="h-24 w-full rounded-xl" />
                            <Skeleton className="h-24 w-full rounded-xl" />
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <SearchIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h2 className="text-xl font-semibold mb-2">No results found</h2>
                            <p className="text-muted-foreground">Try adjusting your search terms or checking for spelling errors.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {results.map((result) => (
                                <Link
                                    key={`${result.type}-${result.id}`}
                                    to={result.url}
                                    className="block group bg-card border border-border/50 rounded-xl p-6 hover:shadow-subtle transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${result.type === 'issue' ? 'bg-primary/10' :
                                                result.type === 'editorial' ? 'bg-purple-100 dark:bg-purple-900/20' :
                                                    result.type === 'page' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                                        'bg-secondary'
                                            }`}>
                                            {result.type === 'issue' ? (
                                                <Calendar className="w-6 h-6 text-primary" />
                                            ) : result.type === 'editorial' ? (
                                                <User className="w-6 h-6 text-purple-700 dark:text-purple-400" />
                                            ) : result.type === 'page' ? (
                                                <BookOpen className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                                            ) : (
                                                <FileText className="w-6 h-6 text-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${result.type === 'issue' ? 'bg-primary/20 text-primary-foreground' :
                                                        result.type === 'editorial' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                                                            result.type === 'page' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                                                                'bg-secondary text-secondary-foreground'
                                                    }`}>
                                                    {result.type === 'editorial' ? 'PROFILE' : result.type.toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold font-display group-hover:text-primary transition-colors">
                                                {result.title}
                                            </h3>
                                            <p className="text-muted-foreground mt-2 line-clamp-2">
                                                {result.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default SearchResults;
