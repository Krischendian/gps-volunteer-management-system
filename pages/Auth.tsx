
import React, { useState, useRef } from 'react';
import { useStore } from '../contexts/StoreContext';
import { 
  ArrowRight, Check, AlertCircle, BookOpen, ShieldCheck, User, 
  Briefcase, Heart, X, Upload, CheckCircle, GraduationCap, Trophy, 
  Clock, FileText, ChevronRight, Star, Mail, MapPin, Phone, Calendar
} from 'lucide-react';
import { APP_POLICIES, QUIZ_QUESTIONS } from '../types';
import BrandLogo from '../components/BrandLogo';

type Step = 'LOGIN' | 'WELCOME' | 'PERSONAL' | 'BACKGROUND' | 'DETAILS' | 'AGREEMENTS' | 'QUIZ' | 'SIGNATURE';

const ROLES_OPTIONS = [
  "Event Support",
  "Administrative Help",
  "Fundraising",
  "Marketing",
  "Social Media",
  "Program Facilitation",
  "Classroom Help",
  "Parent Help",
  "Cleaning and Organizing",
  "Other"
];

const Auth: React.FC = () => {
  const { login, register } = useStore();
  const [step, setStep] = useState<Step>('LOGIN');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizErrors, setQuizErrors] = useState<string[]>([]);

  // Registration Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    age: '',
    gender: '',
    phone: '',
    statusInCanada: '',
    statusOther: '',
    email: '',
    address: '',
    languages: '',
    identity: '',
    occupation: '',
    schoolOrg: '',
    referralSource: '',
    availability: '',
    roles: [] as string[],
    events: '',
    skills: '',
    medicalConditions: '',
    experience: '',
    mediaConsent: false,
    confidentialityAgreed: false,
    signature: ''
  });

  // Mock file upload state
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleRole = (role: string) => {
    setFormData(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  const updateQuizAnswer = (questionId: string, answerIdx: number) => {
      setQuizAnswers(prev => ({...prev, [questionId]: answerIdx}));
      if (quizErrors.includes(questionId)) {
          setQuizErrors(prev => prev.filter(id => id !== questionId));
      }
  };

  const handleQuizSubmit = () => {
    const errors: string[] = [];
    QUIZ_QUESTIONS.forEach(q => {
        if (quizAnswers[q.id] !== q.correctAnswer) {
            errors.push(q.id);
        }
    });

    setQuizErrors(errors);

    if (errors.length === 0) {
        setStep('SIGNATURE');
    }
  };

  const handleFinalRegistration = () => {
    if (!formData.signature || !formData.mediaConsent || !formData.confidentialityAgreed) return;
    setShowSuccessModal(true);
  };

  const completeRegistrationProcess = async () => {
    setError('');
    setLoading(true);
    try {
        const fullName = `${formData.firstName} ${formData.lastName}`;
        await register(formData.email, formData.password, { 
          name: fullName,
          orientationSigned: true, 
          orientationDate: new Date().toISOString(),
          phone: formData.phone,
          age: formData.age
        });
    } catch (err: any) {
        setError(err.message || 'Registration failed');
        setLoading(false);
        setShowSuccessModal(false); 
    }
  };

  // Steps for progress dots (excluding LOGIN)
  const REG_STEPS: Step[] = ['WELCOME', 'PERSONAL', 'BACKGROUND', 'DETAILS', 'AGREEMENTS', 'QUIZ', 'SIGNATURE'];

  // Render Progress Dots
  const renderProgress = () => {
    if (step === 'LOGIN') return null;
    const currentIdx = REG_STEPS.indexOf(step);
    
    return (
      <div className="flex items-center justify-center gap-3 mb-8">
        {REG_STEPS.map((s, idx) => (
          <div 
            key={idx} 
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              idx === currentIdx 
                ? 'bg-gps-blue w-8' 
                : idx < currentIdx 
                  ? 'bg-gps-blue/40' 
                  : 'bg-slate-200'
            }`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative py-12">
      
      <div className={`glass-card w-full ${step === 'WELCOME' ? 'max-w-4xl' : 'max-w-2xl'} p-8 md:p-10 rounded-3xl shadow-2xl relative z-10 animate-fade-in border border-white/60`}>
        
        {/* Header Logo - Always visible except maybe success */}
        {!showSuccessModal && (
            <div className="text-center mb-6">
                <BrandLogo className="h-24 w-auto mx-auto mb-2" />
                {renderProgress()}
            </div>
        )}
        
        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-200">
                <AlertCircle size={20} />
                {error}
            </div>
        )}

        {/* --- STEP: LOGIN --- */}
        {step === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-6 animate-slide-up max-w-md mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800">Welcome</h2>
                <p className="text-slate-500 mt-2">Log in to your volunteer dashboard</p>
            </div>
            
            <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium" placeholder="hello@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium" placeholder="••••••••" />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gps-blue hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-4 text-lg">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            
            <div className="text-center pt-4 border-t border-slate-100 mt-6">
                 <p className="text-slate-500 text-sm">
                  Don't have an account? <button type="button" onClick={() => setStep('WELCOME')} className="text-gps-blue font-bold hover:underline">Register now</button>
                </p>
            </div>
          </form>
        )}

        {/* --- STEP: WELCOME / INTRO (Image 8) --- */}
        {step === 'WELCOME' && (
            <div className="animate-slide-in-right space-y-10">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-4xl font-extrabold text-slate-800 mb-3">Volunteer Program</h2>
                    <p className="text-gps-blue font-semibold text-lg">Join our community of changemakers</p>
                    <p className="text-slate-600 mt-4 leading-relaxed">
                         We are thrilled to announce the launch of the G.P.S. Volunteer program! Your participation means a lot to us, and we want to tailor this experience to your interests.
                    </p>
                </div>

                <div className="relative">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-[1px] bg-slate-200 flex-1 max-w-[100px]"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Benefits & Perks</span>
                        <div className="h-[1px] bg-slate-200 flex-1 max-w-[100px]"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="bg-blue-50 p-3 rounded-xl text-gps-blue"><FileText size={24} /></div>
                            <div>
                                <h4 className="font-bold text-slate-800">Reference Letter</h4>
                                <p className="text-xs text-slate-500 mt-1">Available after 5+ volunteer days.</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="bg-green-50 p-3 rounded-xl text-gps-green"><GraduationCap size={24} /></div>
                            <div>
                                <h4 className="font-bold text-slate-800">Gain Experience</h4>
                                <p className="text-xs text-slate-500 mt-1">Skills in teamwork & leadership.</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="bg-red-50 p-3 rounded-xl text-red-500"><Heart size={24} /></div>
                            <div>
                                <h4 className="font-bold text-slate-800">Real Impact</h4>
                                <p className="text-xs text-slate-500 mt-1">Support families in need.</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="bg-orange-50 p-3 rounded-xl text-orange-500"><ShieldCheck size={24} /></div>
                            <div>
                                <h4 className="font-bold text-slate-800">Verified Hours</h4>
                                <p className="text-xs text-slate-500 mt-1">Official records for school.</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow md:col-span-2">
                            <div className="bg-yellow-50 p-3 rounded-xl text-yellow-500"><Trophy size={24} /></div>
                            <div>
                                <h4 className="font-bold text-slate-800">Recognition</h4>
                                <p className="text-xs text-slate-500 mt-1">Awards, certificates, and appreciation events.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase">Requirements:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
                        <li className="flex items-center gap-2 text-sm text-slate-600"><div className="w-1.5 h-1.5 rounded-full bg-gps-blue"></div> 12+ years old</li>
                        <li className="flex items-center gap-2 text-sm text-slate-600"><div className="w-1.5 h-1.5 rounded-full bg-gps-blue"></div> Police check (18+)</li>
                        <li className="flex items-center gap-2 text-sm text-slate-600"><div className="w-1.5 h-1.5 rounded-full bg-gps-blue"></div> Resident of Canada</li>
                        <li className="flex items-center gap-2 text-sm text-slate-600"><div className="w-1.5 h-1.5 rounded-full bg-gps-blue"></div> Min. 10 hours/month</li>
                    </div>
                </div>

                <div className="text-center text-xs text-slate-400">
                    Learn more at <a href="#" className="text-gps-blue hover:underline">giftedpeopleser.org</a>
                </div>

                <div className="flex gap-4 pt-4">
                     <button type="button" onClick={() => setStep('LOGIN')} className="flex-1 py-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-200 transition-all">Back to Login</button>
                     <button onClick={() => setStep('PERSONAL')} className="flex-[2] bg-gps-blue hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                        Start Application <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP: PERSONAL INFO (Image 7) --- */}
        {step === 'PERSONAL' && (
            <div className="animate-slide-in-right space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <User size={28} className="text-gps-blue" />
                    <h3 className="text-2xl font-bold text-slate-800">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                        <input type="text" value={formData.firstName} onChange={(e) => updateForm('firstName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="Jane" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                        <input type="text" value={formData.lastName} onChange={(e) => updateForm('lastName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="Doe" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                        <input type="text" value={formData.age} onChange={(e) => updateForm('age', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="18" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                        <div className="relative">
                            <select value={formData.gender} onChange={(e) => updateForm('gender', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all appearance-none bg-white">
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-binary">Non-binary</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronRight className="rotate-90" size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => updateForm('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="(555) 123-4567" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => updateForm('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="jane@example.com" />
                </div>

                {/* Password field hidden from "Personal Info" visual in template but needed for auth. 
                    Ideally this would be a separate step or part of account creation. 
                    Including it here discreetly. */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Create Password</label>
                    <input type="password" value={formData.password} onChange={(e) => updateForm('password', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="Min 6 chars" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Home Address</label>
                    <input type="text" value={formData.address} onChange={(e) => updateForm('address', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="123 Main St..." />
                </div>

                <div className="flex gap-4 pt-6">
                     <button onClick={() => setStep('WELCOME')} className="flex-1 py-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all">Back</button>
                     <button onClick={() => setStep('BACKGROUND')} disabled={!formData.firstName || !formData.email || !formData.password} className="flex-[2] bg-gps-blue hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                        Next <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP: BACKGROUND (Image 6) --- */}
        {step === 'BACKGROUND' && (
            <div className="animate-slide-in-right space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <Briefcase size={28} className="text-gps-blue" />
                    <h3 className="text-2xl font-bold text-slate-800">Background</h3>
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status in Canada</label>
                    <div className="relative">
                        <select value={formData.statusInCanada} onChange={(e) => updateForm('statusInCanada', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all appearance-none bg-white">
                            <option value="">Select...</option>
                            <option value="Citizen">Citizen</option>
                            <option value="Permanent Resident">Permanent Resident</option>
                            <option value="Student Visa">Student Visa</option>
                            <option value="Work Permit">Work Permit</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronRight className="rotate-90" size={16} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Languages You Speak</label>
                    <input type="text" value={formData.languages} onChange={(e) => updateForm('languages', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="English, French, Mandarin..." />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">What you consider yourself as?</label>
                    <input type="text" value={formData.identity} onChange={(e) => updateForm('identity', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="e.g. Student, Retired, Professional..." />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Past or Present Occupation</label>
                    <input type="text" value={formData.occupation} onChange={(e) => updateForm('occupation', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="Software Engineer" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your School/College/University</label>
                    <input type="text" value={formData.schoolOrg} onChange={(e) => updateForm('schoolOrg', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="University of Toronto" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Who/Which organization recommended you?</label>
                    <input type="text" value={formData.referralSource} onChange={(e) => updateForm('referralSource', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="e.g. Friend, School Board, Website..." />
                </div>

                <div className="flex gap-4 pt-6">
                     <button onClick={() => setStep('PERSONAL')} className="flex-1 py-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all">Back</button>
                     <button onClick={() => setStep('DETAILS')} className="flex-[2] bg-gps-blue hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                        Next <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP: DETAILS (Image 5) --- */}
        {step === 'DETAILS' && (
            <div className="animate-slide-in-right space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <Heart size={28} className="text-gps-blue" />
                    <h3 className="text-2xl font-bold text-slate-800">Volunteer Details</h3>
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Availability (Date & Time)</label>
                    <input type="text" value={formData.availability} onChange={(e) => updateForm('availability', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="e.g. Weekends 9am-5pm, Tuesday evenings..." />
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Roles you are into <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ROLES_OPTIONS.map(role => (
                            <label key={role} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-sm font-medium transition-all ${formData.roles.includes(role) ? 'bg-blue-50 border-gps-blue text-gps-blue' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                                <input type="checkbox" checked={formData.roles.includes(role)} onChange={() => toggleRole(role)} className="w-4 h-4 accent-gps-blue rounded" />
                                {role}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Events/Programs you'd like to participate</label>
                    <input type="text" value={formData.events} onChange={(e) => updateForm('events', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="e.g. Summer camps, Skating program" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Abilities & Skills</label>
                    <input type="text" value={formData.skills} onChange={(e) => updateForm('skills', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="Photography, Coding, Teaching..." />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Questions or Medical/Physical Conditions</label>
                    <input type="text" value={formData.medicalConditions} onChange={(e) => updateForm('medicalConditions', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all" placeholder="Any allergies or concerns we should be aware of?" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Volunteer Experiences</label>
                    <textarea value={formData.experience} onChange={(e) => updateForm('experience', e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all resize-none" placeholder="Previous experience..." />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gps-blue font-bold text-sm uppercase tracking-wider">
                        <Upload size={16} /> Upload Documents
                    </div>
                    <div 
                        className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 hover:border-gps-blue transition-all group"
                        onClick={() => setUploadedFile("documents.zip")}
                    >
                        {uploadedFile ? (
                            <div className="flex flex-col items-center gap-2 text-green-600">
                                <div className="bg-green-100 p-3 rounded-full"><Check size={24} /></div>
                                <span className="font-bold">File Uploaded!</span>
                                <span className="text-xs text-slate-400">{uploadedFile}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-gps-blue">
                                <Upload size={32} className="mb-2" />
                                <span className="font-semibold text-slate-600">Click to upload files</span>
                                <span className="text-xs max-w-xs mx-auto">Police Check (Mandatory if 18+), Resume, CV, Certificates, Portfolio, etc.</span>
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-red-500 flex items-center gap-1">
                        <AlertCircle size={10} /> Note: If you are 18+ years old, you must provide a valid Police Check.
                    </p>
                </div>

                <div className="flex gap-4 pt-6">
                     <button onClick={() => setStep('BACKGROUND')} className="flex-1 py-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all">Back</button>
                     <button onClick={() => setStep('AGREEMENTS')} disabled={formData.roles.length === 0} className="flex-[2] bg-gps-blue hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                        Next <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP: AGREEMENTS (Image 4) --- */}
        {step === 'AGREEMENTS' && (
            <div className="animate-slide-in-right space-y-8">
                <div className="flex items-center gap-3 mb-2">
                    <BookOpen size={28} className="text-gps-blue" />
                    <h3 className="text-2xl font-bold text-slate-800">Terms & Agreement</h3>
                </div>
                
                {APP_POLICIES.slice(0, 2).map((policy, idx) => (
                    <div key={policy.id} className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
                        <h4 className="font-bold text-slate-900 mb-4 text-lg">{policy.title}</h4>
                        <div className="text-sm text-slate-600 leading-relaxed mb-6 space-y-2">
                            <p>{policy.content}</p>
                            {policy.items && (
                                <ul className="list-disc pl-5 space-y-1">
                                    {policy.items.map((it, i) => <li key={i}>{it}</li>)}
                                </ul>
                            )}
                        </div>
                        <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 accent-gps-blue mt-0.5"
                                checked={policy.id === 'media_consent' ? formData.mediaConsent : formData.confidentialityAgreed} 
                                onChange={(e) => updateForm(policy.id === 'media_consent' ? 'mediaConsent' : 'confidentialityAgreed', e.target.checked)} 
                            />
                            <span className="text-sm font-bold text-slate-700">I agree to the {policy.title}.</span>
                        </label>
                    </div>
                ))}
                
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full text-gps-blue mt-1">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-800 text-sm">Next Step: Policy Quiz</h5>
                        <p className="text-xs text-slate-600 mt-1">You will be asked to review the Volunteer Code of Conduct and answer a few questions before signing.</p>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                     <button onClick={() => setStep('DETAILS')} className="flex-1 py-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all">Back</button>
                     <button onClick={() => setStep('QUIZ')} disabled={!formData.mediaConsent || !formData.confidentialityAgreed} className="flex-[2] bg-gps-blue hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                        Start Quiz <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP: QUIZ (Image 3) --- */}
        {step === 'QUIZ' && (
            <div className="animate-slide-in-right space-y-8">
                <div className="flex items-center gap-3 mb-2">
                    <BookOpen size={28} className="text-gps-blue" />
                    <h3 className="text-2xl font-bold text-slate-800">Volunteer Code of Conduct</h3>
                </div>

                {/* Adding Code of Conduct Text here as per flow implication */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4">Volunteer Code of Conduct</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                        <li>I will treat all individuals with respect, dignity, and fairness.</li>
                        <li>I will act in a professional manner and represent Gifted People Services positively.</li>
                        <li>I will follow the instructions of my supervisor and ask for clarification when needed.</li>
                        <li>I will be punctual and reliable, and notify my supervisor if I am unable to attend a scheduled shift.</li>
                        <li>I will avoid conflicts of interest and not accept gifts or favors from clients.</li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="font-bold text-slate-800 mb-4 text-lg">Policy Quiz</h4>
                    <div className="space-y-6">
                        {QUIZ_QUESTIONS.map((q, idx) => (
                            <div key={q.id} className={`p-6 rounded-2xl border transition-all ${quizErrors.includes(q.id) ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <p className="font-bold text-slate-800 text-sm mb-4">{idx + 1}. {q.question}</p>
                                <div className="space-y-3">
                                    {q.options.map((option, optIdx) => (
                                        <label key={optIdx} className="flex items-start gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${quizAnswers[q.id] === optIdx ? 'border-gps-blue' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                                {quizAnswers[q.id] === optIdx && <div className="w-2.5 h-2.5 rounded-full bg-gps-blue" />}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name={q.id} 
                                                className="hidden"
                                                checked={quizAnswers[q.id] === optIdx} 
                                                onChange={() => updateQuizAnswer(q.id, optIdx)} 
                                            />
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{option}</span>
                                        </label>
                                    ))}
                                </div>
                                {quizErrors.includes(q.id) && (
                                    <p className="text-xs text-red-500 font-bold mt-3 flex items-center gap-1">
                                        <X size={12} /> Incorrect answer. Please try again.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                     <button onClick={() => setStep('AGREEMENTS')} className="flex-1 py-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all">Back</button>
                     <button onClick={handleQuizSubmit} className="flex-[2] bg-gps-blue hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                        Verify & Continue <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP: SIGNATURE --- */}
        {step === 'SIGNATURE' && (
             <div className="animate-slide-in-right space-y-8">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck size={28} className="text-gps-blue" />
                    <h3 className="text-2xl font-bold text-slate-800">Final Signature</h3>
                </div>

                <p className="text-slate-600">
                    By signing below, I acknowledge that I have read, understood, and agreed to the policies and code of conduct of Gifted People Services.
                </p>

                <div className="bg-slate-50 p-8 rounded-2xl border-2 border-dashed border-slate-300">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type Full Name to Sign</label>
                        <input 
                            type="text" 
                            value={formData.signature} 
                            onChange={(e) => updateForm('signature', e.target.value)} 
                            className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none font-handwriting text-3xl text-slate-800 placeholder:text-slate-300 placeholder:font-sans placeholder:text-lg bg-white" 
                            placeholder="Sign Here"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                     <button onClick={() => setStep('QUIZ')} className="flex-1 py-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all">Back</button>
                     <button onClick={handleFinalRegistration} disabled={!formData.signature} className="flex-[2] bg-gps-blue hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                        Complete Registration <Check size={20} />
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Success Modal (Image 1) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-scale-up border-[6px] border-white/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gps-green to-gps-blue"></div>
                
                <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-inner ring-4 ring-green-50/50">
                    <Check size={40} strokeWidth={3} />
                </div>
                
                <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-2">Registration Complete!</h2>
                <p className="text-center text-slate-500 text-sm mb-8 px-4 leading-relaxed">
                    Welcome to the team! There are just a few more mandatory steps to finalize your volunteer status.
                </p>

                <div className="space-y-4 mb-8">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white text-gps-blue font-bold flex items-center justify-center shadow-sm shrink-0">1</div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">Submit Documents</h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">If you haven't uploaded them yet, please email your Police Check (if 18+), Resume, and relevant certificates to our admin.</p>
                        </div>
                    </div>
                    <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white text-gps-green font-bold flex items-center justify-center shadow-sm shrink-0">2</div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">Attend Orientation</h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">You must attend an in-person orientation session. Please contact <span className="font-bold text-gps-green underline">everett@giftedpeopleser.org</span> to sign up.</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={completeRegistrationProcess}
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-white bg-gps-blue hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all text-lg"
                >
                    {loading ? 'Setting up...' : 'I Understand, Go to Dashboard'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
