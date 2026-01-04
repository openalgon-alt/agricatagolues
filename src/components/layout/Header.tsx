import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Calendar, User, BookOpen, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, SearchResult } from '@/services/dataService';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Editorial Board', path: '/editorial-board' },
  { name: 'Guidelines', path: '/guidelines' },
  { name: 'Current Issue', path: '/current-issue' },
  { name: 'Archives', path: '/archives' },
  { name: 'Contact', path: '/contact' },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await dataService.search(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Live search error:", error);
      } finally {
        // Keep isSearching true to show results window until manually closed or navigated
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      closeSearch();
    }
  };

  const closeSearch = () => {
    setIsOpen(false);
    setShowMobileSearch(false);
    setSearchResults([]);
    setIsSearching(false);
    setSearchQuery('');
  };

  const handleResultClick = (url: string) => {
    navigate(url);
    closeSearch();
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <nav className="container-magazine" aria-label="Main navigation">
        <div className="flex items-center justify-between h-20 md:h-24 gap-4">
          {/* Mobile Menu Button - Moved to Left */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors -ml-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group mr-auto lg:mr-0"
            aria-label="AgriScience Journal Home"
            onClick={closeSearch}
          >
            <img
              src="/src/assets/main-logo.png"
              alt="AgriCatalogues Logo"
              className="h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === item.path
                  ? 'text-primary bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-md"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="w-6 h-6 text-muted-foreground" />
            </button>

            {/* Desktop Search / Mobile Expandable Search */}
            <div className={`${showMobileSearch ? 'absolute top-full left-0 right-0 p-4 bg-background border-b border-border shadow-lg animate-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto' : 'hidden'} lg:block lg:relative lg:w-[28rem] lg:bg-transparent lg:border-none lg:shadow-none lg:overflow-visible`}>
              <form onSubmit={handleSearch} className="relative z-50">
                <Search className="absolute left-6 top-7 lg:left-3 lg:top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search journal..."
                  className="pl-12 lg:pl-9 h-10 lg:h-9 bg-muted/50 focus:bg-background transition-colors w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus={showMobileSearch}
                />
              </form>

              {/* Live Search Results */}
              <AnimatePresence>
                {searchQuery.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-card border border-border shadow-xl rounded-lg overflow-hidden z-[60]"
                  >
                    {searchResults.length > 0 ? (
                      <div className="py-2 max-h-[60vh] overflow-y-auto">
                        {searchResults.map((result) => (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleResultClick(result.url)}
                            className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-start gap-3 border-b border-border/40 last:border-0"
                          >
                            <div className={`p-2 rounded-md shrink-0 ${result.type === 'issue' ? 'bg-primary/10 text-primary' :
                                result.type === 'editorial' ? 'bg-purple-100 text-purple-700' :
                                  result.type === 'page' ? 'bg-blue-100 text-blue-700' :
                                    'bg-secondary text-secondary-foreground'
                              }`}>
                              {result.type === 'issue' ? <Calendar className="w-4 h-4" /> :
                                result.type === 'editorial' ? <User className="w-4 h-4" /> :
                                  result.type === 'page' ? <BookOpen className="w-4 h-4" /> :
                                    <FileText className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground line-clamp-1">{result.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{result.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Menu Only (Search moved to header) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1 border-t border-border">
                {/* Search removed from inside menu as it's now accessible via icon in header */}
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-4 text-lg font-medium rounded-md transition-colors ${location.pathname === item.path
                      ? 'text-primary bg-muted'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};
