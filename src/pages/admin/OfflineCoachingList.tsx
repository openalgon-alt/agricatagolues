import { useState, useEffect } from "react";
import { examDataService, OfflineCoachingCenter } from "@/services/examDataService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function OfflineCoachingList() {
    const [centers, setCenters] = useState<OfflineCoachingCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const [editingCenter, setEditingCenter] = useState<Partial<OfflineCoachingCenter>>({});

    useEffect(() => {
        loadCenters();
    }, []);

    const loadCenters = async () => {
        setLoading(true);
        try {
            const data = await examDataService.getOfflineCoachingCenters();
            setCenters(data);
        } catch (error) {
            toast.error("Failed to load coaching centers");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingCenter.name || !editingCenter.address) {
            toast.error("Name and Address are required");
            return;
        }

        try {
            await examDataService.saveOfflineCoachingCenter(editingCenter);
            toast.success("Coaching center saved!");
            setIsDialogOpen(false);
            loadCenters();
        } catch (error: any) {
            toast.error(error.message || "Failed to save");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this center?")) return;
        
        try {
            await examDataService.deleteOfflineCoachingCenter(id);
            toast.success("Deleted successfully");
            loadCenters();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete");
        }
    };

    const openCreateDialog = () => {
        setEditingCenter({ name: '', address: '', mapUrl: '' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (center: OfflineCoachingCenter) => {
        setEditingCenter(center);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Offline Coaching Centers</h1>
                <Button onClick={openCreateDialog}>
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Center
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Managed Centers</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : centers.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No coaching centers added yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Map Link</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {centers.map((center) => (
                                    <TableRow key={center.id}>
                                        <TableCell className="font-medium">{center.name}</TableCell>
                                        <TableCell>{center.address}</TableCell>
                                        <TableCell>
                                            {center.mapUrl ? (
                                                <a href={center.mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1" /> View
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="icon" onClick={() => openEditDialog(center)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => handleDelete(center.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCenter.id ? 'Edit Center' : 'Add New Center'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Center Name *</Label>
                            <Input
                                id="name"
                                value={editingCenter.name || ''}
                                onChange={(e) => setEditingCenter({ ...editingCenter, name: e.target.value })}
                                placeholder="e.g. Agri Success Hub"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={editingCenter.address || ''}
                                onChange={(e) => setEditingCenter({ ...editingCenter, address: e.target.value })}
                                placeholder="Full street address"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mapUrl">Google Maps URL</Label>
                            <Input
                                id="mapUrl"
                                value={editingCenter.mapUrl || ''}
                                onChange={(e) => setEditingCenter({ ...editingCenter, mapUrl: e.target.value })}
                                placeholder="https://maps.google.com/..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
