import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Award, Clock, BookOpen, ArrowRight, BrainCircuit, ShieldCheck, Microscope, LineChart, GraduationCap, Users, BarChart3 } from "lucide-react";
// import kishoreImg from "@/assets/kishore.jpeg"; // Removed as per instruction
// imports removed
import heroWheatImg from "@/assets/hero-wheat.jpg";
import mainLogoImg from "@/assets/main-logo.png";


interface ExamLandingProps {
    onStart: () => void;
    onLogin?: () => void;
    onSignup?: () => void;
}

export function ExamLanding({ onStart, onLogin }: ExamLandingProps) {
    return (
        <div className="min-h-screen bg-white font-jakarta text-gray-800">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-green-900 text-white pt-10 pb-16 lg:pt-16 lg:pb-24">
                
                {/* Top Right Auth Button */}
                <div className="absolute top-4 right-4 z-50 md:top-6 md:right-6">
                    <Button 
                        onClick={onLogin}
                        className="bg-white text-green-800 hover:bg-green-50 shadow-md font-bold text-sm md:text-base px-4 py-2 h-auto"
                    >
                        Sign In / Sign Up
                    </Button>
                </div>

                {/* Animated Background */}
                <div className="absolute inset-0 z-0 select-none pointer-events-none">
                    <img 
                        src={heroWheatImg} 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-20 animate-slow-zoom scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-green-900/90 via-green-900/80 to-white"></div>
                </div>

                <div className="container-magazine relative z-10 mt-12 md:mt-0">
                    <div className="max-w-5xl mx-auto text-center space-y-6">
                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <img src={mainLogoImg} alt="AgriCatalogues Logo" className="h-16 md:h-20 w-auto drop-shadow-lg" />
                        </div>

                        {/* Official Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-800/50 text-green-100 text-sm font-bold border border-green-700/50 backdrop-blur-sm shadow-sm mb-4">
                            <ShieldCheck className="w-4 h-4" /> Official Pattern for 2026
                        </div>
                        
                        {/* Main Massive Headline */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white drop-shadow-lg">
                            Karnataka State Agriculture <br className="hidden md:block" />
                            <span className="text-green-300">Practical Mock Test - 2026</span>
                        </h1>
                        
                        {/* Subheadline */}
                        <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
                            The most trusted preparation module. Bridge the gap between theory and practical with <span className="text-white font-bold decoration-green-400 underline decoration-2 underline-offset-4">real specimen visuals</span>.
                        </p>


                        {/* Key Features Quick View - Dark Theme Version */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto py-6 text-left">
                            <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm hover:bg-white/15 transition-colors">
                                <div className="mt-1 bg-green-500/20 p-1.5 rounded-lg text-green-300">
                                    <Microscope className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Visual Identification</h4>
                                    <p className="text-sm text-green-100/80 leading-snug">High-res spotters & specimens</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm hover:bg-white/15 transition-colors">
                                <div className="mt-1 bg-blue-500/20 p-1.5 rounded-lg text-blue-300">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Performance Analysis</h4>
                                    <p className="text-sm text-blue-100/80 leading-snug">Detailed scorecard & insights</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm hover:bg-white/15 transition-colors">
                                <div className="mt-1 bg-purple-500/20 p-1.5 rounded-lg text-purple-300">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Real Exam Timer</h4>
                                    <p className="text-sm text-purple-100/80 leading-snug">Master time management</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Area */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                            <Button 
                                onClick={onStart}
                                className="bg-yellow-500 hover:bg-yellow-400 text-green-950 font-bold text-xl h-16 px-10 rounded-full shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 w-full sm:w-auto transform hover:-translate-y-1"
                            >
                                Start Free Mock Test <ArrowRight className="ml-2 w-6 h-6" />
                            </Button>
                        </div>
                        
                        <style>{`
                            @keyframes slow-zoom {
                                0% { transform: scale(1); }
                                50% { transform: scale(1.1); }
                                100% { transform: scale(1); }
                            }
                            .animate-slow-zoom {
                                animation: slow-zoom 20s ease-in-out infinite;
                            }
                        `}</style>
                    </div>
                </div>
            </div>

            {/* Stats / Highlights Bar */}
            <div className="border-y border-gray-100 bg-gray-50/50">
                <div className="container-magazine py-6">
                    <div className="flex flex-wrap justify-center gap-y-4 gap-x-8 md:gap-16 text-center text-gray-600 font-medium text-sm md:text-base">
                         <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span>Verified by <strong className="text-gray-900">Top Rankers of past practical exams and experienced professors</strong></span>
                         </div>
                         <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-600" />
                            <span><strong className="text-gray-900">50</strong> Questions per Test</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-green-600" />
                            <span><strong className="text-gray-900">1000+</strong> Questions (All Topics & Previous Years)</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* Why This Mock Test (Challenge & Solution) */}
            <div id="details" className="py-20 bg-gray-50 border-y border-gray-100">
                <div className="container-magazine">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why This Mock Test Is Important</h2>
                        <p className="text-gray-600 text-lg">Practical exams require more than just theoretical knowledge. We bridge the gap.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <CardContent className="p-8 pt-10">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-6">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Time Pressure</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    In the real exam, identifying specimens quickly is key. Our time-bound tests train your reflexes.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <CardContent className="p-8 pt-10">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Exam Pattern alignment</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Don't study blindly. Our tests mirror the exact distribution of spotters, slides, and field questions.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <CardContent className="p-8 pt-10">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-6">
                                    <Microscope className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Recognition</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Practice with high-quality images of crops, diseases, and tools that you will likely encounter.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* What Students Will Get */}
            <div className="py-20 bg-white">
                <div className="container-magazine">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <div className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-semibold">
                                Comprehensive Package
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                Master Your Practical Exam with Confidence
                            </h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="mt-1 shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <Microscope className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Image-Based & Field Questions</h4>
                                        <p className="text-gray-600">High-resolution visuals for identification questions, just like the actual spotters.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <LineChart className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Detailed Performance Analysis</h4>
                                        <p className="text-gray-600">Get instant scores and detailed explanations for every answer to understand where you went wrong.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <BrainCircuit className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Subject-wise Insights</h4>
                                        <p className="text-gray-600">Know which subjects (Seeds, Plants, Fruits & Vegetables) need more focus.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Visual Mockup of Analysis */}
                        <div className="flex-1 w-full">
                            <div className="relative mx-auto max-w-md">
                                <div className="absolute inset-0 bg-green-200 rounded-full blur-3xl opacity-20"></div>
                                <Card className="relative border-0 shadow-2xl overflow-hidden bg-white ring-1 ring-gray-100">
                                    <div className="bg-gray-50 border-b p-4 flex justify-between items-center">
                                        <span className="font-semibold text-gray-700">Analysis Preview</span>
                                        <BarChart3 className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-sm text-gray-500">Your Score</div>
                                                <div className="text-3xl font-bold text-gray-900">42<span className="text-lg text-gray-400 font-normal">/50</span></div>
                                            </div>
                                            <div className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">Excellent</div>
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>Seeds-Field Crops</span>
                                                <span className="text-green-600">90%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 w-[90%]"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>Plants-Field Crops</span>
                                                <span className="text-yellow-600">65%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-yellow-400 w-[65%]"></div>
                                            </div>
                                        </div>
                                        <div className="pt-4 flex gap-2">
                                            <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">12 Correct</div>
                                            <div className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded font-medium">3 Incorrect</div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parent Reassurance Section */}
            <div className="py-16 bg-blue-50/50 border-t border-blue-100">
                <div className="container-magazine">
                     <div className="flex flex-col md:flex-row items-center gap-10 max-w-5xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-blue-100/50">
                        <div className="flex-1 w-full text-center md:text-left space-y-5">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 text-blue-800 text-xs font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-4 h-4" /> For Parents
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                A Safe, Distraction-Free Environment for Your Child
                            </h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                We know how stressful exam preparation can be. Our platform is strictly focused on agriculture exams—no ads, no social distractions, and 100% secure payments via Razorpay. Track your child's progress with our detailed analytical scorecards.
                            </p>
                            <div className="pt-2">
                                <ul className="space-y-3 text-left inline-block w-full">
                                    <li className="flex items-center gap-3 text-gray-700 font-medium bg-blue-50/50 p-3 rounded-xl">
                                        <div className="bg-white p-1 rounded-full shadow-sm"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                                        Ad-Free Premium Study Portal
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700 font-medium bg-blue-50/50 p-3 rounded-xl">
                                        <div className="bg-white p-1 rounded-full shadow-sm"><ShieldCheck className="w-5 h-5 text-blue-600" /></div>
                                        Secure & Encrypted Payments
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700 font-medium bg-blue-50/50 p-3 rounded-xl">
                                        <div className="bg-white p-1 rounded-full shadow-sm"><BarChart3 className="w-5 h-5 text-purple-600" /></div>
                                        Instant Comprehensive Score Reports
                                    </li>
                                </ul>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Created by Experts and Top Rank Holders */}
            <div className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="container-magazine max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider mb-2">
                            <ShieldCheck className="w-4 h-4" /> Trusted Excellence
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Created by Experts and Top Rank Holders
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Our mock tests are meticulously designed by distinguished professors and top-ranking achievers who have secured seats in leading agricultural universities. Their real-world exam experience and academic expertise ensure that every question is accurate, relevant, and strictly aligned with the examination pattern.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Academic Advisors */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-green-700" />
                                Academic Advisors
                            </h3>
                            <div className="grid gap-6">
                                {/* Advisor Card 1 - Dr. B. Anjaneya Reddy */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                                    <img
                                        src="https://ui-avatars.com/api/?name=Anjaneya+Swamy&background=random&color=fff"
                                        alt="Anjaneya Swamy"
                                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Dr. B. Anjaneya Reddy</h4>
                                        <div className="flex flex-col gap-0.5 mt-1">
                                            <p className="text-green-700 font-medium text-sm">Professor and Head (Plant Pathology)</p>
                                            <p className="text-gray-500 text-xs">Horticulture Research and Extension Centre,<br/>Hogalagere, Srinivasapura (T), Kolar (D)</p>
                                            <p className="text-gray-400 text-xs mt-1 font-semibold">20+ years of experience</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Advisor Card 2 - Dr. Ramakrishna Naika */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                                    <img
                                        src="https://ui-avatars.com/api/?name=Ramakrishna+M&background=random&color=fff"
                                        alt="Ramakrishna M"
                                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Dr. Ramakrishna Naika</h4>
                                        <div className="flex flex-col gap-0.5 mt-1">
                                            <p className="text-green-700 font-medium text-sm">Professor and Head (Sericulture)</p>
                                            <p className="text-gray-500 text-xs">College of Sericulture, UAS(B)<br/>Chintamani - 564125</p>
                                            <p className="text-gray-400 text-xs mt-1 font-semibold">25+ years of experience</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Advisor Card 3 - Dr. Narasa Reddy G */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                                    <img
                                        src="https://ui-avatars.com/api/?name=Narasa+Reddy&background=random&color=fff"
                                        alt="Narasa Reddy"
                                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Dr. Narasa Reddy G</h4>
                                        <div className="flex flex-col gap-0.5 mt-1">
                                            <p className="text-green-700 font-medium text-sm">Assistant professor (Entomology)</p>
                                            <p className="text-gray-500 text-xs">College of Sericulture, UAS(B)<br/>Chintamani - 564125</p>
                                            <p className="text-gray-400 text-xs mt-1 font-semibold">15+ years of experience</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Rank Contributors */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-green-700" />
                                Top Rank Contributors
                            </h3>
                            <div className="grid gap-6">
                                {/* Contributor 1 - Kishore S.M */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                                    <img
                                        src="https://ui-avatars.com/api/?name=Kishore+S.M&background=random&color=fff"
                                        alt="Kishore S.M"
                                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Kishore S.M</h4>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <span className="text-gray-700 text-sm font-medium">MS.c (Agri), PGDAEM</span>
                                            <span className="text-gray-500 text-xs">Ph. D Scholar, (Entomology)<br/>KSNUAHS, Shivamogga</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Contributor 2 - Bharthisha S.M */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                                    <img
                                        src="https://ui-avatars.com/api/?name=Bharthisha+T&background=random&color=fff"
                                        alt="Bharthisha T"
                                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Bharthisha S.M</h4>
                                        <div className="flex flex-col gap-1 mt-1">
                                             <span className="text-gray-700 text-sm font-medium">Ph.D. Scholar (Agronomy)</span>
                                            <span className="text-gray-500 text-xs">UAS, Dharwad</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Contributor 3 - Ganesh O */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                                    <img
                                        src="https://ui-avatars.com/api/?name=Ganesh+D+K&background=random&color=fff"
                                        alt="Ganesh D K"
                                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Ganesh O</h4>
                                        <div className="flex flex-col gap-1 mt-1">
                                             <span className="text-gray-700 text-sm font-medium">B.Sc. (Hons) Sericulture</span>
                                            <span className="text-gray-500 text-xs">College of Sericulture, Chintamani<br/>UASB, GKVK, Bengaluru</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="py-20 bg-gray-50">
                <div className="container-magazine">
                     <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4 max-w-4xl mx-auto">
                        <div className="flex-1 text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 w-full md:w-auto">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-gray-600">1</div>
                            <h4 className="font-bold text-lg mb-2">Sign Up</h4>
                            <p className="text-sm text-gray-500">Create a free account in seconds.</p>
                        </div>
                        <div className="hidden md:block w-12 border-t-2 border-dashed border-gray-300"></div>
                        <div className="flex-1 text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 w-full md:w-auto">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-green-600">2</div>
                            <h4 className="font-bold text-lg mb-2">Attempt Test</h4>
                            <p className="text-sm text-gray-500">Take the test in a real-exam interface.</p>
                        </div>
                         <div className="hidden md:block w-12 border-t-2 border-dashed border-gray-300"></div>
                        <div className="flex-1 text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 w-full md:w-auto">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-blue-600">3</div>
                            <h4 className="font-bold text-lg mb-2">Analyze</h4>
                            <p className="text-sm text-gray-500">Get instant results and insights.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="py-24 bg-white text-center">
                 <div className="container-magazine max-w-3xl mx-auto space-y-8">
                     <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                         Ready to test your knowledge?
                     </h2>
                     <p className="text-xl text-gray-600">
                         Don't wait until the last minute. Start your preparation confidently today.
                     </p>
                     <Button 
                        onClick={onStart}
                        className="bg-green-700 hover:bg-green-800 text-white font-bold text-lg h-14 px-10 rounded-full shadow-xl shadow-green-700/30 transition-all hover:scale-105"
                    >
                        Start Free Mock Test
                    </Button>
                 </div>
            </div>

            {/* Simple Footer */}
            <footer className="bg-gray-50 border-t py-12 text-center">
                <div className="container-magazine space-y-4">
                    <p className="text-gray-500 text-sm max-w-2xl mx-auto">
                        <strong>Disclaimer:</strong> This is a mock test platform designed for educational purposes. 
                        It is not affiliated with the official examination authority.
                    </p>
                    <p className="text-gray-400 text-xs">
                        &copy; 2025 AgriCatalogues. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
