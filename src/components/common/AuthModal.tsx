import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, Mail, User as UserIcon, Phone, MapPin, 
  ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Edit2, ShieldCheck
} from 'lucide-react';

type AuthStep = 'email' | 'otp_verify' | 'personal_details';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, setIsAuthModalOpen, 
    sendOtp, verifyOtp, resendOtp, googleLogin,
    updateUserProfile, addSavedAddress, currentUser,
    setActiveCustomerPage
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
  const [profileImage, setProfileImage] = useState('');
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

  // Google Identity Services (GIS) Integration
  useEffect(() => {
    if (!isAuthModalOpen || step !== 'email') return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '434211721817-t5kqernt93mn4h821pqnqet1hcp6cmi0.apps.googleusercontent.com';

    const handleCredentialResponse = async (response: any) => {
      if (!response || !response.credential) {
        setErrorMsg('Failed to obtain Google account credentials.');
        return;
      }
      setErrorMsg('');
      setSuccessMsg('');
      try {
        setLoading(true);
        const res = await googleLogin({
          credential: response.credential,
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

    const initGsi = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
          });

          const btnContainer = document.getElementById('googleSignInBtnContainer');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              width: 360,
              text: 'continue_with',
              shape: 'pill',
            });
          }
        } catch (e) {
          console.warn('GIS Init Error:', e);
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGsi();
      document.head.appendChild(script);
    }
  }, [isAuthModalOpen, step]);

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
    setProfileImage('');
    setHouseFlat('');
    setStreet('');
    setCity('');
    setState('');
    setPincode('');
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    resetForm();
    setActiveCustomerPage('home');
  };

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // STEP 1: Submit Email for OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      await sendOtp(cleanEmail);
      setStep('otp_verify');
      setResendCooldown(60);
      setSuccessMsg(`Verification code sent to ${cleanEmail}`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle OTP Digit Inputs
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg('');

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

  // STEP 2: Submit OTP for Verification
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
      const cleanEmail = email.trim().toLowerCase();
      const res = await verifyOtp(cleanEmail, fullOtp);

      if (res && res.user) {
        if (!res.isProfileComplete || res.isNewUser) {
          setName(res.user.name || '');
          setPhone(res.user.phone || '');
          setProfileImage(res.user.profileImage || '');
          setStep('personal_details');
        } else {
          handleClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired verification code. Please request a new OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      await resendOtp(cleanEmail);
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMsg(`A new 6-digit code has been sent to ${cleanEmail}`);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Save Personal Details
  const handlePersonalDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full name is required');
      return;
    }

    try {
      setLoading(true);

      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        profileImage: profileImage.trim(),
      });

      if (houseFlat && street && city && state && pincode) {
        addSavedAddress({
          fullName: name.trim(),
          mobileNumber: phone || '+91 98765 43210',
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

      setSuccessMsg('Profile completed successfully!');
      setTimeout(() => {
        handleClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save personal details');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-earth-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-warm-hover border border-earth-100 max-w-md w-full my-auto overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 text-earth-400 hover:text-earth-700 bg-cream-50 hover:bg-cream-100 p-2 rounded-full border border-earth-200 z-10 transition-colors"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Clean Light-Themed Header */}
        <div className="bg-cream-50/80 p-4 sm:p-6 border-b border-earth-100 relative">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-terracotta-500 text-white flex items-center justify-center text-lg sm:text-xl shadow-warm">
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
                Enter your email address for a 6-digit OTP code or continue with Google.
              </p>
            </div>
          )}

          {step === 'otp_verify' && (
            <div className="mt-2">
              <h3 className="font-serif text-xl font-extrabold text-earth-900">Verify Verification Code</h3>
              <p className="text-xs text-earth-600 mt-1 leading-relaxed">
                We've sent a 6-digit verification code to:
              </p>
              <div className="flex items-center gap-2 text-xs text-earth-700 font-bold mt-2">
                <span className="text-terracotta-600 underline font-mono">{email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[10px] text-earth-500 hover:text-terracotta-600 flex items-center gap-0.5 ml-auto font-medium"
                >
                  <Edit2 className="w-3 h-3" /> Change Email
                </button>
              </div>
            </div>
          )}

          {step === 'personal_details' && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Email Verified
              </span>
              <h3 className="font-serif text-lg font-bold text-earth-900">Personal Details</h3>
              <p className="text-xs text-earth-600">Complete your profile details for an authentic craft shopping experience</p>
            </div>
          )}
        </div>

        {/* Modal Form Body */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
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

          {/* STEP 1: EMAIL LOGIN PAGE */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email (e.g. user@example.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-cream-50/50 border border-earth-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-earth-900 focus:ring-2 focus:ring-terracotta-500 focus:bg-white outline-none transition-all placeholder:text-earth-400 font-medium"
                  />
                  <Mail className="w-4 h-4 text-earth-400 absolute left-3.5 top-3.5" />
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

              {/* Single Continue with Google Button */}
              <div id="googleSignInBtnContainer" className="w-full flex justify-center min-h-[44px]"></div>

              {/* Terms Text */}
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
                <div className="flex items-center justify-between gap-1.5 sm:gap-2 max-w-xs mx-auto" onPaste={handlePaste}>
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
                      className="w-9 h-11 sm:w-11 sm:h-13 bg-cream-50/70 border-2 border-earth-200 rounded-xl sm:rounded-2xl text-center text-base sm:text-lg font-bold text-earth-900 focus:border-terracotta-500 focus:bg-white focus:ring-2 focus:ring-terracotta-200 outline-none transition-all font-mono"
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
                    <span>Verify Code</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend OTP & Change Email */}
              <div className="flex items-center justify-between pt-2 border-t border-earth-100 text-xs text-earth-600">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-earth-500 hover:text-earth-800 font-medium text-xs flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Change Email
                </button>

                {resendCooldown > 0 ? (
                  <span className="text-earth-400 font-mono font-bold text-xs">
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

          {/* STEP 3: PERSONAL DETAILS PAGE (FOR NEW/INCOMPLETE USERS) */}
          {step === 'personal_details' && (
            <form onSubmit={handlePersonalDetailsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your full name"
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
                  Phone Number <span className="text-earth-400 font-normal">(Optional)</span>
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
                  {loading ? 'Saving Details...' : 'Save Details & Continue'}
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
