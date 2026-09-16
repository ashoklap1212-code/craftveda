import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, Mail, User as UserIcon, Phone, MapPin, 
  ArrowRight, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Edit2, ShieldCheck
} from 'lucide-react';

type AuthStep = 'email' | 'otp_verify' | 'personal_details';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, setIsAuthModalOpen, 
    sendOtp, verifyOtp, resendOtp, googleLogin,
    updateUserProfile, addSavedAddress, currentUser 
  } = useStore();

  const [step, setStep] = useState<AuthStep>('email');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Email Step State
  const [email, setEmail] = useState('');

  // OTP Step State (6 digits)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Personal Details Step State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseFlat, setHouseFlat] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // 60-Second Countdown Timer for Resend OTP
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setStep('email');
    setLoading(false);
    setErrorMsg('');
    setSuccessMsg('');
    setEmail('');
    setOtpDigits(['', '', '', '', '', '']);
    setResendCooldown(0);
    setName('');
    setPhone('');
    setHouseFlat('');
    setStreet('');
    setCity('');
    setState('');
    setPincode('');
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    resetForm();
  };

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // HANDLER STEP 1: Submit Details for OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      const formattedPhone = `+91 ${cleanPhone.slice(-10)}`;
      await sendOtp(email.trim().toLowerCase(), formattedPhone, name.trim());
      setStep('otp_verify');
      setResendCooldown(60);
      setSuccessMsg(`Verification code sent to ${email.trim()} and ${formattedPhone}`);
      // Focus first OTP box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // HANDLER STEP 2: Handle OTP Digit Inputs
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg('');

    // Auto-advance to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // HANDLER STEP 2: Submit OTP for Verification
  const handleOtpVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your OTP code');
      return;
    }

    try {
      setLoading(true);
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : '';
      const res = await verifyOtp(email.trim().toLowerCase(), fullOtp, formattedPhone, name.trim());

      if (res && res.user) {
        // Success & Close Modal (User logged in directly to CraftVeda)
        handleClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired verification code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // HANDLER STEP 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setLoading(true);
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : '';
      await resendOtp(email.trim().toLowerCase(), formattedPhone, name.trim());
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMsg(`A new 6-digit code has been sent to ${email.trim()}`);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // HANDLER GOOGLE SIGN-IN
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setLoading(true);
      const demoEmail = `google.user.${Math.floor(1000 + Math.random() * 9000)}@gmail.com`;
      const res = await googleLogin({
        email: demoEmail,
        name: 'Craft Patron',
      });

      if (res && res.user) {
        if (!res.isProfileComplete || res.isNewUser) {
          setName(res.user.name || '');
          setEmail(res.user.email);
          setStep('personal_details');
        } else {
          handleClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // HANDLER STEP 3: Save Personal Details
  const handlePersonalDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full name is required');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      const formattedPhone = cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : '';

      await updateUserProfile({
        name: name.trim(),
        phone: formattedPhone,
      });

      if (houseFlat && street && city && state && pincode) {
        addSavedAddress({
          fullName: name.trim(),
          mobileNumber: formattedPhone || '+91 98765 43210',
          email: currentUser?.email || email,
          houseFlat,
          street,
          area: street,
          city,
          district: city,
          state,
          pincode,
        });
      }

      setSuccessMsg('Profile setup completed successfully!');
      setTimeout(() => {
        handleClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save personal details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-warm-hover border border-earth-100 max-w-md w-full my-8 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-earth-400 hover:text-earth-700 bg-cream-50 hover:bg-cream-100 p-2 rounded-full border border-earth-200 z-10 transition-colors"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Clean Light-Themed Branding Header */}
        <div className="bg-cream-50/80 p-6 border-b border-earth-100 relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center text-xl shadow-warm">
              🏺
            </div>
            <div>
              <span className="font-serif text-xl font-bold text-earth-900 tracking-tight block leading-tight">
                Craft<span className="text-terracotta-600">Veda</span>
              </span>
              <span className="text-[10px] text-earth-500 font-semibold uppercase tracking-wider block">
                Passwordless Authentication
              </span>
            </div>
          </div>

          {step === 'email' && (
            <div className="mt-2">
              <h3 className="font-serif text-xl font-extrabold text-earth-900">Welcome to CraftVeda</h3>
              <p className="text-xs text-earth-600 mt-1 leading-relaxed">
                Enter your details to receive a 6-digit verification code or sign in with Google.
              </p>
            </div>
          )}

          {step === 'otp_verify' && (
            <div className="mt-2">
              <h3 className="font-serif text-xl font-extrabold text-earth-900">Verify Your Account</h3>
              <p className="text-xs text-earth-600 mt-1 leading-relaxed">
                We've sent a verification code to your email and mobile number.
              </p>
              <div className="flex items-center gap-2 text-xs text-earth-700 font-bold mt-2">
                <span className="text-terracotta-600 underline font-mono">{email}</span>
                {phone && <span className="text-earth-500 font-mono">({phone})</span>}
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[10px] text-earth-500 hover:text-terracotta-600 flex items-center gap-0.5 ml-auto"
                >
                  <Edit2 className="w-3 h-3" /> Edit Details
                </button>
              </div>
            </div>
          )}

          {step === 'personal_details' && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Account Verified
              </span>
              <h3 className="font-serif text-lg font-bold text-earth-900">Personal Details</h3>
              <p className="text-xs text-earth-600">Help us customize your craft order delivery experience</p>
            </div>
          )}
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-4">
          {/* Error Alert */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* STEP 1: MAIN LOGIN PAGE */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-cream-50/50 border border-earth-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 focus:bg-white outline-none transition-all placeholder:text-earth-400"
                  />
                  <UserIcon className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-cream-50/50 border border-earth-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 focus:bg-white outline-none transition-all placeholder:text-earth-400"
                  />
                  <Mail className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-cream-50/50 border border-earth-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 focus:bg-white outline-none transition-all placeholder:text-earth-400"
                  />
                  <Phone className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 shadow-warm disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Sending Verification Code...
                  </span>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Or Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-earth-200"></div>
                <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-earth-400 tracking-wider">OR</span>
                <div className="flex-grow border-t border-earth-200"></div>
              </div>

              {/* Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full bg-white border border-earth-200 hover:border-earth-300 text-earth-800 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-warm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Terms and Privacy Text */}
              <p className="text-[10px] text-earth-500 text-center leading-relaxed pt-1">
                By continuing, you agree to CraftVeda's{' '}
                <span className="text-terracotta-600 font-medium underline cursor-pointer">Terms of Use</span> and{' '}
                <span className="text-terracotta-600 font-medium underline cursor-pointer">Privacy Policy</span>.
              </p>
            </form>
          )}

          {/* STEP 2: EMAIL OTP VERIFICATION SCREEN */}
          {step === 'otp_verify' && (
            <form onSubmit={handleOtpVerify} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-earth-800 mb-3 text-center">
                  Enter 6-Digit Verification Code
                </label>

                {/* 6 Individual Digit Inputs */}
                <div className="flex items-center justify-between gap-2 max-w-xs mx-auto" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-13 bg-cream-50/70 border-2 border-earth-200 rounded-2xl text-center text-lg font-bold text-earth-900 focus:border-terracotta-500 focus:bg-white focus:ring-2 focus:ring-terracotta-200 outline-none transition-all font-mono"
                    />
                  ))}
                </div>
              </div>

              {/* Verify OTP Button */}
              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6}
                className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 shadow-warm disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Code...
                  </span>
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center pt-2 border-t border-earth-100 text-xs text-earth-600">
                <span>Didn't receive the code? </span>
                {resendCooldown > 0 ? (
                  <span className="text-earth-400 font-medium font-mono font-bold">
                    Resend OTP in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-terracotta-600 hover:underline font-bold text-xs inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* STEP 3: PERSONAL DETAILS PAGE (POST-VERIFICATION) */}
          {step === 'personal_details' && (
            <form onSubmit={handlePersonalDetailsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-cream-50/50 border border-earth-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                  />
                  <UserIcon className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1">
                  Email Address <span className="text-emerald-600 text-[10px] font-semibold">(Verified & Read-only)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={currentUser?.email || email}
                    readOnly
                    className="w-full bg-cream-100/70 border border-earth-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-earth-600 font-medium cursor-not-allowed outline-none"
                  />
                  <Mail className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1">
                  Phone Number <span className="text-earth-400 font-normal">(Optional, for order delivery updates)</span>
                </label>
                <div className="flex gap-2">
                  <span className="bg-earth-100 border border-earth-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-earth-700 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full bg-cream-50/50 border border-earth-200 rounded-2xl px-3.5 py-2.5 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 outline-none"
                  />
                </div>
              </div>

              {/* Delivery Address (Optional) */}
              <div className="pt-2 border-t border-earth-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-earth-800">
                  <MapPin className="w-4 h-4 text-terracotta-500" />
                  <span>Default Shipping Address (Optional)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Flat / Door No"
                    value={houseFlat}
                    onChange={(e) => setHouseFlat(e.target.value)}
                    className="bg-cream-50/50 border border-earth-200 rounded-xl px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Street / Colony"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="bg-cream-50/50 border border-earth-200 rounded-xl px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-cream-50/50 border border-earth-200 rounded-xl px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="bg-cream-50/50 border border-earth-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Pincode (e.g. 302001)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-cream-50/50 border border-earth-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 shadow-warm"
                >
                  {loading ? 'Saving Profile...' : 'Save Profile & Continue'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-3.5 rounded-2xl text-xs font-bold text-earth-600 hover:bg-earth-100"
                >
                  Skip
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
