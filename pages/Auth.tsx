import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { ArrowRight, Check, AlertCircle, BookOpen, ShieldCheck, User, Briefcase, Heart, XCircle, Upload, CheckCircle } from 'lucide-react';
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
    password: '', // Added password for registration
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
          // Pass other form data as needed to DB
          phone: formData.phone,
          age: formData.age
        });
        // Success modal handles the redirect logic by simply unmounting or auth state change
    } catch (err: any) {
        setError(err.message || 'Registration failed');
        setLoading(false);
        setShowSuccessModal(false); // Close modal on error to show message
    }
  };

  // Render Progress Bar
  const renderProgress = () => {
    if (step === 'LOGIN') return null;
    const steps: Step[] = ['WELCOME', 'PERSONAL', 'BACKGROUND', 'DETAILS', 'AGREEMENTS', 'QUIZ', 'SIGNATURE'];
    const currentIdx = steps.indexOf(step);
    
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, idx) => (
          <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx <= currentIdx ? 'w-8 bg-gps-blue' : 'w-2 bg-slate-200'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative py-10">
      
      <div className="glass-card w-full max-w-2xl p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in border-t-4 border-gps-blue">
        
        {/* Header */}
        <div className="text-center mb-8">
            <BrandLogo className="h-32 w-auto mx-auto mb-4" />
            {renderProgress()}
        </div>
        
        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center font-bold border border-red-200">
                {error}
            </div>
        )}

        {/* --- STEP: LOGIN --- */}
        {step === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5 animate-slide-up max-w-md mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700">Welcome Back</h2>
                <p className="text-slate-500 text-sm mt-1">Log in to continue your journey</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 ml-1">Email Address</label>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none transition-all" placeholder="hello@example.com" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 ml-1">Password</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none transition-all" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gps-blue hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
              {loading ? 'Signing In...' : <><span className="mr-1">Sign In</span> <ArrowRight size={18} /></>}
            </button>
            <div className="text-center space-y-2 mt-4">
                 <p className="text-slate-500 text-sm">
                  New volunteer? <button type="button" onClick={() => setStep('WELCOME')} className="text-gps-blue font-bold hover:underline">Register here</button>
                </p>
                <p className="text-[10px] text-slate-400">
                    Admin Access? Use an email containing <span className="font-mono bg-slate-100 px-1 rounded">admin</span> (e.g. admin@gps.org)
                </p>
            </div>
           
          </form>
        )}

        {/* --- STEP: WELCOME / INTRO --- */}
        {step === 'WELCOME' && (
            <div className="animate-slide-in-right space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800">Volunteer Program</h2>
                    <p className="text-slate-500 text-sm mt-1">Join our community of changemakers</p>
                </div>
                
                <p className="text-center text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
                     We are thrilled to announce the launch of the G.P.S. Volunteer program!
                </p>

                <div className="flex gap-3 pt-2">
                     <button type="button" onClick={() => setStep('LOGIN')} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Back to Login</button>
                     <button onClick={() => setStep('PERSONAL')} className="flex-[2] bg-gps-blue hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                        Start Application <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP: PERSONAL INFO --- */}
        {step === 'PERSONAL' && (
            <div className="animate-slide-in-right space-y-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><User size={20} className="text-gps-blue"/> Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                        <input type="text" value={formData.firstName} onChange={(e) => updateForm('firstName', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none" placeholder="Jane" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                        <input type="text" value={formData.lastName} onChange={(e) => updateForm('lastName', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none" placeholder="Doe" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => updateForm('email', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none" placeholder="jane@example.com" />
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Create Password</label>
                    <input type="password" value={formData.password} onChange={(e) => updateForm('password', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none" placeholder="Min 6 chars" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Age</label>
                        <input type="text" value={formData.age} onChange={(e) => updateForm('age', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none" placeholder="18" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                        <input type="tel" value={formData.phone} onChange={(e) => updateForm('phone', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none" placeholder="(555) 123-4567" />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                     <button onClick={() => setStep('WELCOME')} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Back</button>
                     <button onClick={() => setStep('BACKGROUND')} disabled={!formData.firstName || !formData.email || !formData.password || formData.password.length < 6} className="flex-[2] bg-gps-blue hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        Next <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP: BACKGROUND --- */}
        {step === 'BACKGROUND' && (
            <div className="animate-slide-in-right space-y-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Briefcase size={20} className="text-gps-blue"/> Background</h3>
                
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status in Canada</label>
                    <select value={formData.statusInCanada} onChange={(e) => updateForm('statusInCanada', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none bg-white">
                        <option value="">Select...</option>
                        <option value="Citizen">Citizen</option>
                        <option value="Permanent Resident">Permanent Resident</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Occupation</label>
                    <input type="text" value={formData.occupation} onChange={(e) => updateForm('occupation', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none" placeholder="Student / Professional" />
                </div>

                <div className="flex gap-3 pt-4">
                     <button onClick={() => setStep('PERSONAL')} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Back</button>
                     <button onClick={() => setStep('DETAILS')} className="flex-[2] bg-gps-blue hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        Next <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP: DETAILS --- */}
        {step === 'DETAILS' && (
            <div className="animate-slide-in-right space-y-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Heart size={20} className="text-gps-blue"/> Volunteer Details</h3>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Roles you are into <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                        {ROLES_OPTIONS.map(role => (
                            <label key={role} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${formData.roles.includes(role) ? 'bg-blue-50 border-gps-blue' : 'border-slate-100 hover:bg-slate-50'}`}>
                                <input type="checkbox" checked={formData.roles.includes(role)} onChange={() => toggleRole(role)} className="accent-gps-blue" />
                                {role}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                     <button onClick={() => setStep('BACKGROUND')} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Back</button>
                     <button onClick={() => setStep('AGREEMENTS')} disabled={formData.roles.length === 0} className="flex-[2] bg-gps-blue hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        Next <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP: AGREEMENTS --- */}
        {step === 'AGREEMENTS' && (
            <div className="animate-slide-in-right space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><BookOpen size={20} className="text-gps-blue"/> Terms & Agreement</h3>
                
                {APP_POLICIES.slice(0, 2).map((policy, idx) => (
                    <div key={policy.id} className="border border-slate-200 rounded-xl p-4 bg-white">
                        <h4 className="font-bold text-slate-900 mb-3">{policy.title}</h4>
                        <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={policy.id === 'media_consent' ? formData.mediaConsent : formData.confidentialityAgreed} 
                                onChange={(e) => updateForm(policy.id === 'media_consent' ? 'mediaConsent' : 'confidentialityAgreed', e.target.checked)} 
                            />
                            <span className="text-sm font-semibold text-slate-700">I agree.</span>
                        </label>
                    </div>
                ))}
                
                <div className="flex gap-3 pt-4">
                     <button onClick={() => setStep('DETAILS')} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Back</button>
                     <button onClick={() => setStep('QUIZ')} disabled={!formData.mediaConsent || !formData.confidentialityAgreed} className="flex-[2] bg-gps-blue hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        Start Quiz <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP: QUIZ --- */}
        {step === 'QUIZ' && (
            <div className="animate-slide-in-right space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><BookOpen size={20} className="text-gps-blue"/> Volunteer Code of Conduct</h3>
                
                <div className="space-y-6">
                    {QUIZ_QUESTIONS.map((q, idx) => (
                        <div key={q.id} className="space-y-2 p-4 rounded-xl border bg-white border-slate-100">
                            <p className="font-semibold text-slate-800 text-sm">{idx + 1}. {q.question}</p>
                            <div className="space-y-1.5">
                                {q.options.map((option, optIdx) => (
                                    <label key={optIdx} className="flex items-start gap-2 cursor-pointer group">
                                        <input 
                                            type="radio" 
                                            name={q.id} 
                                            checked={quizAnswers[q.id] === optIdx} 
                                            onChange={() => updateQuizAnswer(q.id, optIdx)} 
                                        />
                                        <span className="text-sm text-slate-600">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 pt-4">
                     <button onClick={() => setStep('AGREEMENTS')} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Back</button>
                     <button onClick={handleQuizSubmit} className="flex-[2] bg-gps-blue hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        Verify & Continue <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP: SIGNATURE --- */}
        {step === 'SIGNATURE' && (
             <div className="animate-slide-in-right space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ShieldCheck size={20} className="text-gps-blue"/> Final Signature</h3>

                <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-300">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Type Full Name to Sign</label>
                        <input 
                            type="text" 
                            value={formData.signature} 
                            onChange={(e) => updateForm('signature', e.target.value)} 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none font-handwriting text-2xl text-slate-800 placeholder:text-slate-300 placeholder:font-sans" 
                            placeholder="Sign Here"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                     <button onClick={() => setStep('QUIZ')} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Back</button>
                     <button onClick={handleFinalRegistration} disabled={!formData.signature} className="flex-[2] bg-gps-blue hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        Complete Registration <Check size={18} />
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-scale-up border-4 border-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gps-green to-gps-blue"></div>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                    <CheckCircle size={32} />
                </div>
                
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Registration Complete!</h2>
                <p className="text-center text-slate-500 mb-8">Creating your profile...</p>

                <button 
                    onClick={completeRegistrationProcess}
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-white bg-gps-blue hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                    {loading ? 'Setting up...' : 'Go to Dashboard'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Auth;