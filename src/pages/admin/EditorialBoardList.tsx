import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dataService, EditorialBoardMember, EditorialSection } from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, FolderPlus, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function EditorialBoardList() {
    const [sections, setSections] = useState<EditorialSection[]>([]);
    const [members, setMembers] = useState<EditorialBoardMember[]>([]);
    const [loading, setLoading] = useState(true);

    // Section Editing State
    const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Partial<EditorialSection>>({ title: '', display_order: 0 });

    const loadData = async () => {
        try {
            const [fetchedSections, fetchedMembers] = await Promise.all([
                dataService.getEditorialSections(),
                dataService.getEditorialBoardMembers()
            ]);
            setSections(fetchedSections);
            setMembers(fetchedMembers);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDeleteMember = async (id: string) => {
        if (!confirm("Are you sure you want to delete this member?")) return;
        try {
            await dataService.deleteEditorialMember(id);
            toast.success("Member deleted");
            loadData();
        } catch (error) {
            toast.error("Failed to delete member");
        }
    };

    const handleSaveSection = async () => {
        try {
            await dataService.saveEditorialSection(editingSection);
            toast.success("Section saved");
            setIsSectionDialogOpen(false);
            setEditingSection({ title: '', display_order: 0 });
            loadData();
        } catch (error) {
            toast.error("Failed to save section");
        }
    };

    const handleDeleteSection = async (id: string) => {
        if (!confirm("Delete this section? ensure it is empty first.")) return;
        try {
            await dataService.deleteEditorialSection(id);
            toast.success("Section deleted");
            loadData();
        } catch (error) {
            toast.error("Failed: Ensure section is empty before deleting");
        }
    };

    // Group members by section_id
    // If section_id is missing, fallback to category matching title (legacy support)
    const getMembersForSection = (section: EditorialSection) => {
        return members.filter(m => {
            if (m.section_id) return m.section_id === section.id;
            // Fallback for old records created before section_id
            if (section.title.includes("Chief") && m.category === "Chief") return true;
            if (section.title.includes("Associate") && m.category === "Associate") return true;
            if (section.title.includes("Founder") && m.category === "Founder") return true;
            if (section.title.includes("Reviewer") && m.category === "Reviewer") return true;
            return false;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Editorial Board Management</h1>
                <div className="flex gap-2">
                    <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setEditingSection({ title: '', display_order: sections.length + 1 })}>
                                <FolderPlus className="mr-2 h-4 w-4" />
                                Manage Sections
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingSection.id ? 'Edit Section' : 'Add New Section'}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <Input
                                    placeholder="Section Title (e.g. Regional Editors)"
                                    value={editingSection.title}
                                    onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                                />
                                <Input
                                    type="number"
                                    placeholder="Order"
                                    value={editingSection.display_order}
                                    onChange={(e) => setEditingSection({ ...editingSection, display_order: parseInt(e.target.value) })}
                                />
                                <Button onClick={handleSaveSection} className="w-full">Save Section</Button>

                                {sections.length > 0 && !editingSection.id && (
                                    <div className="pt-4 border-t">
                                        <p className="text-xs text-muted-foreground mb-2">Existing Sections:</p>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {sections.map(s => (
                                                <div key={s.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                                                    <span>{s.title}</span>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" h-6 w-6 onClick={() => setEditingSection(s)}>
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" h-6 w-6 onClick={() => handleDeleteSection(s.id)}>
                                                            <Trash2 className="h-3 w-3 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button asChild>
                        <Link to="/admin/editorial-board/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Member
                        </Link>
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="space-y-8">
                    {sections.map(section => {
                        const sectionMembers = getMembersForSection(section);
                        return (
                            <Card key={section.id}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle>{section.title}</CardTitle>
                                        <Badge variant="secondary">{sectionMembers.length}</Badge>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setEditingSection(section);
                                        setIsSectionDialogOpen(true);
                                    }}>
                                        <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {sectionMembers.length === 0 ? (
                                        <p className="text-muted-foreground italic text-sm">No members in this section.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {sectionMembers.map(member => (
                                                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        {member.image_url ? (
                                                            <img src={member.image_url} alt={member.name} className="h-10 w-10 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                                                                {member.name.substring(0, 2)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-medium">{member.name}</div>
                                                            <div className="text-xs text-muted-foreground">{member.role}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{member.display_order}</Badge>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link to={`/admin/editorial-board/${member.id}`}>
                                                                <Edit className="h-4 w-4 text-blue-500" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
