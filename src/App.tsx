/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  CloudSun, 
  Languages, 
  ChevronLeft, 
  Loader2, 
  Wheat, 
  ThermometerSun,
  History,
  Info,
  Share,
  Bell,
  MessageCircle,
  MessageSquare,
  Send,
  Moon,
  Sun,
  ThumbsUp,
  ThumbsDown,
  IndianRupee,
  TrendingUp,
  Wind,
  Droplets,
  ShoppingBag,
  Package,
  Edit2,
  User,
  UserCheck,
  Search,
  X,
  MapPin,
  Mail,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  FileDown,
  Download,
  LogOut,
  Settings,
  Lock,
  Check,
  Newspaper,
  Sprout,
  ShieldAlert,
  CreditCard,
  Wallet,
  Banknote,
  QrCode,
  Scan,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { translations, Language, Translation } from './translations';
import { 
  analyzeCropDisease, 
  getFarmingTips, 
  getAISuggestion, 
  getCropRates,
  getHistoricalCropRates,
  getAgroNews,
  type HistoricalRate,
  type NewsItem
} from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState<'home' | 'detect' | 'tips' | 'result' | 'chat' | 'settings' | 'feedback' | 'rates' | 'shop' | 'orders' | 'login' | 'admin' | 'admin-login' | 'farmer-login' | 'farmer-panel' | 'news' | 'shop-management'>('home');
  const [user, setUser] = useState<{ id: number, email: string, role: 'admin' | 'customer' | 'farmer', name: string, phone?: string, location?: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', name: '', phone: '', location: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [adminStats, setAdminStats] = useState<{ totalScans: number, totalFarmers: number, totalCustomers: number, recentUsers: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [tips, setTips] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ id: string, role: 'user' | 'ai', content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notificationsEnabled') !== 'false'; // Default to true
    }
    return true;
  });
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);
  const [showOrderToast, setShowOrderToast] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: ""
  });
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [farmerPassword, setFarmerPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('farmerPassword') || '123456789';
    }
    return '123456789';
  });
  const [isFarmerPasswordModalOpen, setIsFarmerPasswordModalOpen] = useState(false);
  const [farmerPasswordInput, setFarmerPasswordInput] = useState('');
  const [pendingRoleSwitch, setPendingRoleSwitch] = useState<'customer' | 'farmer' | null>(null);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [cropRatesData, setCropRatesData] = useState<string | null>(null);
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [showRateGraph, setShowRateGraph] = useState(false);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [weather, setWeather] = useState<{ temp: number, humidity: number, wind: number } | null>(null);
  const [shopCategory, setShopCategory] = useState<'seeds' | 'pesticides' | 'dealers'>('seeds');
  const [selectedDistrict, setSelectedDistrict] = useState<'all' | 'yavatmal' | 'wardha' | 'amravati' | 'pune' | 'nagpur' | 'nashik' | 'sambhajinagar' | 'jalgaon' | 'solapur' | 'kolhapur' | 'ahmednagar' | 'buldhana' | 'akola'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentQrOpen, setIsPaymentQrOpen] = useState(false);
  const [isCheckoutPayment, setIsCheckoutPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentTimer, setPaymentTimer] = useState<number>(120);
  const [paymentQrUrl, setPaymentQrUrl] = useState<string | null>(null);
  const [shopDetails, setShopDetails] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shopDetails');
      return saved ? JSON.parse(saved) : {
        name: 'Rupesh Dagwar Shop',
        upiId: '8999121363@axl',
        phone: '8999121363',
        address: 'Yavatmal, Maharashtra',
        description: 'Quality Seeds & Pesticides for Farmers'
      };
    }
    return {
      name: 'Rupesh Dagwar Shop',
      upiId: '8999121363@axl',
      phone: '8999121363',
      address: 'Yavatmal, Maharashtra',
      description: 'Quality Seeds & Pesticides for Farmers'
    };
  });

  const generatePaymentQr = async (amount?: number | React.MouseEvent) => {
    try {
      const actualAmount = typeof amount === 'number' ? amount : 0;
      setIsCheckoutPayment(actualAmount > 0);
      setPaymentMethod('upi');
      setPaymentAmount(actualAmount);
      setPaymentTimer(120);
      const upiUrl = `upi://pay?pa=${shopDetails.upiId}&pn=${encodeURIComponent(shopDetails.name)}&cu=INR${actualAmount > 0 ? `&am=${actualAmount}` : ''}`;
      const url = await QRCode.toDataURL(upiUrl, {
        width: 1024,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setPaymentQrUrl(url);
      setIsPaymentQrOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Crop Detection Camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCropCamera = async () => {
      setLoading(true);
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error", err);
        alert(translations[lang].cameraError);
      } finally {
        setLoading(false);
      }
    };

    if (view === 'detect') {
      startCropCamera();
    } else {
      stopCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [view]);

  const [lastOrder, setLastOrder] = useState<any>(null);
  const [cart, setCart] = useState<{ product: any, quantity: number }[]>([]);
  const [orderHistory, setOrderHistory] = useState<{ id: string, date: string, items: any[], total: number }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orderHistory');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [scanHistory, setScanHistory] = useState<{ id: string, date: string, image: string, result: string }[]>([]);
  const [farmerProducts, setFarmerProducts] = useState<{ id: string, name: string, price: string, category: string, image: string, quantity?: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('farmerProducts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'seeds', image: '', quantity: '' });
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [newCrop, setNewCrop] = useState({ name: '', type: '', plantingDate: '', harvestDate: '', status: 'Growing' });

  useEffect(() => {
    localStorage.setItem('farmerPassword', farmerPassword);
  }, [farmerPassword]);

  useEffect(() => {
    localStorage.setItem('farmerProducts', JSON.stringify(farmerProducts));
  }, [farmerProducts]);

  useEffect(() => {
    localStorage.setItem('shopDetails', JSON.stringify(shopDetails));
  }, [shopDetails]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPaymentQrOpen && paymentMethod === 'upi' && paymentTimer > 0) {
      timer = setInterval(() => {
        setPaymentTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaymentQrOpen, paymentMethod, paymentTimer]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    const fetchScans = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/scans?userId=${user.id}&role=${user.role}`);
        if (response.ok) {
          const data = await response.json();
          setScanHistory(data.map((s: any) => ({
            id: s.id.toString(),
            date: new Date(s.created_at).toLocaleString(),
            image: s.image_data,
            result: s.diagnosis
          })));
        }
      } catch (error) {
        console.error("Failed to fetch scans from backend", error);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin' && view === 'admin') {
      fetchAdminStats();
    }
  }, [user, view]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setAdminStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCustomerData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const users = await response.json();
        
        // Prepare data for Excel
        const data = users.map((u: any) => ({
          'ID': u.id,
          'Name': u.name,
          'Email': u.email,
          'Role': u.role,
          'Phone': u.phone || 'N/A',
          'Location': u.location || 'N/A',
          'OTP': u.otp || 'N/A',
          'Registration Date': u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A',
          'Last Login': u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

        // Generate and download file
        XLSX.writeFile(workbook, `RDAGRO_Customers_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (error) {
      console.error("Failed to download customer data", error);
      alert("Failed to generate Excel sheet");
    } finally {
      setLoading(false);
    }
  };

  const downloadScanData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/scans');
      if (response.ok) {
        const scans = await response.json();
        
        // Prepare data for Excel
        const data = scans.map((s: any) => ({
          'Scan ID': s.id,
          'User Name': s.user_name || 'Guest',
          'User Email': s.user_email || 'N/A',
          'Crop Type': s.crop_type,
          'Diagnosis': s.diagnosis,
          'Scan Date': s.created_at ? new Date(s.created_at).toLocaleString() : 'N/A'
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Scans");

        // Generate and download file
        XLSX.writeFile(workbook, `RDAGRO_Scans_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (error) {
      console.error("Failed to download scan data", error);
      alert("Failed to generate Scan Excel sheet");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    setSuccessMessage('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setView(userData.role === 'admin' ? 'admin' : 'home');
      } else {
        setLoginError('Invalid email or password');
      }
    } catch (error) {
      setLoginError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoginError('');
    setSuccessMessage('');
    if (!registerForm.phone) {
      setLoginError("Please enter phone number first");
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setOtpSent(true);
      // Use a specific prefix to identify OTP messages so they aren't cleared accidentally
      setSuccessMessage(`OTP_CODE:${otp}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoginError('');
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      if (registerForm.otp.trim() === generatedOtp) {
        setOtpVerified(true);
        setSuccessMessage("OTP Verified Successfully!");
      } else {
        setLoginError("Invalid OTP. Please check the code and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      setLoginError("Please verify OTP first");
      return;
    }
    setLoading(true);
    setLoginError('');
    setSuccessMessage('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setView('home');
      } else {
        const data = await response.json();
        setLoginError(data.error || 'Registration failed');
      }
    } catch (error) {
      setLoginError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    // Generate QR with the specific cart total
    await generatePaymentQr(cartTotal);
  };

  const buyNow = async (product: any, qty: number = 1) => {
    const price = parseInt(product.price.replace(/[^0-9]/g, ''));
    // Add to cart first
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    
    // Show QR with the specific product price (or new total)
    // To be safe and simple, we show QR for just this product if it's a "Buy Now"
    // or we can calculate the new total.
    const currentTotal = cart.reduce((acc, item) => {
      const p = parseInt(item.product.price.replace(/[^0-9]/g, ''));
      return acc + (p * item.quantity);
    }, 0);
    
    await generatePaymentQr(currentTotal + price);
  };

  const confirmOrder = async () => {
    setLoading(true);
    setIsPaymentQrOpen(false);
    setIsCheckoutPayment(false);
    
    // Mock order delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setIsOrderSuccess(true);
    setShowOrderToast(true);
    setTimeout(() => setShowOrderToast(false), 4000);
    
    const newOrder = {
      id: `AGR-${Math.floor(Math.random() * 1000000)}`,
      date: new Date().toLocaleString(),
      items: [...cart],
      total: paymentAmount
    };
    
    setLastOrder(newOrder);
    setOrderHistory(prev => [newOrder, ...prev]);
    setCart([]);
    setCardDetails({ number: '', expiry: '', cvv: '' });
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userProfile.name,
          phone: userProfile.contact,
          location: userProfile.farmLocation
        })
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsProfileEditOpen(false);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    setLoginError('');
    setSuccessMessage('');
    try {
      const response = await fetch('/api/admin/update-credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: adminCredentials.email,
          password: adminCredentials.password
        })
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSuccessMessage('Admin credentials updated successfully');
        setIsAdminSettingsOpen(false);
      } else {
        const err = await response.json();
        setLoginError(err.error || 'Update failed');
      }
    } catch (error) {
      setLoginError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    localStorage.removeItem('user');
  };

  const handleRoleSwitch = async (newRole: 'customer' | 'farmer') => {
    if (!user || user.role === 'admin') return;
    if (user.role === newRole) return;
    
    if (newRole === 'farmer') {
      setPendingRoleSwitch('farmer');
      setIsFarmerPasswordModalOpen(true);
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    try {
      const response = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: newRole })
      });
      
      if (response.ok) {
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSuccessMessage(`Switched to ${(newRole as string) === 'farmer' ? 'Farmer' : 'Customer'} account successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert("Failed to switch account type");
      }
    } catch (error) {
      console.error("Error switching role:", error);
      alert("An error occurred while switching account type");
    } finally {
      setLoading(false);
    }
  };

  const confirmFarmerSwitch = async () => {
    if (farmerPasswordInput !== farmerPassword) {
      setLoginError("Invalid Farmer Password");
      return;
    }

    setLoading(true);
    setLoginError('');
    try {
      const response = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, role: 'farmer' })
      });
      
      if (response.ok) {
        const updatedUser = { ...user!, role: 'farmer' as const };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSuccessMessage("Switched to Farmer account successfully!");
        setIsFarmerPasswordModalOpen(false);
        setFarmerPasswordInput('');
        setPendingRoleSwitch(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setLoginError("Failed to update role on server");
      }
    } catch (error) {
      setLoginError("Connection error");
    } finally {
      setLoading(false);
    }
  };
  const [userProfile, setUserProfile] = useState(() => {
    const defaultProfile = {
      name: 'Rajesh Kumar',
      farmLocation: 'Nashik, Maharashtra',
      contact: '9876543210',
      email: 'rajesh@farm.com',
      crops: [],
      chatHistory: [],
      preferences: {
        organic: false,
        pestAlerts: true,
        marketUpdates: true
      }
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with default to ensure new fields like preferences exist
        return {
          ...defaultProfile,
          ...parsed,
          preferences: {
            ...defaultProfile.preferences,
            ...(parsed.preferences || {})
          }
        };
      }
    }
    return defaultProfile;
  });

  useEffect(() => {
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name,
        farmLocation: user.location || 'Not specified',
        contact: user.phone || 'Not specified',
        email: user.email
      }));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
  }, [scanHistory]);

  const addToCart = (product: any, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => {
    const priceStr = item.product.price.replace(/[^\d]/g, '');
    const price = parseInt(priceStr) || 0;
    return acc + (price * item.quantity);
  }, 0);

  const PRODUCTS = {
    seeds: [
      { id: 1, name: "Mahyco MH-12 Wheat Seeds", price: "₹1,250/25kg", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80" },
      { id: 2, name: "Bayer Arize 6444 Gold Rice", price: "₹850/3kg", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80" },
      { id: 3, name: "Pioneer P3501 Maize Seeds", price: "₹1,100/4kg", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80" },
      { id: 4, name: "Rasi RCH 659 BGII Cotton", price: "₹810/450g", image: "https://images.unsplash.com/photo-1594904351111-a072f80b1a71?auto=format&fit=crop&w=600&q=80" },
      { id: 11, name: "Advanta Golden Mustard", price: "₹650/kg", image: "https://images.unsplash.com/photo-1508013861974-9f6347163ebe?auto=format&fit=crop&w=600&q=80" },
      { id: 12, name: "Pioneer Soybean 335", price: "₹3,200/30kg", image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80" },
      { id: 13, name: "JK Seeds Sugarcane Setts", price: "₹1,500/quintal", image: "https://images.unsplash.com/photo-1590004953392-5aba2e72269a?auto=format&fit=crop&w=600&q=80" },
      { id: 14, name: "Namdhari Tomato NS-526", price: "₹450/10g", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80" },
      { id: 15, name: "Syngenta Chilli HPH-12", price: "₹580/10g", image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80" },
      { id: 16, name: "Nunhems Onion Arka Kalyan", price: "₹1,200/500g", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80" },
      { id: 17, name: "Mahyco Bajra MHR-15", price: "₹420/1.5kg", image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80" },
      { id: 18, name: "Kaveri Jowar K-60", price: "₹380/3kg", image: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80" },
      { id: 19, name: "Salem Turmeric Rhizomes", price: "₹2,400/quintal", image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80" },
      { id: 20, name: "Sunflower Hybrid SF-101", price: "₹850/kg", image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80" },
      { id: 21, name: "Groundnut K-6 Seeds", price: "₹1,800/20kg", image: "https://images.unsplash.com/photo-1567333164114-9932c3903564?auto=format&fit=crop&w=600&q=80" },
      { id: 22, name: "Cabbage Golden Acre", price: "₹320/50g", image: "https://images.unsplash.com/photo-1550147760-44c9966d6bc7?auto=format&fit=crop&w=600&q=80" },
      { id: 23, name: "Cauliflower Pusa Katki", price: "₹410/50g", image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ec3?auto=format&fit=crop&w=600&q=80" },
      { id: 24, name: "Brinjal Pusa Purple Long", price: "₹280/20g", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80" },
      { id: 25, name: "Okra Anamika Seeds", price: "₹520/250g", image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=600&q=80" },
    ],
    pesticides: [
      { id: 5, name: "Syngenta Matador Insecticide", price: "₹450/250ml", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80" },
      { id: 6, name: "Bayer Nativo Fungicide", price: "₹950/100g", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80" },
      { id: 7, name: "UPL Saaf Fungicide", price: "₹320/250g", image: "https://images.unsplash.com/photo-1592890288564-76628a30a657?auto=format&fit=crop&w=600&q=80" },
      { id: 8, name: "Coromandel Gromor Booster", price: "₹280/kg", image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80" },
      { id: 9, name: "Tata Rallis Contaf Plus", price: "₹550/500ml", image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=600&q=80" },
      { id: 10, name: "Dhanuka M-45 Fungicide", price: "₹380/500g", image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80" },
      { id: 30, name: "Pure Neem Oil (Organic)", price: "₹180/200ml", image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80" },
      { id: 31, name: "Roundup Herbicide", price: "₹650/Ltr", image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80" },
      { id: 32, name: "Confidor Insecticide", price: "₹420/100ml", image: "https://images.unsplash.com/photo-1603807008857-ad66b70431aa?auto=format&fit=crop&w=600&q=80" },
      { id: 33, name: "Bavistin Fungicide", price: "₹290/250g", image: "https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?auto=format&fit=crop&w=600&q=80" },
      { id: 34, name: "Indofil M-45", price: "₹350/500g", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80" },
      { id: 35, name: "Chlorpyrifos 20% EC", price: "₹480/500ml", image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80" },
    ],
    dealers: [
      { id: 101, name: "Yavatmal Krushi Seva Kendra", district: "yavatmal", phone: "+91 94221 85630", address: "Main Road, Near Bus Stand, Yavatmal", image: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=600&q=80" },
      { id: 102, name: "Wardha Agro Agency", district: "wardha", phone: "+91 98230 12456", address: "Market Yard, Wardha HO, Wardha", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80" },
      { id: 103, name: "Amravati Seeds & Pesticides", district: "amravati", phone: "+91 94045 67890", address: "Morshi Road, Amravati", image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80" },
      { id: 104, name: "Vidarbha Fertilizers & Seeds", district: "yavatmal", phone: "+91 98901 23456", address: "Pusad Road, Digras, Yavatmal", image: "https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&w=600&q=80" },
      { id: 105, name: "Kisan Suvidha Kendra", district: "wardha", phone: "+91 97634 56781", address: "Arvi Road, Hinganghat, Wardha", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" },
      { id: 106, name: "Amravati Krushi Bhandar", district: "amravati", phone: "+91 99223 34455", address: "Railway Station Road, Badnera, Amravati", image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80" },
      { id: 107, name: "Pune Agro Solutions", district: "pune", phone: "+91 20 2687 1234", address: "Market Yard, Gultekdi, Pune", image: "https://images.unsplash.com/photo-1506484334402-40ff22e0d467?auto=format&fit=crop&w=600&q=80" },
      { id: 108, name: "Nagpur Farmers Friend", district: "nagpur", phone: "+91 712 272 5678", address: "Cotton Market, Nagpur", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80" },
      { id: 109, name: "Nashik Grapes & Seeds", district: "nashik", phone: "+91 253 257 8901", address: "Pimpalgaon Baswant, Nashik", image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80" },
      { id: 110, name: "Sambhajinagar Krushi Seva", district: "sambhajinagar", phone: "+91 240 248 1234", address: "Paithan Road, Chhatrapati Sambhajinagar", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" },
      { id: 111, name: "Jalgaon Banana Agro", district: "jalgaon", phone: "+91 257 223 4567", address: "Raver Road, Jalgaon", image: "https://images.unsplash.com/photo-1528301721190-186c3bd82705?auto=format&fit=crop&w=600&q=80" },
      { id: 112, name: "Solapur Sugar & Seeds", district: "solapur", phone: "+91 217 231 2345", address: "Barshi Road, Solapur", image: "https://images.unsplash.com/photo-1590004953392-5aba2e72269a?auto=format&fit=crop&w=600&q=80" },
      { id: 113, name: "Kolhapur Agro Mart", district: "kolhapur", phone: "+91 231 265 6789", address: "Shahupuri, Kolhapur", image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80" },
      { id: 114, name: "Ahmednagar Krushi Kendra", district: "ahmednagar", phone: "+91 241 234 5678", address: "Savedi Road, Ahmednagar", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" },
      { id: 115, name: "Buldhana Seeds Agency", district: "buldhana", phone: "+91 7262 245678", address: "Chikhli Road, Buldhana", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80" },
      { id: 116, name: "Akola Cotton & Seeds", district: "akola", phone: "+91 724 243 1234", address: "Murtizapur Road, Akola", image: "https://images.unsplash.com/photo-1594904351111-a072f80b1a71?auto=format&fit=crop&w=600&q=80" },
      { id: 117, name: "Pune Organic Seeds", district: "pune", phone: "+91 98220 45678", address: "Kothrud, Pune", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80" },
      { id: 118, name: "Nagpur Orange Agro", district: "nagpur", phone: "+91 94228 12345", address: "Kalmeshwar, Nagpur", image: "https://images.unsplash.com/photo-1506484334402-40ff22e0d467?auto=format&fit=crop&w=600&q=80" },
      { id: 119, name: "Sahyadri Agro Nashik", district: "nashik", phone: "+91 98500 12345", address: "Adgaon, Nashik", image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80" },
      { id: 120, name: "Marathwada Krushi Kendra", district: "sambhajinagar", phone: "+91 94231 56789", address: "Waluj, Chhatrapati Sambhajinagar", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" },
      { id: 121, name: "Jalgaon Cotton King", district: "jalgaon", phone: "+91 98234 56789", address: "Amalner Road, Jalgaon", image: "https://images.unsplash.com/photo-1528301721190-186c3bd82705?auto=format&fit=crop&w=600&q=80" },
      { id: 122, name: "Solapur Grapes Solutions", district: "solapur", phone: "+91 94033 12345", address: "Pandharpur Road, Solapur", image: "https://images.unsplash.com/photo-1590004953392-5aba2e72269a?auto=format&fit=crop&w=600&q=80" },
      { id: 123, name: "Kolhapur Jaggery & Seeds", district: "kolhapur", phone: "+91 98900 12345", address: "Gadhinglaj, Kolhapur", image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80" },
      { id: 124, name: "Ahmednagar Onion Seeds", district: "ahmednagar", phone: "+91 94222 12345", address: "Rahuri, Ahmednagar", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" },
      { id: 125, name: "Buldhana Cotton Mart", district: "buldhana", phone: "+91 98600 12345", address: "Malkapur Road, Buldhana", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80" },
      { id: 126, name: "Akola Pulse & Seeds", district: "akola", phone: "+91 94221 12345", address: "Akot Road, Akola", image: "https://images.unsplash.com/photo-1594904351111-a072f80b1a71?auto=format&fit=crop&w=600&q=80" },
    ]
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
    }
  }, [notificationsEnabled]);

  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(newLoc);
          fetchWeather(newLoc.lat, newLoc.lng);
        },
        (err) => {
          console.warn("Location access denied", err);
          // Default to a location in India (e.g., Delhi) if denied
          fetchWeather(28.6139, 77.2090);
        }
      );
    } else {
      // Default to Delhi
      fetchWeather(28.6139, 77.2090);
    }
  }, []);

  const fetchWeather = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
      const data = await response.json();
      if (data.current) {
        setWeather({
          temp: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          wind: data.current.wind_speed_10m
        });
      }
    } catch (error) {
      console.error("Error fetching weather", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    setIsFeedbackOpen(true);
  };

  const submitFeedbackForm = () => {
    setShowFeedbackToast(true);
    setTimeout(() => {
      setShowFeedbackToast(false);
      setView('home');
    }, 2000);
    // Reset form
    setFeedbackForm({ q1: 0, q2: 0, q3: 0, q4: 0, q5: "" });
  };

  const FeedbackButtons = ({ compact = false }: { compact?: boolean }) => (
    <div className={cn(
      "flex items-center gap-2 mt-2",
      compact ? "justify-start opacity-60 hover:opacity-100 transition-opacity" : "justify-center pt-4 border-t border-slate-100 dark:border-slate-800 mt-4"
    )}>
      <button 
        onClick={() => handleFeedback('up')}
        className={cn(
          "rounded-xl transition-all active:scale-90",
          compact ? "p-1.5" : "p-3",
          feedback === 'up' 
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
            : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600"
        )}
      >
        <ThumbsUp size={compact ? 14 : 20} />
      </button>
      <button 
        onClick={() => handleFeedback('down')}
        className={cn(
          "rounded-xl transition-all active:scale-90",
          compact ? "p-1.5" : "p-3",
          feedback === 'down' 
            ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
            : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600"
        )}
      >
        <ThumbsDown size={compact ? 14 : 20} />
      </button>
    </div>
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setCapturedImage(base64);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64: string) => {
    setLoading(true);
    setView('result');
    setFeedback(null);
    try {
      const analysis = await analyzeCropDisease(base64, lang);
      setResult(analysis);
      
      // Save to history
      const newScan = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleString(),
        image: base64,
        result: analysis
      };
      setScanHistory(prev => [newScan, ...prev]);

      // Save to backend
      if (user) {
        try {
          await fetch('/api/scans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              image_data: base64,
              diagnosis: analysis,
              crop_type: 'unknown'
            })
          });
        } catch (error) {
          console.error("Failed to save scan to backend", error);
        }
      }
    } catch (error) {
      console.error(error);
      setResult("Error analyzing image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTips = async () => {
    setLoading(true);
    setView('tips');
    setFeedback(null);
    try {
      const farmingTips = await getFarmingTips(location, lang, userProfile);
      setTips(farmingTips);
    } catch (error) {
      console.error(error);
      setTips("Error fetching tips.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRates = async () => {
    if (!selectedState || !selectedCrop || !selectedCity) return;
    setLoading(true);
    setFeedback(null);
    try {
      const rates = await getCropRates(selectedState, selectedCrop, selectedCity, lang);
      setCropRatesData(rates);
    } catch (error) {
      console.error(error);
      setCropRatesData("Error fetching crop rates.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalRates = async () => {
    if (!selectedState || !selectedCrop || !selectedCity) return;
    setLoadingGraph(true);
    setShowRateGraph(true);
    try {
      const data = await getHistoricalCropRates(selectedState, selectedCrop, selectedCity);
      setHistoricalRates(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingGraph(false);
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    setView('news');
    try {
      const news = await getAgroNews(lang);
      setNewsItems(news);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const RateGraph = () => {
    if (loadingGraph) {
      return (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-neon-green/20">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating Trends...</p>
        </div>
      );
    }

    if (historicalRates.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t.historicalTrends}</h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-green neon-bg" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-neon-green/70">{selectedCrop}</span>
          </div>
        </div>
        
        <div className="h-64 w-full bg-white dark:bg-slate-900 rounded-3xl p-4 border border-emerald-100 dark:border-neon-green/20 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalRates}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF00" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00FF00" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.1} vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: '#888888', fontWeight: 'bold' }}
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleDateString(lang, { day: 'numeric', month: 'short' });
                }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: '#888888', fontWeight: 'bold' }}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#000' : '#fff', 
                  borderRadius: '16px', 
                  border: '1px solid #00FF0033',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#00FF00' }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#00FF00" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-center text-slate-400 font-medium italic">
          * {t.pricePerQuintal}
        </p>
      </div>
    );
  };

  const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const COMMON_CROPS = [
    "Wheat", "Rice", "Maize", "Cotton", "Sugarcane", "Soybean", "Onion", "Potato", "Tomato", "Mustard", 
    "Groundnut", "Turmeric", "Ginger", "Garlic", "Chilli", "Black Gram", "Green Gram", "Chickpea"
  ];

  const handleShare = async (text: string | null) => {
    if (!text) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.title,
          text: text.substring(0, 1000), // Limit text for some platforms
          url: window.location.href
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
      } catch (err) {
        console.error("Clipboard error:", err);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { id: Date.now().toString() + '-user', role: 'user', content: userMessage }]);
    setChatInput('');
    setLoading(true);
    
    try {
      const aiResponse = await getAISuggestion(userMessage, lang, userProfile);
      const aiMessage = { id: Date.now().toString() + '-ai', role: 'ai' as const, content: aiResponse };
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Save to profile history
      setUserProfile(prev => ({
        ...prev,
        chatHistory: [
          { query: userMessage, response: aiResponse, date: new Date().toISOString() },
          ...(prev.chatHistory || [])
        ].slice(0, 20) // Keep last 20 queries
      }));
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { id: Date.now().toString() + '-error', role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = () => {
    setView('detect');
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const base64 = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(base64);
        
        stopCamera();
        
        processImage(base64);
      }
    }
  };

  const LoadingOverlay = () => (
    <AnimatePresence>
      {loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center"
        >
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-neon-green/20 flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
              <div className="absolute inset-0 blur-xl bg-neon-green/20 animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Processing Request</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-black text-[#2c3e50] dark:text-slate-200 font-sans selection:bg-neon-green/30 transition-colors duration-300">
      <LoadingOverlay />
      {/* Header */}
      <header className="bg-white dark:bg-black border-b border-emerald-100 dark:border-neon-green/30 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-neon-green p-2 rounded-xl shadow-lg shadow-neon-green/20 rotate-3 neon-bg">
            <Wheat className="text-black w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black leading-none text-emerald-900 dark:text-neon-green tracking-tighter italic neon-text">RD<span className="text-emerald-600 dark:text-white">AGRO</span></h1>
            <p className="text-[9px] text-emerald-600 dark:text-neon-green/70 font-bold uppercase tracking-[0.2em]">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert(t.notifications + ": Coming Soon!")}
            className="p-2 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-neon-green hover:bg-slate-100 dark:hover:bg-neon-green/10 transition-colors border border-slate-200 dark:border-neon-green/30"
            title={t.notifications}
          >
            <Bell size={20} />
          </button>
          <button 
            onClick={() => setLang(l => l === 'en' ? 'hi' : l === 'hi' ? 'mr' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-neon-green/10 text-emerald-700 dark:text-neon-green text-sm font-medium hover:bg-emerald-100 dark:hover:bg-neon-green/20 transition-colors border border-emerald-200 dark:border-neon-green/30"
          >
            <Languages size={16} />
            {lang.toUpperCase()}
          </button>
          <button 
            onClick={() => setView('settings')}
            className="p-2 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-neon-green hover:bg-slate-100 dark:hover:bg-neon-green/10 transition-colors border border-slate-200 dark:border-neon-green/30"
            title={t.settings}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {!user && view !== 'login' && view !== 'admin-login' ? (
            <motion.div
              key="redirect-login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-6"
            >
              <div className="bg-emerald-100 dark:bg-neon-green/10 p-6 rounded-full text-emerald-600 dark:text-neon-green">
                <User size={48} />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black dark:text-neon-green">Welcome to RDAGRO</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Please login to access your farm dashboard</p>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                  onClick={() => setView('login')}
                  className="w-full bg-neon-green text-black px-10 py-4 rounded-2xl font-black shadow-lg neon-bg active:scale-95 transition-all"
                >
                  Go to Login
                </button>
                <button 
                  onClick={() => {
                    setLoginForm({ email: '', password: '' });
                    setView('admin-login');
                  }}
                  className="w-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-neon-green px-10 py-4 rounded-2xl font-black border border-slate-200 dark:border-neon-green/30 active:scale-95 transition-all"
                >
                  Admin Portal
                </button>
              </div>
            </motion.div>
          ) : (
            <>
          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 py-10"
            >
              <div className="text-center space-y-2">
                <div className="bg-neon-green w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-lg neon-bg rotate-6 mb-4">
                  <Wheat className="text-black w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black dark:text-neon-green neon-text">{isSignUp ? "Create Account" : "Login"}</h2>
                <p className="text-slate-500 dark:text-slate-400">{isSignUp ? "Join the RDAGRO community" : "Access your RDAGRO account"}</p>
              </div>

              <form onSubmit={isSignUp ? handleRegister : handleLogin} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-neon-green/30 rounded-2xl p-4 focus:ring-2 focus:ring-neon-green outline-none dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="flex gap-2">
                        <input 
                          type="tel" 
                          required
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          placeholder="9876543210"
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-neon-green/30 rounded-2xl p-4 focus:ring-2 focus:ring-neon-green outline-none dark:text-white"
                        />
                        <button 
                          type="button"
                          onClick={handleSendOtp}
                          disabled={loading || otpVerified}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-neon-green px-4 rounded-2xl font-bold text-xs border border-slate-200 dark:border-neon-green/30 hover:bg-neon-green hover:text-black transition-all"
                        >
                          {otpSent ? "Resend" : "Send OTP"}
                        </button>
                      </div>
                    </div>
                    {otpSent && !otpVerified && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Enter OTP</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            required
                            value={registerForm.otp}
                            onChange={(e) => setRegisterForm({ ...registerForm, otp: e.target.value })}
                            placeholder="123456"
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-neon-green/30 rounded-2xl p-4 focus:ring-2 focus:ring-neon-green outline-none dark:text-white"
                          />
                          <button 
                            type="button"
                            onClick={handleVerifyOtp}
                            className="bg-neon-green text-black px-4 rounded-2xl font-bold text-xs shadow-lg neon-bg transition-all"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                    {otpVerified && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2 text-emerald-500 text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        OTP Verified Successfully
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">City / Location</label>
                      <input 
                        type="text" 
                        required
                        value={registerForm.location}
                        onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                        placeholder="Nashik, Maharashtra"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-neon-green/30 rounded-2xl p-4 focus:ring-2 focus:ring-neon-green outline-none dark:text-white"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={isSignUp ? registerForm.email : loginForm.email}
                    onChange={(e) => {
                      setLoginError('');
                      if (!successMessage?.startsWith('OTP_CODE:')) {
                        setSuccessMessage('');
                      }
                      isSignUp ? setRegisterForm({ ...registerForm, email: e.target.value }) : setLoginForm({ ...loginForm, email: e.target.value });
                    }}
                    placeholder="farmer@example.com"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-neon-green/30 rounded-2xl p-4 focus:ring-2 focus:ring-neon-green outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password" 
                    required
                    value={isSignUp ? registerForm.password : loginForm.password}
                    onChange={(e) => {
                      setLoginError('');
                      if (!successMessage?.startsWith('OTP_CODE:')) {
                        setSuccessMessage('');
                      }
                      isSignUp ? setRegisterForm({ ...registerForm, password: e.target.value }) : setLoginForm({ ...loginForm, password: e.target.value });
                    }}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-neon-green/30 rounded-2xl p-4 focus:ring-2 focus:ring-neon-green outline-none dark:text-white"
                  />
                </div>
                {loginError && <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>}
                {successMessage && !successMessage.startsWith('OTP_CODE:') && (
                  <p className="text-emerald-500 text-xs font-bold text-center">{successMessage}</p>
                )}
                {successMessage?.startsWith('OTP_CODE:') && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">Verification Code (Demo)</p>
                    <p className="text-lg font-black text-emerald-700 tracking-[0.5em]">{successMessage.split(':')[1]}</p>
                  </div>
                )}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neon-green text-black py-4 rounded-2xl font-black shadow-lg neon-bg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? "Sign Up" : "Sign In")}
                </button>
              </form>

              <div className="text-center">
                <button 
                  onClick={() => { setIsSignUp(!isSignUp); setLoginError(''); setSuccessMessage(''); }}
                  className="text-xs font-black text-neon-green uppercase tracking-widest hover:underline"
                >
                  {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                </button>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                <button 
                  onClick={() => {
                    setLoginForm({ email: '', password: '' });
                    setView('admin-login');
                  }}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-neon-green transition-colors"
                >
                  Access Admin Portal
                </button>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2 inline-block align-middle" />
                <button 
                  onClick={() => {
                    setFarmerPasswordInput('');
                    setLoginError('');
                    setView('farmer-login');
                  }}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-neon-green transition-colors"
                >
                  Farmer Portal
                </button>
              </div>
            </motion.div>
          )}

          {view === 'admin-login' && (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-md mx-auto space-y-8 py-20"
            >
              <div className="text-center space-y-4">
                <div className="bg-slate-900 w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-2xl border border-neon-green/30">
                  <Settings className="text-neon-green w-10 h-10 animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">ADMIN PORTAL</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Restricted access for RDAGRO administrators only</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-neon-green/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green via-emerald-500 to-neon-green"></div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Admin Identifier</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={loginForm.email}
                        onChange={(e) => {
                          setLoginError('');
                          setSuccessMessage('');
                          setLoginForm({ ...loginForm, email: e.target.value });
                        }}
                        placeholder="rupesh@rdgaro.com"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-neon-green outline-none dark:text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Security Key</label>
                    <div className="relative">
                      <Settings className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="password" 
                        required
                        value={loginForm.password}
                        onChange={(e) => {
                          setLoginError('');
                          setSuccessMessage('');
                          setLoginForm({ ...loginForm, password: e.target.value });
                        }}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-neon-green outline-none dark:text-white font-bold"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-500 text-xs font-bold text-center"
                    >
                      {loginError}
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 dark:bg-neon-green text-white dark:text-black py-5 rounded-2xl font-black shadow-xl hover:shadow-neon-green/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        <span>AUTHORIZE ACCESS</span>
                        <ChevronLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setView('login')}
                  className="flex items-center gap-2 mx-auto text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Return to Login
                </button>
              </div>
            </motion.div>
          )}

          {view === 'farmer-login' && (
            <motion.div
              key="farmer-login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-md mx-auto space-y-8 py-20"
            >
              <div className="text-center space-y-4">
                <div className="bg-emerald-600 w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-2xl border border-neon-green/30">
                  <Wheat className="text-white w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">FARMER PORTAL</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Enter your 10-digit Security Key to access the panel</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-neon-green/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-neon-green to-emerald-500"></div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (farmerPasswordInput === farmerPassword) {
                      if (user) {
                        handleRoleSwitch('farmer');
                      } else {
                        // Mock login as the seeded farmer
                        setUser({ id: 999, email: 'farmer@rdagro.com', role: 'farmer', name: 'RD Farmer' });
                        setView('farmer-panel');
                      }
                    } else {
                      setLoginError("Invalid Farmer Security Key. Default is 8999121363");
                    }
                  }} 
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Farmer Security Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="password" 
                        required
                        value={farmerPasswordInput}
                        onChange={(e) => {
                          setLoginError('');
                          setFarmerPasswordInput(e.target.value);
                        }}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-neon-green outline-none dark:text-white font-bold"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-500 text-xs font-bold text-center"
                    >
                      {loginError}
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 dark:bg-neon-green text-white dark:text-black py-5 rounded-2xl font-black shadow-xl hover:shadow-neon-green/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        <span>ACCESS PANEL</span>
                        <ChevronLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setView('login')}
                  className="flex items-center gap-2 mx-auto text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Return to Login
                </button>
              </div>
            </motion.div>
          )}

          {view === 'farmer-panel' && user?.role === 'farmer' && (
            <motion.div
              key="farmer-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black dark:text-neon-green neon-text">{t.farmerPanel}</h2>
                <div className="bg-neon-green/10 text-neon-green px-3 py-1 rounded-full text-[10px] font-black border border-neon-green/30">FARMER ACTIVE</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.myScans}</p>
                  <p className="text-3xl font-black dark:text-neon-green">{scanHistory.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.myListings}</p>
                  <p className="text-3xl font-black dark:text-neon-green">{farmerProducts.length}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-black text-sm uppercase tracking-widest mb-4 dark:text-slate-200">{t.recentScans}</h3>
                <div className="space-y-4">
                  {scanHistory.slice(0, 3).map((scan, idx) => (
                    <div key={`${scan.id}-${idx}`} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <img src={scan.image} className="w-10 h-10 rounded-lg object-cover" alt="Scan" />
                        <div>
                          <p className="font-bold text-sm dark:text-slate-200 truncate w-32">{scan.result.split('\n')[0]}</p>
                          <p className="text-[10px] text-slate-500">{scan.date}</p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          setLoading(true);
                          try {
                            // Simulate a small delay for better UX
                            await new Promise(resolve => setTimeout(resolve, 500));
                            setCapturedImage(scan.image);
                            setResult(scan.result);
                            setView('result');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="text-neon-green hover:underline text-[10px] font-black uppercase tracking-widest"
                      >
                        View
                      </button>
                    </div>
                  ))}
                  {scanHistory.length === 0 && (
                    <p className="text-center text-slate-400 text-xs py-4">No recent scans found</p>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-black text-sm uppercase tracking-widest mb-4 dark:text-slate-200">{t.myProducts}</h3>
                <div className="space-y-4">
                  {farmerProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 dark:bg-neon-green/10 p-2 rounded-xl text-emerald-600 dark:text-neon-green">
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-sm dark:text-slate-200">{product.name}</p>
                          <p className="text-[10px] text-slate-500">{product.price} • {product.category}{product.quantity && ` • Qty: ${product.quantity}`}</p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          setLoading(true);
                          try {
                            await new Promise(resolve => setTimeout(resolve, 600));
                            setFarmerProducts(prev => prev.filter(p => p.id !== product.id));
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="text-red-500 hover:text-red-600 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {farmerProducts.length === 0 && (
                    <p className="text-center text-slate-400 text-xs py-4">No products listed yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={18} className="text-neon-green" />
                  <h3 className="font-black text-sm uppercase tracking-widest dark:text-slate-200">Shop Settings</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Name</label>
                    <input 
                      type="text"
                      value={shopDetails.name}
                      onChange={(e) => setShopDetails({...shopDetails, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UPI ID (for QR Payments)</label>
                    <input 
                      type="text"
                      value={shopDetails.upiId}
                      onChange={(e) => setShopDetails({...shopDetails, upiId: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <input 
                      type="text"
                      value={shopDetails.phone}
                      onChange={(e) => setShopDetails({...shopDetails, phone: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Address</label>
                    <textarea 
                      value={shopDetails.address}
                      onChange={(e) => setShopDetails({...shopDetails, address: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Description</label>
                    <input 
                      type="text"
                      value={shopDetails.description}
                      onChange={(e) => setShopDetails({...shopDetails, description: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors"
                    />
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                          setSuccessMessage('Shop details updated successfully!');
                          setTimeout(() => setSuccessMessage(''), 3000);
                        }, 800);
                      }}
                      className="w-full bg-neon-green text-black py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all neon-bg uppercase tracking-widest text-xs"
                    >
                      Save Shop Details
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setView('shop-management')}
                  className="w-full bg-neon-green text-black py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 neon-bg uppercase tracking-widest text-xs"
                >
                  <ShoppingBag size={18} />
                  Manage My Shop
                </button>
                <button 
                  onClick={() => setIsAddProductOpen(true)}
                  className="w-full bg-emerald-600 dark:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  {t.addNewListing}
                </button>
                <button 
                  onClick={() => setView('home')}
                  className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          )}

          {view === 'shop-management' && user?.role === 'farmer' && (
            <motion.div
              key="shop-management"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <button onClick={() => setView('farmer-panel')} className="p-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                  <ChevronLeft size={20} className="dark:text-slate-200" />
                </button>
                <h2 className="text-xl font-bold dark:text-neon-green neon-text">Shop Management</h2>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-neon-green/10 p-2 rounded-xl text-neon-green">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest dark:text-slate-200">Shop Identity</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Configure how customers see your shop</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Name</label>
                    <input 
                      type="text"
                      value={shopDetails.name}
                      onChange={(e) => setShopDetails({...shopDetails, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors font-bold"
                      placeholder="e.g. Green Valley Agro"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Description</label>
                    <input 
                      type="text"
                      value={shopDetails.description}
                      onChange={(e) => setShopDetails({...shopDetails, description: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors"
                      placeholder="e.g. Best quality seeds in the region"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-neon-green/10 p-2 rounded-xl text-neon-green">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest dark:text-slate-200">Payment & Contact</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Set up your UPI and phone for orders</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UPI ID (for QR Payments)</label>
                    <input 
                      type="text"
                      value={shopDetails.upiId}
                      onChange={(e) => setShopDetails({...shopDetails, upiId: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors font-mono"
                      placeholder="yourname@upi"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <input 
                      type="text"
                      value={shopDetails.phone}
                      onChange={(e) => setShopDetails({...shopDetails, phone: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Address</label>
                    <textarea 
                      value={shopDetails.address}
                      onChange={(e) => setShopDetails({...shopDetails, address: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors min-h-[80px]"
                      placeholder="Full shop address..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="bg-neon-green/10 p-2 rounded-xl text-neon-green">
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-widest dark:text-slate-200">Inventory</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Manage your product listings</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAddProductOpen(true)}
                    className="p-2 bg-neon-green text-black rounded-xl shadow-sm active:scale-95 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  {farmerProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-neon-green/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-neon-green">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm dark:text-slate-200">{product.name}</p>
                          <p className="text-[10px] text-slate-500">{product.price} • {product.category}{product.quantity && ` • Qty: ${product.quantity}`}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setFarmerProducts(prev => prev.filter(p => p.id !== product.id))}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {farmerProducts.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                      <Package size={32} className="mx-auto text-slate-200 dark:text-slate-700 mb-2" />
                      <p className="text-xs text-slate-400 font-medium">No products listed yet</p>
                      <button 
                        onClick={() => setIsAddProductOpen(true)}
                        className="mt-3 text-neon-green text-[10px] font-black uppercase tracking-widest hover:underline"
                      >
                        Add your first product
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      setSuccessMessage('Shop details updated successfully!');
                      setTimeout(() => setSuccessMessage(''), 3000);
                      setView('farmer-panel');
                    }, 1000);
                  }}
                  className="w-full bg-neon-green text-black py-5 rounded-3xl font-black shadow-lg shadow-neon-green/20 active:scale-95 transition-all neon-bg uppercase tracking-widest text-xs"
                >
                  Save & Publish Shop
                </button>
              </div>
            </motion.div>
          )}

          {view === 'admin' && user?.role === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black dark:text-neon-green neon-text">Admin Panel</h2>
                <div className="bg-neon-green/10 text-neon-green px-3 py-1 rounded-full text-[10px] font-black border border-neon-green/30">SYSTEM ACTIVE</div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setAdminCredentials({ email: user?.email || '', password: '' });
                    setIsAdminSettingsOpen(true);
                  }}
                  className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center gap-2 font-bold text-sm dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings size={18} className="text-emerald-600 dark:text-neon-green" />
                  {t.adminSettings}
                </button>
              </div>

              {adminStats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Scans</p>
                    <p className="text-3xl font-black dark:text-neon-green">{adminStats.totalScans}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Farmers</p>
                    <p className="text-3xl font-black dark:text-neon-green">{adminStats.totalFarmers}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Customers</p>
                    <p className="text-3xl font-black dark:text-neon-green">{adminStats.totalCustomers}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-neon-green" /></div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-black text-sm uppercase tracking-widest mb-4 dark:text-slate-200">Recent Users</h3>
                <div className="space-y-4">
                  {adminStats?.recentUsers.map((u: any, idx: number) => (
                    <div key={`${u.id}-${u.email}-${idx}`} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-xl",
                          u.role === 'farmer' ? "bg-emerald-100 dark:bg-neon-green/10 text-emerald-600 dark:text-neon-green" : "bg-blue-100 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
                        )}>
                          {u.role === 'farmer' ? <User size={16} /> : <UserCheck size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm dark:text-slate-200">{u.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-slate-500">{u.email}</p>
                            <span className={cn(
                              "text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter",
                              u.role === 'farmer' ? "bg-neon-green/10 text-neon-green border border-neon-green/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            )}>
                              {u.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold">{new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={downloadCustomerData}
                  disabled={loading}
                  className="w-full bg-emerald-600 dark:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <FileDown size={20} />}
                  Customer Info (XL)
                </button>

                <button 
                  onClick={downloadScanData}
                  disabled={loading}
                  className="w-full bg-blue-600 dark:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <FileDown size={20} />}
                  Scan History (XL)
                </button>
              </div>

              <button 
                onClick={() => setView('home')}
                className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all"
              >
                Switch to Farmer View
              </button>
            </motion.div>
          )}

          <AnimatePresence>
            {isAdminSettingsOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsAdminSettingsOpen(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-neon-green" />
                  
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black dark:text-neon-green neon-text">{t.adminSettings}</h2>
                    <button 
                      onClick={() => setIsAdminSettingsOpen(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                      <X size={24} className="dark:text-slate-400" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateAdminCredentials} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.adminEmail}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          type="email"
                          value={adminCredentials.email}
                          onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-neon-green rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold dark:text-white"
                          placeholder="rupesh@rdgaro.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.adminPassword}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          type="password"
                          value={adminCredentials.password}
                          onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-neon-green rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold dark:text-white"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Farmer Security Key</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          type="text"
                          value={farmerPassword}
                          onChange={(e) => setFarmerPassword(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-neon-green rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold dark:text-white"
                          placeholder="8999121363"
                          required
                        />
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium ml-1 italic">This key is required for users to access the Farmer Portal.</p>
                    </div>

                    {(loginError || successMessage) && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-4 rounded-2xl text-sm font-bold text-center",
                          loginError ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        )}
                      >
                        {loginError || successMessage}
                      </motion.div>
                    )}

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 dark:bg-neon-green dark:text-black text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-neon-green/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <Settings size={20} />}
                      {t.updateCredentials}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {view === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <button onClick={() => setView('home')} className="p-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                  <ChevronLeft size={20} className="dark:text-slate-200" />
                </button>
                <h2 className="text-xl font-bold dark:text-neon-green neon-text">Order History</h2>
              </div>

              {orderHistory.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Package size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-500 font-bold">No orders yet</p>
                  <button onClick={() => setView('shop')} className="mt-4 text-neon-green font-black uppercase tracking-widest text-xs">Start Shopping</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-3">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                          <p className="font-bold text-xs dark:text-slate-200">#{order.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                          <p className="font-bold text-xs dark:text-slate-200">{order.date}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={`${order.id}-item-${idx}`} className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">{item.product.name} x{item.quantity}</span>
                            <span className="font-bold dark:text-slate-200">{item.product.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                        <span className="font-black text-xs uppercase tracking-widest text-slate-400">Total Paid</span>
                        <span className="font-black text-lg text-emerald-600 dark:text-neon-green">₹{order.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Hero Card */}
              <div className="relative overflow-hidden rounded-3xl bg-black text-white shadow-xl shadow-neon-green/10 min-h-[180px] flex items-center border border-neon-green/20">
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" 
                  alt="Farm" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                  <div className="relative z-10 p-6 w-full">
                    <h2 className="text-3xl font-black mb-1 tracking-tighter italic neon-text">RD<span className="text-white">AGRO</span></h2>
                    <p className="text-neon-green/80 text-xs font-bold uppercase tracking-[0.2em] mb-6">{t.subtitle}</p>
                    <div className="flex gap-3">
                      {user?.role === 'farmer' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={startCamera}
                            className="bg-neon-green hover:bg-neon-green/80 text-black px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all neon-bg"
                          >
                            <Camera size={20} />
                            {t.detectDisease}
                          </button>
                          <button 
                            onClick={() => setView('farmer-panel')}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 border border-white/20 active:scale-95 transition-all backdrop-blur-md"
                          >
                            <Package size={20} />
                            Panel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setView('shop')}
                          className="bg-neon-green hover:bg-neon-green/80 text-black px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all neon-bg"
                        >
                          <ShoppingBag size={20} />
                          {t.shop}
                        </button>
                      )}
                    </div>
                  </div>
              </div>

              {/* Scan Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group cursor-pointer"
                onClick={startCamera}
              >
                <div className="absolute inset-0 bg-neon-green/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white dark:bg-slate-900 border border-emerald-100 dark:border-neon-green/30 rounded-2xl p-4 flex items-center gap-4 shadow-sm group-hover:border-neon-green transition-all">
                  <div className="bg-neon-green/10 p-2 rounded-xl text-neon-green">
                    <Camera size={20} />
                  </div>
                  <span className="text-sm text-slate-400 dark:text-slate-500 font-medium flex-1">{t.scanCropPlaceholder}</span>
                  <div className="bg-neon-green text-black p-2 rounded-xl shadow-lg shadow-neon-green/20">
                    <Search size={16} />
                  </div>
                </div>
              </motion.div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium mt-[-8px]">
                Tip: For best results, take a clear, close-up photo in good lighting.
              </p>

              {/* Live Weather Card */}
              {weather && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-black rounded-3xl p-5 border border-emerald-100 dark:border-neon-green/30 shadow-sm flex items-center justify-between neon-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-100 dark:bg-neon-green/10 p-3 rounded-2xl text-orange-600 dark:text-neon-green">
                      <Sun size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.weather}</p>
                      <h3 className="text-2xl font-black dark:text-neon-green">{weather.temp}°C</h3>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-blue-500 dark:text-neon-green/80 mb-1">
                        <Droplets size={14} />
                        <span className="text-xs font-bold">{weather.humidity}%</span>
                      </div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">{t.humidity}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-neon-green/80 mb-1">
                        <Wind size={14} />
                        <span className="text-xs font-bold">{weather.wind} km/h</span>
                      </div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">{t.windSpeed}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={fetchTips}
                  disabled={loading}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-3 hover:bg-emerald-50 dark:hover:bg-slate-800/50 transition-colors active:scale-95 disabled:opacity-50"
                >
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl text-orange-600 dark:text-orange-400">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CloudSun size={24} />}
                  </div>
                  <span className="font-bold text-sm dark:text-slate-200">{t.weatherTips}</span>
                </button>
                
                <button 
                  onClick={generatePaymentQr}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-3 hover:bg-emerald-50 dark:hover:bg-slate-800/50 transition-colors active:scale-95"
                >
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl text-emerald-600 dark:text-emerald-400">
                    <QrCode size={24} />
                  </div>
                  <span className="font-bold text-sm dark:text-slate-200">{t.paymentQr || 'Payment QR'}</span>
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-3 hover:bg-emerald-50 dark:hover:bg-slate-800/50 transition-colors active:scale-95"
                >
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600 dark:text-blue-400">
                    <Upload size={24} />
                  </div>
                  <span className="font-bold text-sm dark:text-slate-200">{t.uploadImage}</span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                  />
                </button>

                <button 
                  onClick={() => setView('rates')}
                  className="bg-white dark:bg-black p-5 rounded-3xl border border-emerald-100 dark:border-neon-green/30 shadow-sm flex flex-col items-center text-center gap-3 hover:bg-emerald-50 dark:hover:bg-neon-green/10 transition-colors active:scale-95 neon-border"
                >
                  <div className="bg-emerald-100 dark:bg-neon-green/10 p-3 rounded-2xl text-emerald-600 dark:text-neon-green">
                    <IndianRupee size={24} />
                  </div>
                  <span className="font-bold text-sm dark:text-slate-200">{t.cropRates}</span>
                </button>

                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="bg-white dark:bg-black p-5 rounded-3xl border border-emerald-100 dark:border-neon-green/30 shadow-sm flex flex-col items-center text-center gap-3 hover:bg-emerald-50 dark:hover:bg-neon-green/10 transition-colors active:scale-95 neon-border"
                >
                  <div className="bg-purple-100 dark:bg-neon-green/10 p-3 rounded-2xl text-purple-600 dark:text-neon-green">
                    <MessageCircle size={24} />
                  </div>
                  <span className="font-bold text-sm dark:text-slate-200">{t.chat}</span>
                </button>

                <button 
                  onClick={fetchNews}
                  className="bg-white dark:bg-black p-5 rounded-3xl border border-emerald-100 dark:border-neon-green/30 shadow-sm flex flex-col items-center text-center gap-3 hover:bg-emerald-50 dark:hover:bg-neon-green/10 transition-colors active:scale-95 neon-border"
                >
                  <div className="bg-purple-100 dark:bg-neon-green/10 p-3 rounded-2xl text-purple-600 dark:text-neon-green">
                    <Newspaper size={24} />
                  </div>
                  <span className="font-bold text-sm dark:text-slate-200">{t.agroNews}</span>
                </button>

                <button 
                  onClick={() => setView('shop')}
                  className="bg-white dark:bg-black p-5 rounded-3xl border border-emerald-100 dark:border-neon-green/30 shadow-sm flex flex-col items-center text-center gap-3 hover:bg-emerald-50 dark:hover:bg-neon-green/10 transition-colors active:scale-95 neon-border"
                >
                  <div className="bg-amber-100 dark:bg-neon-green/10 p-3 rounded-2xl text-amber-600 dark:text-neon-green">
                    <ShoppingBag size={24} />
                  </div>
                  <span className="font-bold text-sm dark:text-slate-200">{t.shop}</span>
                </button>
              </div>

              {/* AI Chat Button */}
              <button 
                onClick={() => setView('chat')}
                className="w-full bg-white dark:bg-slate-900 p-4 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:bg-emerald-50 dark:hover:bg-slate-800/50 transition-colors active:scale-95"
              >
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl text-emerald-600 dark:text-emerald-400">
                  <MessageCircle size={24} />
                </div>
                <div className="text-left">
                  <span className="font-bold block dark:text-slate-200">{t.chat}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t.aiSuggestions}</span>
                </div>
              </button>

              {/* Info Section */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-emerald-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl text-emerald-700 dark:text-emerald-400">
                    <Info size={20} />
                  </div>
                  <h3 className="font-bold dark:text-slate-200">{t.weatherTitle}</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                      <Bell size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.notifications}</p>
                      <p className="font-bold dark:text-slate-200">{notificationsEnabled ? "Enabled" : "Disabled"}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setView('settings')}
                    className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 active:scale-95 transition-transform"
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <ThermometerSun className="text-orange-500" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.temperature}</p>
                        <p className="font-bold dark:text-slate-200">{weather ? `${weather.temp}°C` : "Loading..."}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.humidity}</p>
                      <p className="font-bold dark:text-slate-200">{weather ? `${weather.humidity}%` : "--"}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    "Great day for harvesting wheat. Ensure proper irrigation for young saplings."
                  </p>
                </div>
              </div>

              {/* Recent Scans History */}
              {scanHistory.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t.history}</h3>
                    <button 
                      onClick={() => setScanHistory([])}
                      className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 px-1 snap-x no-scrollbar">
                    {scanHistory.map((scan) => (
                      <motion.button
                        key={scan.id}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCapturedImage(scan.image);
                          setResult(scan.result);
                          setView('result');
                        }}
                        className="flex-shrink-0 w-32 snap-start group"
                      >
                        <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white dark:border-neon-green/30 shadow-md mb-2">
                          <img src={scan.image} alt="Scan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-[8px] text-white font-bold truncate">{scan.date}</span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-neon-green/70 truncate text-center">{scan.date.split(',')[0]}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'detect' && (
            <motion.div 
              key="detect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[100] flex flex-col"
            >
              <div className="p-4 flex items-center justify-between text-white">
                <button onClick={() => { stopCamera(); setView('home'); }} className="p-2 bg-white/10 rounded-full border border-white/20">
                  <ChevronLeft size={24} />
                </button>
                <span className="font-black tracking-widest neon-text">{t.takePhoto}</span>
                <div className="w-10" />
              </div>
              
              <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                  <div className="w-full h-full border-2 border-white/50 rounded-2xl" />
                </div>
              </div>

              <div className="p-8 flex justify-center bg-black">
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform"
                >
                  <div className="w-16 h-16 rounded-full bg-white" />
                </button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </motion.div>
          )}

          {view === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => setView('home')} className="p-2 bg-white dark:bg-slate-800 rounded-full border border-emerald-100 dark:border-slate-800 shadow-sm">
                    <ChevronLeft size={20} className="dark:text-slate-200" />
                  </button>
                  <h2 className="text-xl font-bold dark:text-slate-200">{t.resultTitle}</h2>
                </div>
                {!loading && result && (
                  <button 
                    onClick={() => handleShare(result)}
                    className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-sm active:scale-90 transition-transform"
                  >
                    <Share size={20} />
                  </button>
                )}
              </div>

              {capturedImage && (
                <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white dark:border-slate-800">
                  <img src={capturedImage} alt="Captured crop" className="w-full h-48 object-cover" />
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-100 dark:border-slate-800 shadow-sm min-h-[300px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium animate-pulse">{t.analyzing}</p>
                  </div>
                ) : (
                  <div className="prose prose-emerald dark:prose-invert max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]}>{result || ""}</Markdown>
                  </div>
                )}
                {!loading && result && <FeedbackButtons />}
              </div>

              {!loading && (
                <button 
                  onClick={() => setView('home')}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-transform"
                >
                  {t.back}
                </button>
              )}
            </motion.div>
          )}

          {view === 'tips' && (
            <motion.div 
              key="tips"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => setView('home')} className="p-2 bg-white dark:bg-slate-800 rounded-full border border-emerald-100 dark:border-slate-800 shadow-sm">
                    <ChevronLeft size={20} className="dark:text-slate-200" />
                  </button>
                  <h2 className="text-xl font-bold dark:text-slate-200">{t.weatherTips}</h2>
                </div>
                {!loading && tips && (
                  <button 
                    onClick={() => handleShare(tips)}
                    className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-sm active:scale-90 transition-transform"
                  >
                    <Share size={20} />
                  </button>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-100 dark:border-slate-800 shadow-sm min-h-[300px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium animate-pulse">Fetching expert advice...</p>
                  </div>
                ) : (
                  <div className="prose prose-emerald dark:prose-invert max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]}>{tips || ""}</Markdown>
                  </div>
                )}
                {!loading && tips && <FeedbackButtons />}
              </div>

              {!loading && (
                <button 
                  onClick={() => setView('home')}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-transform"
                >
                  {t.back}
                </button>
              )}
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <button onClick={() => setView('home')} className="p-2 bg-white dark:bg-black rounded-full border border-emerald-100 dark:border-neon-green/30 shadow-sm">
                  <ChevronLeft size={20} className="dark:text-neon-green" />
                </button>
                <h2 className="text-xl font-bold dark:text-neon-green neon-text">{t.settings}</h2>
              </div>

              <div className="bg-white dark:bg-black rounded-3xl p-6 border border-emerald-100 dark:border-neon-green/30 shadow-sm space-y-6 neon-border">
                {/* Profile Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.profile}</h3>
                    <button 
                      onClick={() => setIsProfileEditOpen(true)}
                      className="p-2 bg-emerald-50 dark:bg-neon-green/10 text-emerald-600 dark:text-neon-green rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-neon-green/10">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-neon-green/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-neon-green">
                        <User size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold dark:text-white">{userProfile.name}</p>
                          <span className="text-[10px] font-black px-2 py-0.5 bg-neon-green text-black rounded-lg uppercase tracking-wider">
                            {user?.role === 'farmer' ? t.farmer : user?.role === 'customer' ? t.customer : 'Admin'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{userProfile.contact}</p>
                      </div>
                    </div>
                </div>

                {user?.role === 'farmer' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Shop Management</h3>
                    <button 
                      onClick={() => setView('farmer-panel')}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-neon-green/10 hover:border-neon-green transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-neon-green/10 text-neon-green rounded-xl group-hover:bg-neon-green group-hover:text-black transition-all">
                          <ShoppingBag size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold dark:text-white">Shop Settings</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Manage your shop name, UPI, and address</p>
                        </div>
                      </div>
                      <ChevronLeft size={18} className="rotate-180 text-slate-400" />
                    </button>
                  </div>
                )}

                {/* My Crops Section */}
                {user?.role === 'farmer' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.myCrops}</h3>
                      <button 
                        onClick={() => setIsAddCropOpen(true)}
                        className="p-2 bg-emerald-50 dark:bg-neon-green/10 text-emerald-600 dark:text-neon-green rounded-xl hover:bg-emerald-100 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {userProfile.crops && userProfile.crops.length > 0 ? (
                        userProfile.crops.map((crop: any) => (
                          <div key={crop.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-neon-green/10">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-neon-green/20 text-emerald-600 dark:text-neon-green rounded-lg">
                                  <Sprout size={18} />
                                </div>
                                <div>
                                  <p className="font-bold text-sm dark:text-slate-200">{crop.name}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{crop.type}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider",
                                  crop.status === 'Growing' ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" :
                                  crop.status === 'Harvested' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                  "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                                )}>
                                  {crop.status === 'Growing' ? t.growing : crop.status === 'Harvested' ? t.harvested : t.failed}
                                </span>
                                <button 
                                  onClick={() => {
                                    setUserProfile(prev => ({ 
                                      ...prev, 
                                      crops: prev.crops.filter((c: any) => c.id !== crop.id) 
                                    }));
                                  }}
                                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-2 pt-3 border-t border-slate-100 dark:border-white/5">
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">{t.plantingDate}</p>
                                <p className="text-xs font-bold dark:text-slate-300">{crop.plantingDate || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">{t.harvestDate}</p>
                                <p className="text-xs font-bold dark:text-slate-300">{crop.harvestDate || '-'}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center border border-dashed border-slate-200 dark:border-neon-green/20 rounded-2xl">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No crops added yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Past Queries Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.pastQueries}</h3>
                    {userProfile.chatHistory && userProfile.chatHistory.length > 0 && (
                      <button 
                        onClick={() => setUserProfile(prev => ({ ...prev, chatHistory: [] }))}
                        className="text-[10px] font-black text-red-500 uppercase tracking-wider hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {userProfile.chatHistory && userProfile.chatHistory.length > 0 ? (
                      userProfile.chatHistory.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-neon-green/10">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle size={14} className="text-emerald-600 dark:text-neon-green" />
                            <p className="text-xs font-bold dark:text-slate-200 line-clamp-1">{item.query}</p>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                            {item.response}
                          </p>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                            <button 
                              onClick={() => {
                                setChatMessages([{ id: 'history-user', role: 'user', content: item.query }, { id: 'history-ai', role: 'ai', content: item.response }]);
                                setView('chat');
                              }}
                              className="text-[9px] font-black text-emerald-600 dark:text-neon-green uppercase tracking-wider hover:underline"
                            >
                              View Full Chat
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center border border-dashed border-slate-200 dark:border-neon-green/20 rounded-2xl">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.noPastQueries}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.preferences}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-neon-green/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-neon-green/10 text-emerald-600 dark:text-neon-green rounded-lg">
                          <Wheat size={18} />
                        </div>
                        <span className="text-sm font-bold dark:text-slate-200">{t.organicFarming}</span>
                      </div>
                      <button 
                        onClick={() => setUserProfile(prev => ({ 
                          ...prev, 
                          preferences: { 
                            ...(prev.preferences || { organic: false, pestAlerts: true, marketUpdates: true }), 
                            organic: !(prev.preferences?.organic ?? false) 
                          } 
                        }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          userProfile.preferences?.organic ? "bg-neon-green" : "bg-slate-300 dark:bg-slate-700"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          userProfile.preferences?.organic ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-neon-green/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                          <ShieldAlert size={18} />
                        </div>
                        <span className="text-sm font-bold dark:text-slate-200">{t.pestAlerts}</span>
                      </div>
                      <button 
                        onClick={() => setUserProfile(prev => ({ 
                          ...prev, 
                          preferences: { 
                            ...(prev.preferences || { organic: false, pestAlerts: true, marketUpdates: true }), 
                            pestAlerts: !(prev.preferences?.pestAlerts ?? true) 
                          } 
                        }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          userProfile.preferences?.pestAlerts ? "bg-neon-green" : "bg-slate-300 dark:bg-slate-700"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          userProfile.preferences?.pestAlerts ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-neon-green/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                          <TrendingUp size={18} />
                        </div>
                        <span className="text-sm font-bold dark:text-slate-200">{t.marketUpdates}</span>
                      </div>
                      <button 
                        onClick={() => setUserProfile(prev => ({ 
                          ...prev, 
                          preferences: { 
                            ...(prev.preferences || { organic: false, pestAlerts: true, marketUpdates: true }), 
                            marketUpdates: !(prev.preferences?.marketUpdates ?? true) 
                          } 
                        }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          userProfile.preferences?.marketUpdates ? "bg-neon-green" : "bg-slate-300 dark:bg-slate-700"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          userProfile.preferences?.marketUpdates ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order History */}
                <button 
                  onClick={() => setView('orders')}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-neon-green/10 hover:bg-slate-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                      <History size={18} />
                    </div>
                    <span className="font-bold text-sm dark:text-slate-200">{t.orderHistory}</span>
                  </div>
                  <ChevronLeft size={18} className="rotate-180 text-slate-400" />
                </button>

                {/* Language Selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.selectLanguage}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(['en', 'hi', 'mr'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={cn(
                          "py-3 rounded-xl text-xs font-bold transition-all border",
                          lang === l 
                            ? "bg-neon-green border-neon-green text-black shadow-lg neon-bg" 
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-neon-green/20 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'मराठी'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Preferences</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-neon-green/10">
                      <div className="flex items-center gap-3">
                        <Bell size={18} className="text-emerald-600 dark:text-neon-green" />
                        <span className="text-sm font-bold dark:text-slate-200">{t.notifications}</span>
                      </div>
                      <button 
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          notificationsEnabled ? "bg-neon-green" : "bg-slate-300 dark:bg-slate-700"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          notificationsEnabled ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-neon-green/10">
                      <div className="flex items-center gap-3">
                        {darkMode ? <Moon size={18} className="text-neon-green" /> : <Sun size={18} className="text-amber-500" />}
                        <span className="text-sm font-bold dark:text-slate-200">{t.darkMode}</span>
                      </div>
                      <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          darkMode ? "bg-neon-green" : "bg-slate-300 dark:bg-slate-700"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          darkMode ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Type Switching */}
                {user && user.role !== 'admin' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.accountType}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleRoleSwitch('customer')}
                        className={cn(
                          "py-3 rounded-xl text-xs font-bold transition-all border",
                          user.role === 'customer' 
                            ? "bg-neon-green border-neon-green text-black shadow-lg neon-bg" 
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-neon-green/20 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {t.customer}
                      </button>
                      <button
                        onClick={() => handleRoleSwitch('farmer')}
                        className={cn(
                          "py-3 rounded-xl text-xs font-bold transition-all border",
                          user.role === 'farmer' 
                            ? "bg-neon-green border-neon-green text-black shadow-lg neon-bg" 
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-neon-green/20 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {t.farmer}
                      </button>
                    </div>
                    {successMessage && view === 'settings' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-emerald-50 dark:bg-neon-green/10 border border-emerald-100 dark:border-neon-green/20 rounded-xl text-emerald-600 dark:text-neon-green text-[10px] font-bold text-center"
                      >
                        {successMessage}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Admin Settings (Conditional) */}
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => setIsAdminSettingsOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl border border-neon-green/30 hover:bg-black transition-all shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Lock size={18} className="text-neon-green" />
                      <span className="font-bold text-sm text-neon-green tracking-widest uppercase">{t.adminSettings}</span>
                    </div>
                    <ChevronLeft size={18} className="rotate-180 text-neon-green" />
                  </button>
                )}

                {/* Feedback & Support */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Support</h3>
                  <button 
                    onClick={() => setView('feedback')}
                    className="w-full flex items-center justify-between p-4 bg-emerald-50 dark:bg-neon-green/5 rounded-2xl border border-emerald-100 dark:border-neon-green/10 text-emerald-700 dark:text-neon-green hover:bg-emerald-100 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} />
                      <span className="font-bold text-sm">{t.feedback}</span>
                    </div>
                    <ChevronLeft size={18} className="rotate-180" />
                  </button>
                </div>

                {/* App Info */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">RDAGRO v2.4.0</p>
                    <p className="text-[9px] text-slate-400 font-medium">© 2026 RD Digital Solutions. All rights reserved.</p>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/20 font-black text-sm uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    {t.logout}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setView('home')}
                className="w-full bg-neon-green text-black py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-transform neon-bg"
              >
                {t.back}
              </button>
            </motion.div>
          )}

          {view === 'rates' && (
            <motion.div 
              key="rates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <button onClick={() => setView('home')} className="p-2 bg-white dark:bg-black rounded-full border border-emerald-100 dark:border-neon-green/30 shadow-sm">
                  <ChevronLeft size={20} className="dark:text-neon-green" />
                </button>
                <h2 className="text-xl font-bold dark:text-neon-green neon-text">{t.cropRates}</h2>
              </div>

              <div className="bg-white dark:bg-black rounded-3xl p-6 border border-emerald-100 dark:border-neon-green/30 shadow-sm space-y-4 neon-border">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 dark:text-neon-green/70 uppercase tracking-wider">{t.selectState}</label>
                  <select 
                    value={selectedState} 
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-neon-green/20 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green dark:text-slate-200"
                  >
                    <option value="">-- {t.selectState} --</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 dark:text-neon-green/70 uppercase tracking-wider">{t.selectCity}</label>
                  <input 
                    type="text"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder={t.enterCity}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-neon-green/20 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green dark:text-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 dark:text-neon-green/70 uppercase tracking-wider">{t.selectCrop}</label>
                  <select 
                    value={selectedCrop} 
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-neon-green/20 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green dark:text-slate-200"
                  >
                    <option value="">-- {t.selectCrop} --</option>
                    {COMMON_CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={fetchRates}
                    disabled={!selectedState || !selectedCrop || !selectedCity || loading}
                    className="bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <TrendingUp size={20} />}
                    {t.cropRates}
                  </button>
                  <button 
                    onClick={fetchHistoricalRates}
                    disabled={!selectedState || !selectedCrop || !selectedCity || loadingGraph}
                    className="bg-neon-green disabled:bg-slate-300 dark:disabled:bg-slate-800 text-black py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 neon-bg"
                  >
                    {loadingGraph ? <Loader2 className="animate-spin" size={20} /> : <TrendingUp size={20} />}
                    {t.dailyRateGraph}
                  </button>
                </div>
              </div>

              {showRateGraph && (
                <div className="bg-white dark:bg-black rounded-3xl p-6 border border-emerald-100 dark:border-neon-green/30 shadow-sm neon-border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold dark:text-neon-green">{t.dailyRateGraph}</h3>
                    <button 
                      onClick={() => setShowRateGraph(false)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                      <X size={20} className="dark:text-neon-green" />
                    </button>
                  </div>
                  <RateGraph />
                </div>
              )}

              {cropRatesData && (
                <div className="bg-white dark:bg-black rounded-3xl p-6 border border-emerald-100 dark:border-neon-green/30 shadow-sm min-h-[200px] neon-border">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <TrendingUp size={20} className="text-emerald-600 dark:text-neon-green" />
                    <h3 className="font-bold dark:text-neon-green">Market Report: {selectedCrop}</h3>
                  </div>
                  <div className="prose prose-emerald dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-neon-green/10 overflow-x-auto">
                    <Markdown remarkPlugins={[remarkGfm]}>{cropRatesData}</Markdown>
                  </div>
                  <FeedbackButtons />
                </div>
              )}
            </motion.div>
          )}

          {view === 'news' && (
            <motion.div 
              key="news"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pb-20"
            >
              <div className="flex items-center gap-3">
                <button onClick={() => setView('home')} className="p-2 bg-white dark:bg-black rounded-full border border-emerald-100 dark:border-neon-green/30 shadow-sm">
                  <ChevronLeft size={20} className="dark:text-neon-green" />
                </button>
                <h2 className="text-xl font-bold dark:text-neon-green neon-text">{t.agroNews}</h2>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white dark:bg-black rounded-[40px] border border-emerald-100 dark:border-neon-green/30 neon-border">
                    <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Fetching Latest News</p>
                  </div>
                ) : newsItems.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-black rounded-[40px] border border-dashed border-slate-200 dark:border-neon-green/20 neon-border">
                    <Newspaper size={48} className="mx-auto text-slate-200 dark:text-neon-green/10 mb-4" />
                    <p className="text-slate-500 dark:text-neon-green/60 font-bold">No news available at the moment.</p>
                    <button onClick={fetchNews} className="mt-4 text-neon-green font-black uppercase tracking-widest text-xs">Try Refreshing</button>
                  </div>
                ) : (
                  newsItems.map((news, idx) => (
                    <motion.div 
                      key={`${news.url}-${idx}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white dark:bg-black p-6 rounded-[32px] border border-emerald-100 dark:border-neon-green/30 shadow-sm hover:shadow-xl transition-all group neon-border"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black px-3 py-1 bg-emerald-50 dark:bg-neon-green/10 text-emerald-600 dark:text-neon-green rounded-full uppercase tracking-widest">
                          {news.source}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {news.date}
                        </span>
                      </div>
                      <h3 className="text-lg font-black dark:text-white mb-2 leading-tight group-hover:text-neon-green transition-colors">{news.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{news.summary}</p>
                      <a 
                        href={news.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-neon-green font-black uppercase tracking-widest text-xs hover:underline"
                      >
                        {t.readMore}
                        <ChevronLeft size={14} className="rotate-180" />
                      </a>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {view === 'shop' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pb-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setView('home')} className="p-2 bg-white dark:bg-slate-900 rounded-full border border-emerald-100 dark:border-slate-800 shadow-sm">
                    <ChevronLeft size={20} className="dark:text-slate-200" />
                  </button>
                  <h2 className="text-xl font-bold dark:text-neon-green neon-text">{t.shop}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={generatePaymentQr}
                    className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-neon-green shadow-sm text-emerald-600 dark:text-neon-green"
                  >
                    <QrCode size={20} />
                  </button>
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-3 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-neon-green shadow-sm text-emerald-600 dark:text-neon-green"
                  >
                    <ShoppingCart size={20} />
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                        {cart.reduce((acc, item) => acc + item.quantity, 0)}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {user?.role === 'farmer' && (
                <div className="bg-emerald-600 dark:bg-emerald-700 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between group cursor-pointer active:scale-95 transition-all" onClick={() => setIsAddProductOpen(true)}>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Sell Your Products</h3>
                    <p className="text-xs opacity-80 font-medium">Add new items to your shop listing</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl group-hover:bg-white/30 transition-all">
                    <Plus size={24} />
                  </div>
                </div>
              )}

              {/* Shop Info Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-emerald-100 dark:border-neon-green/30 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-neon-green/10 transition-all" />
                <div className="relative flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black dark:text-white tracking-tight">{shopDetails.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{shopDetails.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <MapPin size={12} className="text-neon-green" />
                        {shopDetails.address.split(',')[0]}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <IndianRupee size={12} className="text-neon-green" />
                        UPI: {shopDetails.upiId}
                      </div>
                    </div>
                    <div className="pt-3">
                      <a 
                        href={`tel:${shopDetails.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-neon-green hover:text-black transition-all"
                      >
                        <Phone size={12} />
                        Call Shop
                      </a>
                    </div>
                  </div>
                  {user?.role === 'farmer' && (
                    <button 
                      onClick={() => setView('farmer-panel')}
                      className="p-2 bg-neon-green/10 text-neon-green rounded-xl hover:bg-neon-green/20 transition-all active:scale-95"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-neon-green rounded-2xl py-3 pl-12 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green dark:text-slate-200 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-neon-green"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Category Tabs */}
              <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-emerald-100 dark:border-neon-green shadow-sm overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setShopCategory('seeds')}
                  className={cn(
                    "flex-1 min-w-[100px] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                    shopCategory === 'seeds' ? "bg-neon-green text-black shadow-lg neon-bg" : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  <Wheat size={18} />
                  {t.seeds}
                </button>
                <button 
                  onClick={() => setShopCategory('pesticides')}
                  className={cn(
                    "flex-1 min-w-[100px] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                    shopCategory === 'pesticides' ? "bg-neon-green text-black shadow-lg neon-bg" : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  <Package size={18} />
                  {t.pesticides}
                </button>
                <button 
                  onClick={() => setShopCategory('produce' as any)}
                  className={cn(
                    "flex-1 min-w-[100px] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                    shopCategory === ('produce' as any) ? "bg-neon-green text-black shadow-lg neon-bg" : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  <Sprout size={18} />
                  Produce
                </button>
                <button 
                  onClick={() => setShopCategory('dealers')}
                  className={cn(
                    "flex-1 min-w-[100px] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                    shopCategory === 'dealers' ? "bg-neon-green text-black shadow-lg neon-bg" : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  <MapPin size={18} />
                  {t.localDealers}
                </button>
              </div>

              {/* District Filter for Dealers */}
              {shopCategory === 'dealers' && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {(['all', 'yavatmal', 'wardha', 'amravati', 'pune', 'nagpur', 'nashik', 'sambhajinagar', 'jalgaon', 'solapur', 'kolhapur', 'ahmednagar', 'buldhana', 'akola'] as const).map((dist) => (
                    <button
                      key={dist}
                      onClick={() => setSelectedDistrict(dist)}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                        selectedDistrict === dist 
                          ? "bg-neon-green text-black border-neon-green shadow-md" 
                          : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-emerald-100 dark:border-slate-800"
                      )}
                    >
                      {dist === 'all' ? 'All Districts' : t[dist as keyof Translation]}
                    </button>
                  ))}
                </div>
              )}

              {/* Product Grid */}
              <div className="grid grid-cols-2 gap-4">
                {(() => {
                  const allSeeds = [
                    ...PRODUCTS.seeds.map(p => ({ ...p, type: 'seeds' as const })),
                    ...farmerProducts.filter(p => p.category === 'seeds').map(p => ({ ...p, type: 'seeds' as const, isFarmerProduct: true }))
                  ];
                  const allPesticides = [
                    ...PRODUCTS.pesticides.map(p => ({ ...p, type: 'pesticides' as const })),
                    ...farmerProducts.filter(p => p.category === 'pesticides').map(p => ({ ...p, type: 'pesticides' as const, isFarmerProduct: true }))
                  ];
                  const allProduce = [
                    ...farmerProducts.filter(p => p.category === 'produce').map(p => ({ ...p, type: 'produce' as const, isFarmerProduct: true }))
                  ];
                  const allDealers = PRODUCTS.dealers.map(p => ({ ...p, type: 'dealers' as const }));

                  let filtered: any[] = [];
                  if (searchQuery) {
                    const allItems = [...allSeeds, ...allPesticides, ...allProduce, ...allDealers];
                    filtered = allItems.filter((p: any) => 
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.type && t[p.type as keyof Translation]?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (p.district && t[p.district as keyof Translation]?.toLowerCase().includes(searchQuery.toLowerCase()))
                    );
                  } else {
                    if (shopCategory === 'seeds') filtered = allSeeds;
                    else if (shopCategory === 'pesticides') filtered = allPesticides;
                    else if (shopCategory === 'dealers') filtered = allDealers;
                    // @ts-ignore
                    else if (shopCategory === 'produce') filtered = allProduce;

                    if (shopCategory === 'dealers' && selectedDistrict !== 'all') {
                      filtered = filtered.filter((p: any) => p.district === selectedDistrict);
                    }
                  }

                  if (filtered.length === 0) {
                    return (
                      <div className="col-span-2 py-10 text-center">
                        <div className="bg-slate-50 dark:bg-neon-green/5 rounded-3xl p-8 border border-dashed border-slate-200 dark:border-neon-green/20">
                          <Search size={40} className="mx-auto text-slate-300 dark:text-neon-green/20 mb-4" />
                          <p className="text-slate-500 dark:text-neon-green/60 font-bold">{t.noProductsFound} {searchQuery ? `"${searchQuery}"` : ""}</p>
                          {searchQuery && (
                            <button 
                              onClick={() => setSearchQuery('')}
                              className="mt-4 text-neon-green text-sm font-black uppercase tracking-widest hover:underline"
                            >
                              {t.clearSearch}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return filtered.map(item => (
                    <motion.div 
                      key={`${item.type}-${item.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-emerald-100 dark:border-neon-green shadow-sm flex flex-col group"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-neon-green shadow-sm">
                          {item.type === 'dealers' ? t[(item as any).district as keyof Translation] : t.category + ': ' + t[item.type as keyof Translation]}
                        </div>
                        {item.isFarmerProduct && (
                          <div className="absolute top-2 left-2 bg-neon-green text-black px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">
                            Farmer Direct
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col gap-2">
                        <h3 className="font-bold text-sm leading-tight dark:text-slate-200">{item.name}</h3>
                        {item.quantity && (
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            In Stock: {item.quantity}
                          </p>
                        )}
                        
                        {item.type === 'dealers' ? (
                          <div className="flex flex-col gap-2 mt-auto">
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <MapPin size={12} className="text-neon-green" />
                              {(item as any).address}
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              <a 
                                href={`tel:${(item as any).phone}`}
                                className="bg-emerald-600 dark:bg-neon-green text-white dark:text-black py-2 rounded-xl text-[10px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-1"
                              >
                                <Bell size={12} />
                                {t.callNow}
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 mt-auto">
                            <div className="flex items-center justify-between">
                              <p className="text-emerald-600 dark:text-neon-green font-black text-lg">{(item as any).price}</p>
                              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 gap-3">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = productQuantities[item.id] || 1;
                                    if (current > 1) setProductQuantities({ ...productQuantities, [item.id]: current - 1 });
                                  }}
                                  className="text-slate-500 hover:text-neon-green"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-[10px] font-black dark:text-white min-w-[12px] text-center">{productQuantities[item.id] || 1}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = productQuantities[item.id] || 1;
                                    setProductQuantities({ ...productQuantities, [item.id]: current + 1 });
                                  }}
                                  className="text-slate-500 hover:text-neon-green"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button 
                                onClick={() => addToCart(item, productQuantities[item.id] || 1)}
                                className="bg-emerald-50 dark:bg-neon-green/10 text-emerald-700 dark:text-neon-green py-2 rounded-xl text-[10px] font-bold hover:bg-neon-green hover:text-black transition-all active:scale-95 border border-transparent dark:hover:border-neon-green flex items-center justify-center gap-1"
                              >
                                <ShoppingCart size={12} />
                                {t.addToCart}
                              </button>
                              <button 
                                onClick={() => buyNow(item, productQuantities[item.id] || 1)}
                                className="bg-emerald-600 dark:bg-neon-green text-white dark:text-black py-2 rounded-xl text-[10px] font-bold hover:opacity-90 transition-all active:scale-95"
                              >
                                {t.buyNow}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ));
                })()}
              </div>
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-[calc(100vh-160px)]"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black dark:text-neon-green neon-text uppercase tracking-tighter">{t.chat}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{t.aiSuggestions}</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-neon-green/20 text-emerald-600 dark:text-neon-green rounded-2xl">
                  <MessageCircle size={24} />
                </div>
              </div>

              <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] border border-emerald-100 dark:border-neon-green/20 overflow-hidden flex flex-col shadow-xl">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <div className="w-20 h-20 bg-emerald-50 dark:bg-neon-green/5 rounded-full flex items-center justify-center mb-4">
                        <MessageCircle size={40} className="text-emerald-200 dark:text-neon-green/20" />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-wider mb-2">{t.aiSuggestions}</p>
                      <p className="text-xs opacity-60 max-w-[200px]">Ask me about crop diseases, fertilizers, or seasonal farming tips.</p>
                    </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={`${msg.id}-${idx}`} 
                      className={cn(
                        "max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-emerald-600 text-white ml-auto rounded-tr-none shadow-lg shadow-emerald-600/20" 
                          : "bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 mr-auto rounded-tl-none border border-slate-100 dark:border-white/5"
                      )}
                    >
                      <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                      {msg.role === 'ai' && <FeedbackButtons compact />}
                    </div>
                  ))}
                  {loading && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 mr-auto rounded-2xl rounded-tl-none p-4 max-w-[85%] border border-slate-100 dark:border-white/5">
                      <Loader2 size={16} className="animate-spin text-neon-green" />
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your question..."
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-sm font-bold focus:outline-none focus:border-neon-green transition-colors dark:text-white shadow-sm"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={loading || !chatInput.trim()}
                      className="bg-neon-green text-black p-4 rounded-2xl shadow-lg shadow-neon-green/20 disabled:opacity-50 active:scale-95 transition-all neon-bg"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          </>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Feedback Button (Home only) */}
      {view === 'home' && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFeedbackOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 border-4 border-white dark:border-slate-900"
        >
          <MessageSquare size={24} />
        </motion.button>
      )}

      {/* Feedback Bottom Sheet */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFeedbackOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white dark:bg-slate-900 z-[80] rounded-t-[32px] shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto my-4" />
              <div className="p-6 pt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black dark:text-slate-100">{t.feedback}</h2>
                  <button 
                    onClick={() => setIsFeedbackOpen(false)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
                  >
                    <ChevronLeft size={20} className="rotate-[-90deg]" />
                  </button>
                </div>

                <div className="space-y-8">
                  {[
                    { id: 'q1', label: t.q1 },
                    { id: 'q2', label: t.q2 },
                    { id: 'q3', label: t.q3 },
                    { id: 'q4', label: t.q4 }
                  ].map((q) => (
                    <div key={q.id} className="space-y-3">
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{q.label}</p>
                      <div className="flex justify-between gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setFeedbackForm(prev => ({ ...prev, [q.id]: rating }))}
                            className={cn(
                              "w-12 h-12 rounded-2xl font-black transition-all",
                              feedbackForm[q.id as keyof typeof feedbackForm] === rating
                                ? "bg-emerald-600 text-white scale-110 shadow-xl shadow-emerald-600/30"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            )}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black px-1">
                        <span>{t.rating1}</span>
                        <span>{t.rating5}</span>
                      </div>
                    </div>
                  ))}

                  <div className="space-y-3">
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{t.q5}</p>
                    <textarea 
                      value={feedbackForm.q5}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, q5: e.target.value }))}
                      placeholder="Your thoughts..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-200 min-h-[100px]"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      setIsFeedbackOpen(false);
                      setShowFeedbackToast(true);
                      setTimeout(() => setShowFeedbackToast(false), 3000);
                    }}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-600/30 active:scale-95 transition-all uppercase tracking-widest"
                  >
                    {t.submitFeedback}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {isOrderSuccess && lastOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderSuccess(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-black rounded-[40px] p-8 z-[101] border border-emerald-100 dark:border-neon-green shadow-2xl text-center neon-border"
            >
              <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-6 neon-bg">
                <ThumbsUp size={40} className="text-neon-green" />
              </div>
              <h3 className="text-2xl font-black mb-2 dark:text-neon-green neon-text">Order Placed!</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Your order for <span className="font-bold text-slate-900 dark:text-white">{lastOrder.items.length} {t.items}</span> has been received. Our team will contact you shortly for delivery.
              </p>
              <div className="bg-slate-50 dark:bg-neon-green/5 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-neon-green/20">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Amount Paid</span>
                  <span className="font-black dark:text-neon-green">₹{lastOrder.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Order ID</span>
                  <span className="font-mono dark:text-slate-300">#{lastOrder.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOrderSuccess(false)}
                className="w-full bg-neon-green text-black py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all neon-bg"
              >
                Continue Shopping
              </button>
            </motion.div>
          </>
        )}

        {isPaymentQrOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaymentQrOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-black rounded-[40px] p-8 z-[101] border border-emerald-100 dark:border-neon-green shadow-2xl text-center neon-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black dark:text-neon-green neon-text">{t.payment || 'Payment'}</h3>
                <button onClick={() => setIsPaymentQrOpen(false)} className="text-slate-400 hover:text-neon-green">
                  <X size={24} />
                </button>
              </div>

              {isCheckoutPayment && (
                <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                      paymentMethod === 'upi' 
                        ? "bg-white dark:bg-neon-green text-black shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-white"
                    )}
                  >
                    <QrCode size={14} />
                    {t.upi}
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                      paymentMethod === 'card' 
                        ? "bg-white dark:bg-neon-green text-black shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-white"
                    )}
                  >
                    <CreditCard size={14} />
                    {t.card}
                  </button>
                </div>
              )}
              
              {paymentMethod === 'upi' ? (
                <>
                  <div className="bg-white p-4 rounded-3xl mb-6 shadow-inner relative overflow-hidden">
                    {paymentQrUrl ? (
                      <div className={cn("transition-all duration-500", paymentTimer === 0 && "blur-md grayscale opacity-20 scale-95")}>
                        <img 
                          src={paymentQrUrl} 
                          alt="Payment QR Code" 
                          className="w-full aspect-square object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center">
                        <Loader2 className="animate-spin text-neon-green" size={40} />
                      </div>
                    )}
                    
                    {paymentTimer === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white/40">
                        <ShieldAlert className="text-red-500 mb-2" size={48} />
                        <p className="text-sm font-black text-slate-900 mb-4">QR Expired</p>
                        <button 
                          onClick={() => generatePaymentQr(paymentAmount)}
                          className="px-6 py-2 bg-neon-green text-black rounded-full text-xs font-black shadow-lg active:scale-95 transition-all"
                        >
                          Refresh QR
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-all",
                        paymentTimer > 30 
                          ? "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400" 
                          : "bg-red-500/10 text-red-500 animate-pulse"
                      )}>
                        <Loader2 size={12} className={cn(paymentTimer > 0 && "animate-spin")} />
                        {Math.floor(paymentTimer / 60)}:{String(paymentTimer % 60).padStart(2, '0')}
                      </div>
                    </div>
                    <p className="text-sm font-black dark:text-white">{shopDetails.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{shopDetails.upiId}</p>
                    {isCheckoutPayment && (
                      <div className="mt-4 p-3 bg-neon-green/10 rounded-2xl border border-neon-green/20">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">{t.total}</p>
                        <p className="text-2xl font-black text-emerald-600 dark:text-neon-green">₹{paymentAmount.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 mt-2 italic">{t.qrDescription}</p>
                      </div>
                    )}
                  </div>

                  {isCheckoutPayment ? (
                    <button 
                      onClick={confirmOrder}
                      disabled={paymentTimer === 0}
                      className={cn(
                        "w-full py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2",
                        paymentTimer > 0 
                          ? "bg-neon-green text-black neon-bg" 
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <ThumbsUp size={20} />
                      {t.payNow}
                    </button>
                  ) : (
                    <a 
                      href={paymentQrUrl || '#'} 
                      download="Rupesh_Dagwar_Shop_QR.png"
                      className="w-full bg-neon-green text-black py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all neon-bg flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download PNG
                    </a>
                  )}
                </>
              ) : (
                <div className="text-left space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.cardNumber}</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-green transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.expiryDate}</label>
                      <input 
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.cvv}</label>
                      <input 
                        type="password"
                        placeholder="***"
                        maxLength={3}
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green transition-colors"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-neon-green/10 rounded-2xl border border-neon-green/20 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t.total}</span>
                      <span className="text-xl font-black text-emerald-600 dark:text-neon-green">₹{paymentAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={confirmOrder}
                    className="w-full bg-neon-green text-black py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all neon-bg flex items-center justify-center gap-2"
                  >
                    <Lock size={18} />
                    {t.payNow}
                  </button>
                  
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Secure 256-bit SSL Encrypted Payment
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}

        {isAddCropOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddCropOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-black rounded-[40px] p-8 z-[101] border border-emerald-100 dark:border-neon-green shadow-2xl neon-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black dark:text-neon-green neon-text">{t.addCrop}</h3>
                <button onClick={() => setIsAddCropOpen(false)} className="text-slate-400 hover:text-neon-green transition-colors">
                  <ChevronLeft size={24} className="rotate-180" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">{t.cropName}</label>
                    <div className="relative">
                      <Sprout size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={newCrop.name}
                        onChange={(e) => setNewCrop(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-neon-green/5 border border-slate-100 dark:border-neon-green/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-neon-green transition-colors dark:text-white"
                        placeholder="e.g. Wheat, Rice"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">{t.cropType}</label>
                    <div className="relative">
                      <Package size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={newCrop.type}
                        onChange={(e) => setNewCrop(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-neon-green/5 border border-slate-100 dark:border-neon-green/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-neon-green transition-colors dark:text-white"
                        placeholder="e.g. Kharif, Rabi"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">{t.plantingDate}</label>
                      <input 
                        type="date" 
                        value={newCrop.plantingDate}
                        onChange={(e) => setNewCrop(prev => ({ ...prev, plantingDate: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-neon-green/5 border border-slate-100 dark:border-neon-green/20 rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:border-neon-green transition-colors dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">{t.harvestDate}</label>
                      <input 
                        type="date" 
                        value={newCrop.harvestDate}
                        onChange={(e) => setNewCrop(prev => ({ ...prev, harvestDate: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-neon-green/5 border border-slate-100 dark:border-neon-green/20 rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:border-neon-green transition-colors dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">{t.status}</label>
                    <div className="flex gap-2">
                      {['Growing', 'Harvested', 'Failed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setNewCrop(prev => ({ ...prev, status }))}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                            newCrop.status === status 
                              ? "bg-neon-green text-black" 
                              : "bg-slate-100 dark:bg-white/5 text-slate-400"
                          )}
                        >
                          {status === 'Growing' ? t.growing : status === 'Harvested' ? t.harvested : t.failed}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (newCrop.name && newCrop.type) {
                      setUserProfile(prev => ({
                        ...prev,
                        crops: [...(prev.crops || []), { ...newCrop, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) }]
                      }));
                      setNewCrop({ name: '', type: '', plantingDate: '', harvestDate: '', status: 'Growing' });
                      setIsAddCropOpen(false);
                    }
                  }}
                  className="w-full bg-neon-green text-black py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all neon-bg mt-4"
                >
                  {t.addCrop}
                </button>
              </div>
            </motion.div>
          </>
        )}

        {isProfileEditOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileEditOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-black rounded-[40px] p-8 z-[101] border border-emerald-100 dark:border-neon-green shadow-2xl neon-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black dark:text-neon-green neon-text">Edit Profile</h3>
                <button onClick={() => setIsProfileEditOpen(false)} className="text-slate-400 hover:text-neon-green transition-colors">
                  <ChevronLeft size={24} className="rotate-180" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=200&q=80" 
                      alt="User" 
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-emerald-100 dark:border-neon-green/50 shadow-lg group-hover:opacity-80 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <Camera size={24} className="text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <button className="text-xs font-black text-neon-green uppercase tracking-widest hover:underline">Change Photo</button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={userProfile.name}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-neon-green/5 border border-slate-100 dark:border-neon-green/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-neon-green transition-colors dark:text-white"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Farm Location</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={userProfile.farmLocation}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, farmLocation: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-neon-green/5 border border-slate-100 dark:border-neon-green/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-neon-green transition-colors dark:text-white"
                        placeholder="Farm location"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Email Address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="email" 
                        value={userProfile.email}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-neon-green/5 border border-slate-100 dark:border-neon-green/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-neon-green transition-colors dark:text-white"
                        placeholder="Email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+91</div>
                      <input 
                        type="tel" 
                        value={userProfile.contact}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, contact: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-neon-green/5 border border-slate-100 dark:border-neon-green/20 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold focus:outline-none focus:border-neon-green transition-colors dark:text-white"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={updateProfile}
                  disabled={loading}
                  className="w-full bg-neon-green text-black py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all neon-bg mt-4 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </>
        )}

        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-black rounded-[40px] p-8 z-[101] border border-emerald-100 dark:border-neon-green shadow-2xl neon-border flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={24} className="text-neon-green" />
                  <h3 className="text-xl font-black dark:text-neon-green neon-text">{t.cart}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={generatePaymentQr}
                    className="p-2 text-slate-400 hover:text-neon-green transition-colors"
                    title="Payment QR"
                  >
                    <QrCode size={24} />
                  </button>
                  <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-neon-green transition-colors">
                    <ChevronLeft size={24} className="rotate-180" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="py-10 text-center">
                    <ShoppingCart size={48} className="mx-auto text-slate-200 dark:text-neon-green/10 mb-4" />
                    <p className="text-slate-500 dark:text-neon-green/60 font-bold">{t.emptyCart}</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={`${item.product.id}-${idx}`} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-neon-green/5 rounded-2xl border border-slate-100 dark:border-neon-green/20">
                      <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">{item.product.name}</h4>
                        <p className="text-xs text-emerald-600 dark:text-neon-green font-black">{item.product.price}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-neon-green/30 overflow-hidden shadow-sm">
                            <button 
                              onClick={() => updateQuantity(item.product.id, -1)} 
                              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-neon-green/10 hover:text-neon-green transition-colors active:scale-90"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center text-sm font-black dark:text-white">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, 1)} 
                              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-neon-green/10 hover:text-neon-green transition-colors active:scale-90"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.product.id)} 
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors ml-auto group"
                            title="Remove item"
                          >
                            <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-neon-green/20">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-500 dark:text-neon-green/60 font-bold uppercase tracking-widest text-xs">{t.total}</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-neon-green neon-text">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      handlePlaceOrder();
                    }}
                    className="w-full bg-neon-green text-black py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all neon-bg"
                  >
                    {t.checkout}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Liquid Magic Style) */}
      {['home', 'rates', 'chat', 'settings', 'tips', 'result', 'feedback', 'shop', 'farmer-panel'].includes(view) && (
        <div className="fixed bottom-8 left-0 right-0 px-6 z-40">
          <nav className="max-w-md mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-emerald-100/30 dark:border-neon-green/20 px-2 py-2 flex justify-between items-center rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-visible">
            
            {/* Liquid Active Indicator */}
            <div className="absolute inset-y-2 left-2 right-2 pointer-events-none flex justify-between items-center">
              {['home', user?.role === 'farmer' ? 'farmer-panel' : 'rates', 'camera', 'chat', 'shop', 'settings'].map((item) => {
                const isActive = (item === 'camera' ? false : (item === view));
                return (
                  <div key={item} className="flex-1 flex justify-center h-full relative">
                    {isActive && (
                      <>
                        {/* Main Glow Background */}
                        <motion.div 
                          layoutId="nav-glow"
                          className="absolute inset-0 bg-emerald-600/10 dark:bg-neon-green/10 rounded-3xl blur-md"
                          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        />
                        {/* Solid Pill */}
                        <motion.div 
                          layoutId="nav-pill"
                          className="w-12 h-12 bg-emerald-600/5 dark:bg-neon-green/5 border border-emerald-600/20 dark:border-neon-green/20 rounded-2xl"
                          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        />
                        {/* Top Indicator Dot */}
                        <motion.div 
                          layoutId="nav-dot"
                          className="absolute -top-1 w-1 h-1 bg-emerald-600 dark:bg-neon-green rounded-full shadow-[0_0_8px_rgba(0,255,0,0.8)]"
                          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setView('home')} 
              className={cn("relative flex-1 flex flex-col items-center gap-1 py-2 z-10 transition-all duration-500", view === 'home' ? "text-emerald-600 dark:text-neon-green" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}
            >
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
                <Wheat size={20} className={cn("transition-all duration-500", view === 'home' ? "scale-110 drop-shadow-[0_0_8px_rgba(5,150,105,0.4)] dark:drop-shadow-[0_0_8px_rgba(0,255,0,0.4)]" : "scale-100")} />
                <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500", view === 'home' ? "opacity-100 translate-y-0" : "opacity-60")}>Home</span>
              </motion.div>
            </button>

            {user?.role === 'farmer' ? (
              <>
                <button 
                  onClick={() => setView('shop-management')} 
                  className={cn("relative flex-1 flex flex-col items-center gap-1 py-2 z-10 transition-all duration-500", view === 'shop-management' ? "text-emerald-600 dark:text-neon-green" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}
                >
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
                    <ShoppingBag size={20} className={cn("transition-all duration-500", view === 'shop-management' ? "scale-110 drop-shadow-[0_0_8px_rgba(5,150,105,0.4)] dark:drop-shadow-[0_0_8px_rgba(0,255,0,0.4)]" : "scale-100")} />
                    <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500", view === 'shop-management' ? "opacity-100 translate-y-0" : "opacity-60")}>My Shop</span>
                  </motion.div>
                </button>
                <button 
                  onClick={() => setView('farmer-panel')} 
                  className={cn("relative flex-1 flex flex-col items-center gap-1 py-2 z-10 transition-all duration-500", view === 'farmer-panel' ? "text-emerald-600 dark:text-neon-green" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}
                >
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
                    <Package size={20} className={cn("transition-all duration-500", view === 'farmer-panel' ? "scale-110 drop-shadow-[0_0_8px_rgba(5,150,105,0.4)] dark:drop-shadow-[0_0_8px_rgba(0,255,0,0.4)]" : "scale-100")} />
                    <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500", view === 'farmer-panel' ? "opacity-100 translate-y-0" : "opacity-60")}>Panel</span>
                  </motion.div>
                </button>
              </>
            ) : (
              <button 
                onClick={() => setView('rates')} 
                className={cn("relative flex-1 flex flex-col items-center gap-1 py-2 z-10 transition-all duration-500", view === 'rates' ? "text-emerald-600 dark:text-neon-green" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}
              >
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
                  <IndianRupee size={20} className={cn("transition-all duration-500", view === 'rates' ? "scale-110 drop-shadow-[0_0_8px_rgba(5,150,105,0.4)] dark:drop-shadow-[0_0_8px_rgba(0,255,0,0.4)]" : "scale-100")} />
                  <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500", view === 'rates' ? "opacity-100 translate-y-0" : "opacity-60")}>Rates</span>
                </motion.div>
              </button>
            )}

            <div className="flex-1 flex justify-center z-20">
              <motion.button 
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.85, rotate: -90 }}
                animate={{ 
                  boxShadow: [
                    "0 10px 20px rgba(5,150,105,0.3)",
                    "0 10px 30px rgba(5,150,105,0.6)",
                    "0 10px 20px rgba(5,150,105,0.3)"
                  ]
                }}
                transition={{ 
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                onClick={startCamera} 
                className="bg-emerald-600 dark:bg-neon-green text-white dark:text-black p-4 rounded-2xl shadow-[0_10px_20px_rgba(5,150,105,0.3)] dark:shadow-[0_10px_20px_rgba(0,255,0,0.3)] border-2 border-white dark:border-slate-800 relative group"
              >
                <div className="absolute inset-0 bg-white/20 dark:bg-black/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Camera size={24} className="relative z-10" />
              </motion.button>
            </div>

            <button 
              onClick={() => setView('chat')} 
              className={cn("relative flex-1 flex flex-col items-center gap-1 py-2 z-10 transition-all duration-500", view === 'chat' ? "text-emerald-600 dark:text-neon-green" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}
            >
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
                <MessageCircle size={20} className={cn("transition-all duration-500", view === 'chat' ? "scale-110 drop-shadow-[0_0_8px_rgba(5,150,105,0.4)] dark:drop-shadow-[0_0_8px_rgba(0,255,0,0.4)]" : "scale-100")} />
                <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500", view === 'chat' ? "opacity-100 translate-y-0" : "opacity-60")}>Chat</span>
              </motion.div>
            </button>

            <button 
              onClick={() => setView('shop')} 
              className={cn("relative flex-1 flex flex-col items-center gap-1 py-2 z-10 transition-all duration-500", view === 'shop' ? "text-emerald-600 dark:text-neon-green" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}
            >
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
                <ShoppingBag size={20} className={cn("transition-all duration-500", view === 'shop' ? "scale-110 drop-shadow-[0_0_8px_rgba(5,150,105,0.4)] dark:drop-shadow-[0_0_8px_rgba(0,255,0,0.4)]" : "scale-100")} />
                <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500", view === 'shop' ? "opacity-100 translate-y-0" : "opacity-60")}>Market</span>
              </motion.div>
            </button>

            <button 
              onClick={() => setView('settings')} 
              className={cn("relative flex-1 flex flex-col items-center gap-1 py-2 z-10 transition-all duration-500", view === 'settings' ? "text-emerald-600 dark:text-neon-green" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}
            >
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
                <Settings size={20} className={cn("transition-all duration-500", view === 'settings' ? "scale-110 drop-shadow-[0_0_8px_rgba(5,150,105,0.4)] dark:drop-shadow-[0_0_8px_rgba(0,255,0,0.4)]" : "scale-100")} />
                <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500", view === 'settings' ? "opacity-100 translate-y-0" : "opacity-60")}>User</span>
              </motion.div>
            </button>
          </nav>
        </div>
      )}

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddProductOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddProductOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black dark:text-neon-green">{t.addProduct}</h2>
                <button onClick={() => setIsAddProductOpen(false)}><X size={24} className="dark:text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.productName}</label>
                  <input 
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 outline-none font-bold dark:text-white"
                    placeholder="e.g. Organic Wheat"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.productPrice}</label>
                  <input 
                    type="text"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 outline-none font-bold dark:text-white"
                    placeholder="e.g. ₹2,500/quintal"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.productCategory}</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 outline-none font-bold dark:text-white appearance-none"
                  >
                    <option value="seeds">{t.seeds}</option>
                    <option value="pesticides">{t.pesticides}</option>
                    <option value="produce">Produce</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity / Stock</label>
                  <input 
                    type="text"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 outline-none font-bold dark:text-white"
                    placeholder="e.g. 50 kg or 10 units"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Image</label>
                  <div className="relative group">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewProduct({ ...newProduct, image: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="product-image-upload"
                    />
                    <label 
                      htmlFor="product-image-upload"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-neon-green transition-all overflow-hidden relative min-h-[120px]"
                    >
                      {newProduct.image ? (
                        <>
                          <img src={newProduct.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
                          <div className="relative z-10 flex flex-col items-center">
                            <Upload size={24} className="text-neon-green" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload size={24} className="text-slate-400 group-hover:text-neon-green transition-colors" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-neon-green transition-colors">Upload Image</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (newProduct.name && newProduct.price) {
                      setFarmerProducts(prev => [...prev, { 
                        id: Math.random().toString(36).substr(2, 9),
                        ...newProduct,
                        image: newProduct.image || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"
                      }]);
                      setIsAddProductOpen(false);
                      setNewProduct({ name: '', price: '', category: 'seeds', image: '', quantity: '' });
                    }
                  }}
                  className="w-full bg-neon-green text-black py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all mt-4"
                >
                  {t.addProduct}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isFarmerPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsFarmerPasswordModalOpen(false);
                setFarmerPasswordInput('');
                setLoginError('');
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-neon-green" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black dark:text-neon-green neon-text">Farmer Access</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Verification Required</p>
                </div>
                <button 
                  onClick={() => {
                    setIsFarmerPasswordModalOpen(false);
                    setFarmerPasswordInput('');
                    setLoginError('');
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={24} className="dark:text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Farmer Security Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="password"
                      value={farmerPasswordInput}
                      onChange={(e) => {
                        setLoginError('');
                        setFarmerPasswordInput(e.target.value);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && confirmFarmerSwitch()}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-neon-green rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold dark:text-white"
                      placeholder="••••••••"
                      autoFocus
                    />
                  </div>
                </div>

                {loginError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-500 text-xs font-bold text-center"
                  >
                    {loginError}
                  </motion.div>
                )}

                <button 
                  onClick={confirmFarmerSwitch}
                  disabled={loading}
                  className="w-full bg-slate-900 dark:bg-neon-green text-white dark:text-black py-5 rounded-2xl font-black shadow-xl hover:shadow-neon-green/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                      <span>Verify & Continue</span>
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOrderToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-xs"
          >
            <div className="bg-emerald-600 dark:bg-neon-green text-white dark:text-black p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 dark:border-black/10 neon-border">
              <div className="bg-white/20 dark:bg-black/10 p-2 rounded-xl">
                <Check size={20} />
              </div>
              <div className="flex-1">
                <p className="font-black text-sm uppercase tracking-wider">Order Confirmed!</p>
                <p className="text-[10px] opacity-90 font-bold">Your seeds are on the way.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
