import { useState, useEffect } from 'react';
import { User, Mail, Lock, ArrowRight, CheckCircle, XCircle, Phone } from 'lucide-react';
import { InputField } from '../components/InputField';
import Image from 'next/image';
import Link from 'next/link';
import { HiOutlineChevronLeft } from 'react-icons/hi';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');

    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
        });
        setErrors({});
        setSuccess('');
    }, [isLogin]);

    useEffect(() => {
        let timer;
        const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                document.cookie = 'session=; Max-Age=0; path=/'; // clear session
                router.push('/auth') // redirect to login
            }, 60 * 60 * 1000); // 1 hour
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);

        resetTimer(); // start on mount

        return () => {
            clearTimeout(timer);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
        };
    }, []);


    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => password.length >= 6;

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 6 characters';

        if (!isLogin) {
            if (!formData.name) newErrors.name = 'Name is required';
            if (!formData.phone) newErrors.phone = 'Phone number is required';
            else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Please enter a valid 10-digit phone number';
            if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
            else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        }
        return newErrors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, isLogin }),
            });

            const data = await res.json();

            if (!data.success) {
                setErrors({ submit: data.message });
            } else {
                setSuccess(
                    toast.success(data.message + ' Redirecting...')
                );

                if (isLogin) {
                    // Redirect to home after login
                    setTimeout(() => {
                        router.push('/');
                    }, 1500);
                } else {
                    // Switch to login after signup
                    setTimeout(() => setIsLogin(true), 1500);
                    router.push('/');
                }
            }
        } catch (err) {
            setErrors({ submit: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>{isLogin ? 'Sign In' : 'Sign Up'} - SV Cart</title>
                <meta name="description" content={isLogin ? 'Sign in to your account - SV Cart' : 'Create a new account - SV Cart'} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <div className="fixed inset-0 z-[1] bg-black/60 backdrop-blur-[2px]" />
            <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://dashboard.svcart.shop/wp-content/uploads/2026/07/auth-page-banner.png')] bg-cover bg-center">
                <div className="w-full max-w-md z-10">
                    <div className="p-8">
                        <Link href="/" className="text-white hover:underline flex gap-1 items-center"><HiOutlineChevronLeft size={20} /> Back</Link>
                        <div className="text-center my-8">
                            <div className="inline-flex items-center justify-center rounded-full mb-4">
                                <Image src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/favicon.png" alt="Logo" width={150} height={40} className='object-contain' />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h1>
                            <p className="text-white/80">
                                {isLogin ? 'Sign in to your account' : 'Join us today'}
                            </p>
                        </div>


                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Name (signup only) */}
                                {!isLogin && (
                                    <InputField
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        icon={User}
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        error={errors.name}
                                    />
                                )}

                                {/* Email */}
                                <InputField
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    icon={Mail}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    error={errors.email}
                                />

                                {!isLogin && (
                                    <InputField
                                        type="number"
                                        name="phone"
                                        placeholder="Phone Number"
                                        icon={Phone}
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        error={errors.phone}
                                    />
                                )}


                                {/* Password */}
                                <InputField
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    icon={Lock}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    showPasswordToggle
                                    showPassword={showPassword}
                                    onTogglePassword={() => setShowPassword(!showPassword)}
                                    error={errors.password}
                                />

                                {/* Confirm Password (signup only) */}
                                {!isLogin && (
                                    <InputField
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        icon={Lock}
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        showPasswordToggle
                                        showPassword={showConfirmPassword}
                                        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                                        error={errors.confirmPassword}
                                    />
                                )}

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="flex items-center text-red-600  text-sm">
                                        <XCircle size={14} className="mr-1" />
                                        {errors.submit}
                                    </div>
                                )}

                                {/* Forgot Password (login only) */}
                                {isLogin && (
                                    <div className="text-left">
                                        <button type="button" className="text-sm text-white hover:underline">
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    onClick={handleSubmit}

                                    disabled={loading}
                                    className="w-full bg-[#0C3A73] font-syne text-white py-3 cursor-pointer rounded-lg font-medium hover:bg-[#0A2C5A] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            {isLogin ? 'Signing In...' : 'Creating Account...'}
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            {isLogin ? 'Sign In' : 'Create Account'}
                                            <ArrowRight size={18} className="ml-2" />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>
                        {/* Toggle */}
                        <div className="mt-8 text-center">
                            <span className="text-white/80">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-white font-medium hover:underline cursor-pointer  underline hover:no-underline"
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </div>

                        {/* Social */}
                        {/* <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-400"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-400 rounded-full shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Google
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-400 rounded-full shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Facebook
              </button>
            </div>
          </div> */}
                    </div>

                    <p className="text-center text-sm text-white/80 mt-8">
                        By {isLogin ? 'signing in' : 'creating an account'}, you agree to our{' '}
                        <Link href="/terms-condition" className="text-white underline hover:no-underline">Terms of Service</Link> and{' '}
                        <Link href="/privacy-policy" className="text-white underline hover:no-underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default AuthPage;