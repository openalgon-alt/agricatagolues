import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dataService, Issue, Article } from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/admin/FileUpload";
import { Trash2, Plus, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function IssueEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;

    const [loading, setLoading] = useState(!isNew);
    const [issue, setIssue] = useState<Partial<Issue>>({
        title: "",
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        description: "",
        status: "Draft",
        articles: []
    });

    // Article Modal State
    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({});
    const [editingArticleIndex, setEditingArticleIndex] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            const loadIssue = async () => {
                const data = await dataService.getIssueById(id);
                if (data) {
                    setIssue(data);
                } else {
                    toast.error("Issue not found");
                    navigate("/admin/issues");
                }
                setLoading(false);
            };
            loadIssue();
        }
    }, [id, navigate]);

    const handleSaveIssue = async () => {
        if (!issue.title || !issue.month || !issue.year) {
            toast.error("Please fill in basic issue details");
            return;
        }

        try {
            // 1. Save the Issue first
            const savedIssue = await dataService.saveIssue({
                ...issue,
                id: id // if undefined, it creates new/upserts based on payload
            });

            // 2. Save all articles linked to this issue
            if (issue.articles && issue.articles.length > 0) {
                const articlePromises = issue.articles.map(article =>
                    dataService.saveArticle({
                        ...article,
                        issueId: savedIssue.id // Ensure linkage
                    })
                );
                await Promise.all(articlePromises);
            }

            toast.success(`Issue and ${issue.articles?.length || 0} articles saved successfully`);
            navigate("/admin/issues");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save issue or articles");
        }
    };

    const handleSaveArticle = () => {
        if (!currentArticle.title || !currentArticle.authors) {
            toast.error("Article title and authors are required");
            return;
        }

        const newArticle = {
            ...currentArticle,
            id: currentArticle.id || uuidv4(),
            issueId: id || 'temp', // will be linked properly on save
        } as Article;

        const newArticles = [...(issue.articles || [])];
        if (editingArticleIndex !== null) {
            newArticles[editingArticleIndex] = newArticle;
        } else {
            newArticles.push(newArticle);
        }

        setIssue({ ...issue, articles: newArticles });
        setIsArticleModalOpen(false);
        setCurrentArticle({});
        setEditingArticleIndex(null);
    };

    const handleEditArticle = (index: number) => {
        setCurrentArticle(issue.articles![index]);
        setEditingArticleIndex(index);
        setIsArticleModalOpen(true);
    };

    const handleDeleteArticle = (index: number) => {
        const newArticles = [...(issue.articles || [])];
        newArticles.splice(index, 1);
        setIssue({ ...issue, articles: newArticles });
    };

    const handleFileUpload = async (file: File) => {
        const url = await dataService.uploadFile(file);
        setCurrentArticle(prev => ({ ...prev, pdfUrl: url }));
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin/issues")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">{isNew ? "Create Issue" : "Edit Issue"}</h1>
                </div>
                <Button onClick={handleSaveIssue}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Issue
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Issue Details */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Issue Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Issue Title</Label>
                                <Input
                                    value={issue.title}
                                    onChange={e => setIssue({ ...issue, title: e.target.value })}
                                    placeholder="e.g. Vol 1, Issue 2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Month</Label>
                                    <Select
                                        value={issue.month}
                                        onValueChange={val => setIssue({ ...issue, month: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Year</Label>
                                    <Input
                                        type="number"
                                        value={issue.year}
                                        onChange={e => setIssue({ ...issue, year: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description (SEO)</Label>
                                <Textarea
                                    value={issue.description}
                                    onChange={e => setIssue({ ...issue, description: e.target.value })}
                                    className="h-32"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Articles */}
                <div className="md:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Articles</CardTitle>
                                <CardDescription>Manage articles in this issue</CardDescription>
                            </div>
                            <Dialog open={isArticleModalOpen} onOpenChange={setIsArticleModalOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => { setCurrentArticle({}); setEditingArticleIndex(null); }}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Article
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{editingArticleIndex !== null ? "Edit Article" : "New Article"}</DialogTitle>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Article Title</Label>
                                            <Input
                                                value={currentArticle.title || ""}
                                                onChange={e => setCurrentArticle({ ...currentArticle, title: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Authors</Label>
                                                <Input
                                                    value={currentArticle.authors || ""}
                                                    onChange={e => setCurrentArticle({ ...currentArticle, authors: e.target.value })}
                                                    placeholder="e.g. Dr. Smith, John Doe"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Affiliation</Label>
                                                <Input
                                                    value={currentArticle.affiliation || ""}
                                                    onChange={e => setCurrentArticle({ ...currentArticle, affiliation: e.target.value })}
                                                    placeholder="University/Institute"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Combined PDF Upload</Label>
                                            <FileUpload
                                                onFileSelect={handleFileUpload}
                                                label={currentArticle.pdfUrl ? "File Uploaded (Click to change)" : "Upload Article PDF"}
                                            />
                                            <div className="relative flex items-center gap-2 my-2">
                                                <div className="h-px bg-slate-200 grow"></div>
                                                <span className="text-xs text-slate-400 font-medium">OR</span>
                                                <div className="h-px bg-slate-200 grow"></div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-slate-500">Manual PDF Path (e.g. /pdfs/article.pdf)</Label>
                                                <Input
                                                    value={currentArticle.pdfUrl || ""}
                                                    onChange={e => setCurrentArticle({ ...currentArticle, pdfUrl: e.target.value })}
                                                    placeholder="/pdfs/filename.pdf"
                                                    className="text-sm"
                                                />
                                            </div>
                                            {currentArticle.pdfUrl && (
                                                <p className="text-xs text-green-600 mt-1">✓ PDF linked: {currentArticle.pdfUrl}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Abstract</Label>
                                            <Textarea
                                                value={currentArticle.abstract || ""}
                                                onChange={e => setCurrentArticle({ ...currentArticle, abstract: e.target.value })}
                                                className="h-24"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Keywords</Label>
                                            <Input
                                                value={currentArticle.keywords || ""}
                                                onChange={e => setCurrentArticle({ ...currentArticle, keywords: e.target.value })}
                                                placeholder="Comma separated"
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button onClick={handleSaveArticle}>Save Article</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {issue.articles?.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No articles added yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {issue.articles?.map((article, idx) => (
                                        <div key={idx} className="flex items-start justify-between p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                            <div>
                                                <h4 className="font-semibold line-clamp-1">{article.title}</h4>
                                                <p className="text-sm text-muted-foreground">{article.authors}</p>
                                                {article.pdfUrl ? (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block">PDF Attached</span>
                                                ) : (
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full mt-1 inline-block">No PDF</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditArticle(idx)}>Edit</Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteArticle(idx)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
