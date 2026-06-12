import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function AoAaoExamPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          AO / AAO Exam Portal
        </h1>
        
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          The previous AO/AAO exam page code has been cleaned up. This page is ready for your fresh design and implementation.
        </p>

        <div className="flex flex-col gap-3">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <Link to="/">
              <ArrowLeft className="mr-2 w-4 h-4" /> Go to Home Page
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
