import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    phone: z.string().min(10, "Valid phone number required").max(15),
    email: z.string().email("Invalid email address"),
    college: z.string().min(2, "College name is required"),
});

interface UserDetailsModalProps {
    isOpen: boolean;
    onComplete: (data: z.infer<typeof formSchema>) => void;
}

export function UserDetailsModal({ isOpen, onComplete }: UserDetailsModalProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            college: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        onComplete(values);
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[425px] on-dialog-overlay-click-prevent" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Student Registration</DialogTitle>
                    <DialogDescription>
                        Please enter your details to start the State Level Agriculture Entrance Exam.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="9876543210" {...field} />
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
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="college"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>College / Institution</FormLabel>
                                    <FormControl>
                                        <Input placeholder="University of Agriculture..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Start Exam
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
