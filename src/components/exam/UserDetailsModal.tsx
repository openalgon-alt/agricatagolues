import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Phone, Mail, GraduationCap, MapPin, Users, Briefcase, Shield, Loader2 } from "lucide-react";
import mainLogoImg from "@/assets/main-logo.png";

const CategoryEnum = z.enum(["General", "SC", "ST", "OBC", "EWS", "Other"]);
const formSchema = z.object({
    name: z.string().min(2, "Full name is required"),
    mobile: z.string().min(10, "Valid 10-digit mobile number required").max(15, "Mobile number too long").regex(/^[0-9+\s-]+$/, "Invalid mobile number"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    college: z.string().min(2, "University / College name is required"),
    category: CategoryEnum,
});

export type ProfileFormData = z.infer<typeof formSchema>;

interface UserDetailsModalProps {
    isOpen: boolean;
    userEmail?: string;
    initialData?: Partial<ProfileFormData>;
    onComplete: (data: ProfileFormData) => Promise<void> | void;
    onCancel?: () => void;
}

export function UserDetailsModal({ isOpen, userEmail, initialData, onComplete, onCancel }: UserDetailsModalProps) {
    const form = useForm<ProfileFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            mobile: "",
            email: userEmail || "",
            college: "",
            category: "General",
        },
    });

    // Auto-fill email when prop changes (e.g. right after sign-up)
    useEffect(() => {
        if (userEmail) {
            form.setValue("email", userEmail);
        }
    }, [userEmail, form]);

    // Pre-fill form with existing profile data when opened in edit mode
    useEffect(() => {
        if (isOpen && initialData) {
            form.reset({
                name: initialData.name || "",
                mobile: initialData.mobile || "",
                email: initialData.email || userEmail || "",
                college: initialData.college || "",
                category: (initialData as any).category || "General",
            });
        }
    }, [isOpen, initialData, userEmail]);

    async function onSubmit(values: ProfileFormData) {
        await onComplete(values);
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent
                className="w-screen h-[100dvh] max-w-none rounded-none border-0 p-0 overflow-hidden flex fixed top-0 left-0 translate-x-0 translate-y-0 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0 data-[state=open]:zoom-in-100 [&>button]:hidden text-gray-800 bg-white"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogTitle className="sr-only">Profile Creation</DialogTitle>
                <DialogDescription className="sr-only">Complete your student profile to continue</DialogDescription>

                {/* Left brand panel */}
                <div className="hidden lg:flex flex-col justify-between w-[38%] bg-black text-white p-12 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative z-10">
                        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg inline-block shadow-lg">
                            <img src={mainLogoImg} alt="AgriCatalogues Logo" className="w-32 h-auto" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold uppercase tracking-wider mb-6">
                            <Shield className="w-3.5 h-3.5" /> Profile Setup
                        </div>
                        <h2 className="text-3xl font-bold text-white/95 leading-tight mb-4">
                            One last step<br />before you begin.
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Your profile helps us personalise your exam experience and keep your results secure.
                        </p>
                    </div>
                    <div className="relative z-10 text-xs text-green-100/50 font-medium">© 2026 AgriCatalogues</div>
                </div>

                {/* Right form panel */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 px-6 pt-6 pb-2 border-b border-gray-100">
                        <img src={mainLogoImg} alt="AgriCatalogues Logo" className="h-8 w-auto" />
                        <span className="text-sm font-semibold text-gray-700">Profile Creation</span>
                    </div>

                    <div className="max-w-2xl mx-auto px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Complete Your Profile</h1>
                            <p className="text-gray-500 mt-1.5 text-sm">Fill in all fields below. Your email is pre-filled from your account.</p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">

                                {/* Section: Personal Info */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <User className="w-3.5 h-3.5 text-green-700" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Personal Info</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="sm:col-span-2">
                                                    <FormLabel className="text-gray-700 text-sm font-medium">
                                                        Full Name <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <Input placeholder="e.g. Arjun Kumar" className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="mobile"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 text-sm font-medium">
                                                        Mobile Number <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <Input placeholder="9876543210" type="tel" className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 text-sm font-medium">Email Address</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <Input
                                                                type="email"
                                                                placeholder={userEmail || initialData?.email ? "Auto-filled" : "e.g. name@example.com"}
                                                                className={`pl-9 h-11 ${userEmail || initialData?.email ? 'bg-green-50 border-green-200 text-gray-600 cursor-not-allowed' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                                                                readOnly={!!(userEmail || initialData?.email)}
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-100" />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="college"
                                            render={({ field }) => (
                                                <FormItem className="sm:col-span-2">
                                                    <FormLabel className="text-gray-700 text-sm font-medium">
                                                        University / College Name <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <Input placeholder="e.g. University of Agricultural Sciences" className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                            <FormField
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-700 text-sm font-medium">
                                                            Category <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <select {...field} className="w-full h-11 bg-gray-50 border border-gray-200 rounded px-3">
                                                                <option value="">Select category</option>
                                                                <option value="General">General</option>
                                                                <option value="SC">SC</option>
                                                                <option value="ST">ST</option>
                                                                <option value="OBC">OBC</option>
                                                                <option value="EWS">EWS</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                    </div>

                                <div className="flex flex-col gap-3 mt-8">
                                    <Button
                                        type="submit"
                                        disabled={form.formState.isSubmitting}
                                        className="w-full h-12 text-base bg-green-700 hover:bg-green-800 font-semibold shadow-sm text-white"
                                    >
                                        {form.formState.isSubmitting ? (
                                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
                                        ) : (
                                            initialData ? 'Save Changes' : 'Create Profile'
                                        )}
                                    </Button>
                                    {onCancel && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={onCancel}
                                            className="w-full h-12 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            {initialData ? 'Close' : 'Cancel & Logout'}
                                        </Button>
                                    )}
                                </div>

                            </form>
                        </Form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
