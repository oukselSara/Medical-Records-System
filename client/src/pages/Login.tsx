import { useState } from "react";
import { Loader2, Heart, Mail, Lock, Sparkles } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Link, useLocation } from "wouter";

const LoginPage = () => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (title, description, variant = "default") => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      console.log("✅ Login successful:", result.user.email);
      showToast("Welcome back!", "You have successfully signed in.");
      // Navigate to dashboard - the AuthContext will handle the redirect
      setTimeout(() => {
        console.log("🔄 Navigating to dashboard...");
        setLocation("/dashboard");
      }, 800);
    } catch (error) {
      showToast(
        "Sign in failed",
        error.message || "Invalid email or password. Please try again.",
        "destructive",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Google login successful:", result.user.email);
      showToast("Welcome!", "You have successfully signed in with Google.");
      // Navigate to dashboard
      setTimeout(() => {
        console.log("🔄 Navigating to dashboard...");
        setLocation("/dashboard");
      }, 800);
    } catch (error) {
      showToast(
        "Google sign in failed",
        error.message || "Could not sign in with Google. Please try again.",
        "destructive",
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 backdrop-blur-xl rounded-xl p-4 shadow-2xl border-2 animate-slide-in max-w-sm ${
            toast.variant === "destructive"
              ? "bg-rose-50/90 dark:bg-rose-950/90 border-rose-300 dark:border-rose-700"
              : "bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-700"
          }`}
        >
          <div className="flex gap-3">
            <div
              className={`w-1.5 rounded-full ${
                toast.variant === "destructive"
                  ? "bg-gradient-to-b from-rose-400 to-rose-600"
                  : "bg-gradient-to-b from-emerald-400 to-emerald-600"
              }`}
            ></div>
            <div className="flex-1">
              <h4
                className={`font-bold mb-1 ${
                  toast.variant === "destructive"
                    ? "text-rose-900 dark:text-rose-100"
                    : "text-emerald-900 dark:text-emerald-100"
                }`}
              >
                {toast.title}
              </h4>
              <p
                className={`text-sm ${
                  toast.variant === "destructive"
                    ? "text-rose-700 dark:text-rose-300"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {toast.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-100 dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-[#2a1a2a]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-300 dark:bg-rose-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-fuchsia-300 dark:bg-fuchsia-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md transform transition-all duration-500 ease-in-out hover:scale-[1.02]">
          {/* Logo Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-pink-500/30 dark:shadow-pink-500/50 transition-all duration-300 hover:shadow-pink-500/50 dark:hover:shadow-pink-500/70 hover:rotate-6">
                  <Heart className="w-7 h-7 text-white" fill="white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-pink-500 dark:text-pink-400 animate-pulse" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 dark:from-pink-400 dark:via-rose-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                MediCare EMR
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
              Electronic Medical Records System
            </p>
          </div>

          {/* Glassmorphism Card */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 rounded-2xl opacity-20 dark:opacity-40 blur-xl group-hover:opacity-30 dark:group-hover:opacity-60 transition-all duration-500"></div>

            <div className="relative backdrop-blur-2xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-pink-200/50 dark:border-pink-500/30 shadow-2xl shadow-pink-500/10 dark:shadow-pink-500/30 overflow-hidden transition-all duration-300">
              {/* Gradient overlay */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-400 via-rose-500 to-fuchsia-500"></div>

              <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-fuchsia-600 dark:from-pink-400 dark:to-fuchsia-400 bg-clip-text text-transparent mb-2">
                    Welcome back
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Sign in to access your medical dashboard
                  </p>
                </div>

                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full group relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border-2 border-pink-300/50 dark:border-pink-500/50 hover:border-pink-400 dark:hover:border-pink-400 rounded-xl px-6 py-3.5 font-semibold text-gray-700 dark:text-gray-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-pink-500/20 dark:hover:shadow-pink-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <span className="relative flex items-center justify-center gap-3">
                    {isGoogleLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-pink-600 dark:text-pink-400" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                        />
                        <path
                          fill="#34A853"
                          d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                        />
                        <path
                          fill="#4A90E2"
                          d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                        />
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </span>
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-pink-200 dark:border-pink-500/30"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm px-4 py-1 rounded-full text-gray-500 dark:text-gray-400 font-semibold border border-pink-200/50 dark:border-pink-500/30">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                          focusedField === "email"
                            ? "text-pink-500 dark:text-pink-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="doctor@clinic.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-2 border-pink-200/50 dark:border-pink-500/30 focus:border-pink-400 dark:focus:border-pink-400 focus:bg-white dark:focus:bg-gray-800/80 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 ease-in-out focus:shadow-lg focus:shadow-pink-500/20 dark:focus:shadow-pink-500/40 outline-none"
                      />
                      {focusedField === "email" && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/20 to-fuchsia-400/20 dark:from-pink-500/20 dark:to-fuchsia-500/20 -z-10 blur-md"></div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                          focusedField === "password"
                            ? "text-pink-500 dark:text-pink-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-2 border-pink-200/50 dark:border-pink-500/30 focus:border-pink-400 dark:focus:border-pink-400 focus:bg-white dark:focus:bg-gray-800/80 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 ease-in-out focus:shadow-lg focus:shadow-pink-500/20 dark:focus:shadow-pink-500/40 outline-none"
                      />
                      {focusedField === "password" && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/20 to-fuchsia-400/20 dark:from-pink-500/20 dark:to-fuchsia-500/20 -z-10 blur-md"></div>
                      )}
                    </div>
                    {errors.password && (
                      <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || isGoogleLoading}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:from-pink-600 hover:via-rose-600 hover:to-fuchsia-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-pink-500/50 dark:hover:shadow-pink-500/70 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-6"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <span>Sign in</span>
                      )}
                    </span>
                    <div className="absolute inset-0 -top-full group-hover:top-0 bg-gradient-to-b from-white/20 to-transparent transition-all duration-300"></div>
                  </button>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-6">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-bold text-transparent bg-gradient-to-r from-pink-600 to-fuchsia-600 dark:from-pink-400 dark:to-fuchsia-400 bg-clip-text hover:from-pink-700 hover:to-fuchsia-700 dark:hover:from-pink-300 dark:hover:to-fuchsia-300 transition-all duration-300"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
