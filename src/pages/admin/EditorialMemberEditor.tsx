import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dataService, EditorialBoardMember, EditorialSection } from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Upload, Plus, Trash } from "lucide-react";

export default function EditorialMemberEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [sections, setSections] = useState<EditorialSection[]>([]);

    const [formData, setFormData] = useState<Partial<EditorialBoardMember>>({
        name: "",
        role: "",
        affiliation: "",
        location: "",
        email: "",
        profile_link: "",
        section_id: "",
        custom_fields: [],
        display_order: 0
    });

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const fetchedSections = await dataService.getEditorialSections();
                setSections(fetchedSections);

                if (id) {
                    const members = await dataService.getEditorialBoardMembers();
                    const member = members.find(m => m.id === id);
                    if (member) {
                        setFormData({
                            ...member,
                            // Ensure custom_fields is at least empty array if null
                            custom_fields: member.custom_fields || []
                        });
                    }
                } else if (fetchedSections.length > 0) {
                    // Default to first section
                    setFormData(prev => ({ ...prev, section_id: fetchedSections[0].id }));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const url = await dataService.uploadMemberImage(e.target.files[0]);
                setFormData(prev => ({ ...prev, image_url: url }));
                toast.success("Image uploaded successfully");
            } catch (error) {
                toast.error("Failed to upload image");
            }
        }
    };

    // Custom Fields Logic
    const addCustomField = () => {
        setFormData(prev => ({
            ...prev,
            custom_fields: [...(prev.custom_fields || []), { label: "", value: "" }]
        }));
    };

    const updateCustomField = (index: number, field: 'label' | 'value', text: string) => {
        const newFields = [...(formData.custom_fields || [])];
        newFields[index] = { ...newFields[index], [field]: text };
        setFormData(prev => ({ ...prev, custom_fields: newFields }));
    };

    const removeCustomField = (index: number) => {
        const newFields = [...(formData.custom_fields || [])];
        newFields.splice(index, 1);
        setFormData(prev => ({ ...prev, custom_fields: newFields }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await dataService.saveEditorialMember({ ...formData, id });
            toast.success("Member saved successfully");
            navigate("/admin/editorial-board");
        } catch (error) {
            toast.error("Failed to save member");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/admin/editorial-board")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">{id ? "Edit Member" : "Add New Member"}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Member Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="section_id">Section *</Label>
                                <Select
                                    value={formData.section_id}
                                    onValueChange={(val: any) => setFormData(prev => ({ ...prev, section_id: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map(section => (
                                            <SelectItem key={section.id} value={section.id}>
                                                {section.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role / Designation *</Label>
                                <Input id="role" name="role" placeholder="e.g. Professor and Head" value={formData.role} onChange={handleChange} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="affiliation">Affiliation / University</Label>
                                <Input id="affiliation" name="affiliation" value={formData.affiliation} onChange={handleChange} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" name="location" placeholder="City, State, Country" value={formData.location} onChange={handleChange} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profile_link">Institution Profile</Label>
                                <Input id="profile_link" name="profile_link" placeholder="https://..." value={formData.profile_link} onChange={handleChange} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="display_order">Display Order</Label>
                                <Input id="display_order" name="display_order" type="number" value={formData.display_order} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <div className="flex justify-between items-center mb-2">
                                <Label className="text-base">Custom Fields</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Field
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-4">Add extra details like Twitter, LinkedIn, Research Area, etc.</p>

                            <div className="space-y-3">
                                {formData.custom_fields?.map((field, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <Input
                                            placeholder="Label (e.g. Research Area)"
                                            value={field.label}
                                            onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                                            className="w-1/3"
                                        />
                                        <Input
                                            placeholder="Value"
                                            value={field.value}
                                            onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                                            className="w-2/3"
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomField(index)}>
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <Label>Profile Photo</Label>
                            <div className="flex items-center gap-4">
                                {formData.image_url && (
                                    <img src={formData.image_url} alt="Profile" className="h-20 w-20 object-cover rounded border" />
                                )}
                                <label className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Upload Image
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Save Member
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
