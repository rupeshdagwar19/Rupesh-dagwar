export type Language = 'en' | 'hi' | 'mr';

export interface Translation {
  title: string;
  subtitle: string;
  detectDisease: string;
  weatherTips: string;
  selectLanguage: string;
  uploadImage: string;
  takePhoto: string;
  analyzing: string;
  resultTitle: string;
  treatment: string;
  fertilizer: string;
  weatherTitle: string;
  getTips: string;
  locationAccess: string;
  history: string;
  cameraError: string;
  back: string;
  share: string;
  notifications: string;
  chat: string;
  aiSuggestions: string;
  settings: string;
  darkMode: string;
  feedback: string;
  sendFeedback: string;
  feedbackThanks: string;
  submitFeedback: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  rating1: string;
  rating2: string;
  rating3: string;
  rating4: string;
  rating5: string;
  cropRates: string;
  selectState: string;
  selectCrop: string;
  fetchingRates: string;
  temperature: string;
  humidity: string;
  windSpeed: string;
  weather: string;
  login: string;
  logout: string;
  phoneNumber: string;
  fullName: string;
  farmLocation: string;
  saveProfile: string;
  welcomeBack: string;
  enterDetails: string;
  profile: string;
  shop: string;
  seeds: string;
  pesticides: string;
  buyNow: string;
  price: string;
  category: string;
  addToCart: string;
  cart: string;
  emptyCart: string;
  total: string;
  checkout: string;
  items: string;
  searchPlaceholder: string;
  noProductsFound: string;
  clearSearch: string;
  orderHistory: string;
  noOrders: string;
  orderDate: string;
  orderId: string;
  adminSettings: string;
  accountType: string;
  farmer: string;
  customer: string;
  adminEmail: string;
  adminPassword: string;
  updateCredentials: string;
  localDealers: string;
  district: string;
  yavatmal: string;
  wardha: string;
  amravati: string;
  pune: string;
  nagpur: string;
  nashik: string;
  sambhajinagar: string;
  jalgaon: string;
  solapur: string;
  kolhapur: string;
  ahmednagar: string;
  buldhana: string;
  akola: string;
  callNow: string;
  visitShop: string;
  dailyRateGraph: string;
  historicalTrends: string;
  pricePerQuintal: string;
  selectCity: string;
    enterCity: string;
    role: string;
    farmerPanel: string;
    myScans: string;
    myListings: string;
    recentScans: string;
    addNewListing: string;
    earnings: string;
    myProducts: string;
    productName: string;
    productPrice: string;
    productCategory: string;
    addProduct: string;
    agroNews: string;
    latestNews: string;
    readMore: string;
    myCrops: string;
    addCrop: string;
    cropName: string;
    cropType: string;
    preferences: string;
    organicFarming: string;
    pestAlerts: string;
    marketUpdates: string;
    savePreferences: string;
    payment: string;
    selectPaymentMethod: string;
    upi: string;
    card: string;
    netBanking: string;
    payNow: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    upiId: string;
    paymentProcessing: string;
    paymentSuccess: string;
    paymentFailed: string;
    scanQr: string;
    scanToPay: string;
    qrDescription: string;
    plantingDate: string;
    harvestDate: string;
    status: string;
    growing: string;
    harvested: string;
    failed: string;
    pastQueries: string;
    noPastQueries: string;
    scanCropPlaceholder: string;
    scanToPayPlaceholder: string;
    paymentQr: string;
  }
  
  export const translations: Record<Language, Translation> = {
    en: {
      title: "RDAGRO",
      subtitle: "Your Smart Farming Partner",
      detectDisease: "Detect Disease",
      weatherTips: "Farming Tips",
      selectLanguage: "Select Language",
      uploadImage: "Upload Image",
      takePhoto: "Take Photo",
      analyzing: "Analyzing crop health...",
      resultTitle: "Analysis Result",
      treatment: "Recommended Treatment",
      fertilizer: "Fertilizer Suggestion",
      weatherTitle: "Weather & Tips",
      getTips: "Get Farming Tips",
      locationAccess: "Please allow location access for accurate tips",
      history: "Recent Scans",
      cameraError: "Camera access denied or not available",
      back: "Back",
      share: "Share",
      notifications: "Notifications",
      chat: "RDchat",
      aiSuggestions: "AI Suggestions",
      settings: "Settings",
      darkMode: "Dark Mode",
      feedback: "Feedback",
      sendFeedback: "Send Feedback",
      feedbackThanks: "Thanks for your feedback!",
      submitFeedback: "Submit Feedback",
      q1: "How satisfied are you with the RD's disease detection?",
      q2: "Are the farming tips helpful for your crops?",
      q3: "Is the app easy to use in your preferred language?",
      q4: "How would you rate the speed of analysis?",
      q5: "Any other suggestions or features you'd like to see?",
      rating1: "Very Dissatisfied",
      rating2: "Dissatisfied",
      rating3: "Neutral",
      rating4: "Satisfied",
      rating5: "Very Satisfied",
      cropRates: "Crop Rates",
      selectState: "Select State",
      selectCrop: "Select Crop",
      fetchingRates: "Fetching latest crop rates...",
      temperature: "Temperature",
      humidity: "Humidity",
      windSpeed: "Wind Speed",
      weather: "Weather",
      login: "Login",
      logout: "Logout",
      phoneNumber: "Phone Number",
      fullName: "Full Name",
      farmLocation: "Farm Location",
      saveProfile: "Save Profile",
      welcomeBack: "Welcome Back",
      enterDetails: "Please enter your details to continue",
      profile: "User Profile",
      shop: "Shop",
      seeds: "Seeds",
      pesticides: "Pesticides",
      buyNow: "Buy Now",
      price: "Price",
      category: "Category",
      addToCart: "Add to Cart",
      cart: "Cart",
      emptyCart: "Your cart is empty",
      total: "Total",
      checkout: "Checkout",
      items: "Items",
      searchPlaceholder: "Search by name, category, or dealer...",
      noProductsFound: "No products found",
      clearSearch: "Clear Search",
      orderHistory: "Order History",
      noOrders: "No orders placed yet",
      orderDate: "Order Date",
      orderId: "Order ID",
      adminSettings: "Admin Settings",
      accountType: "Account Type",
      farmer: "Farmer",
      customer: "Customer",
      adminEmail: "Admin Email",
      adminPassword: "Admin Password",
      updateCredentials: "Update Credentials",
      localDealers: "Local Dealers",
      district: "District",
      yavatmal: "Yavatmal",
      wardha: "Wardha",
      amravati: "Amravati",
      pune: "Pune",
      nagpur: "Nagpur",
      nashik: "Nashik",
      sambhajinagar: "Sambhajinagar",
      jalgaon: "Jalgaon",
      solapur: "Solapur",
      kolhapur: "Kolhapur",
      ahmednagar: "Ahmednagar",
      buldhana: "Buldhana",
      akola: "Akola",
      callNow: "Call Now",
      visitShop: "Visit Shop",
      dailyRateGraph: "Daily Rate Graph",
      historicalTrends: "Historical Trends (Last 30 Days)",
      pricePerQuintal: "Price per Quintal (₹)",
      selectCity: "Select City/Mandi",
      enterCity: "Enter city or market name",
      role: "Role",
      farmerPanel: "Farmer Panel",
      myScans: "My Scans",
      myListings: "My Listings",
      recentScans: "Recent Scans",
      addNewListing: "Add New Listing",
      earnings: "Earnings",
      myProducts: "My Products",
      productName: "Product Name",
      productPrice: "Price",
      productCategory: "Category",
      addProduct: "Add Product",
      agroNews: "Agro News",
      latestNews: "Latest Agricultural News",
      readMore: "Read More",
      myCrops: "My Crops",
      addCrop: "Add Crop",
      cropName: "Crop Name",
      cropType: "Crop Type",
      preferences: "Preferences",
      organicFarming: "Organic Farming",
      pestAlerts: "Pest Alerts",
      marketUpdates: "Market Updates",
      savePreferences: "Save Preferences",
      payment: "Payment",
      selectPaymentMethod: "Select Payment Method",
      upi: "UPI",
      card: "Credit/Debit Card",
      netBanking: "Net Banking",
      payNow: "Pay Now",
      cardNumber: "Card Number",
      expiryDate: "Expiry Date",
      cvv: "CVV",
      upiId: "UPI ID",
      paymentProcessing: "Processing Payment...",
      paymentSuccess: "Payment Successful",
      paymentFailed: "Payment Failed",
      scanQr: "Scan QR",
      scanToPay: "Scan to Pay",
      qrDescription: "Scan any UPI QR code to make payment",
      plantingDate: "Planting Date",
      harvestDate: "Expected Harvest",
      status: "Status",
      growing: "Growing",
      harvested: "Harvested",
      failed: "Failed",
      pastQueries: "Past Queries",
      noPastQueries: "No past queries yet",
      scanCropPlaceholder: "Scan your crop for disease detection...",
      scanToPayPlaceholder: "Scan any QR to pay instantly...",
      paymentQr: "Payment QR",
    },
    hi: {
      title: "RDAGRO (आरडी एग्रो)",
      subtitle: "आपका स्मार्ट खेती साथी",
      detectDisease: "रोग पहचानें",
      weatherTips: "खेती के टिप्स",
      selectLanguage: "भाषा चुनें",
      uploadImage: "छवि अपलोड करें",
      takePhoto: "फोटो लें",
      analyzing: "फसल के स्वास्थ्य का विश्लेषण...",
      resultTitle: "विश्लेषण परिणाम",
      treatment: "अनुशंसित उपचार",
      fertilizer: "उर्वरक सुझाव",
      weatherTitle: "मौसम और सुझाव",
      getTips: "खेती के टिप्स प्राप्त करें",
      locationAccess: "सटीक सुझावों के लिए कृपया स्थान की अनुमति दें",
      history: "हाल के स्कैन",
      cameraError: "कैमरा एक्सेस नहीं मिला",
      back: "पीछे",
      share: "साझा करें",
      notifications: "सूचनाएं",
      chat: "RDchat",
      aiSuggestions: "एआई सुझाव",
      settings: "सेटिंग्स",
      darkMode: "डार्क मोड",
      feedback: "प्रतिक्रिया",
      sendFeedback: "प्रतिक्रिया भेजें",
      feedbackThanks: "आपकी प्रतिक्रिया के लिए धन्यवाद!",
      submitFeedback: "प्रतिक्रिया सबमिट करें",
      q1: "आप आरडी (RD) की रोग पहचान से कितने संतुष्ट हैं?",
      q2: "क्या खेती के टिप्स आपकी फसलों के लिए सहायक हैं?",
      q3: "क्या आपकी पसंदीदा भाषा में ऐप का उपयोग करना आसान है?",
      q4: "आप विश्लेषण की गति को कैसे रेट करेंगे?",
      q5: "कोई अन्य सुझाव या सुविधाएँ जो आप देखना चाहेंगे?",
      rating1: "बहुत असंतुष्ट",
      rating2: "असंतुष्ट",
      rating3: "तटस्थ",
      rating4: "संतुष्ट",
      rating5: "बहुत संतुष्ट",
      cropRates: "फसल दर",
      selectState: "राज्य चुनें",
      selectCrop: "फसल चुनें",
      fetchingRates: "नवीनतम फसल दरें प्राप्त की जा रही हैं...",
      temperature: "तापमान",
      humidity: "नमी",
      windSpeed: "हवा की गति",
      weather: "मौसम",
      login: "लॉगिन",
      logout: "लॉगआउट",
      phoneNumber: "फ़ोन नंबर",
      fullName: "पूरा नाम",
      farmLocation: "खेत का स्थान",
      saveProfile: "प्रोफ़ाइल सहेजें",
      welcomeBack: "वापसी पर स्वागत है",
      enterDetails: "जारी रखने के लिए कृपया अपना विवरण दर्ज करें",
      profile: "उपयोगकर्ता प्रोफ़ाइल",
      shop: "दुकान",
      seeds: "बीज",
      pesticides: "कीटनाशक",
      buyNow: "अभी खरीदें",
      price: "कीमत",
      category: "श्रेणी",
      addToCart: "कार्ट में जोड़ें",
      cart: "कार्ट",
      emptyCart: "आपकी कार्ट खाली है",
      total: "कुल",
      checkout: "चेकआउट",
      items: "वस्तुएं",
      searchPlaceholder: "नाम, श्रेणी या डीलर द्वारा खोजें...",
      noProductsFound: "कोई उत्पाद नहीं मिला",
      clearSearch: "खोज साफ करें",
      orderHistory: "ऑर्डर इतिहास",
      noOrders: "अभी तक कोई ऑर्डर नहीं दिया गया है",
      orderDate: "ऑर्डर की तारीख",
      orderId: "ऑर्डर आईडी",
      adminSettings: "एडमिन सेटिंग्स",
      accountType: "खाते का प्रकार",
      farmer: "किसान",
      customer: "ग्राहक",
      adminEmail: "एडमिन ईमेल",
      adminPassword: "एडमिन पासवर्ड",
      updateCredentials: "क्रेडेंशियल अपडेट करें",
      localDealers: "स्थानीय डीलर",
      district: "जिला",
      yavatmal: "यवतमाल",
      wardha: "वर्धा",
      amravati: "अमरावती",
      pune: "पुणे",
      nagpur: "नागपुर",
      nashik: "नाशिक",
      sambhajinagar: "संभाजीनगर",
      jalgaon: "जलगांव",
      solapur: "सोलापुर",
      kolhapur: "कोल्हापुर",
      ahmednagar: "अहमदनगर",
      buldhana: "बुलढाणा",
      akola: "अकोला",
      callNow: "अभी कॉल करें",
      visitShop: "दुकान पर जाएं",
      dailyRateGraph: "दैनिक दर ग्राफ",
      historicalTrends: "ऐतिहासिक रुझान (पिछले 30 दिन)",
      pricePerQuintal: "प्रति क्विंटल मूल्य (₹)",
      selectCity: "शहर/मंडी चुनें",
      enterCity: "शहर या मंडी का नाम दर्ज करें",
      role: "भूमिका",
      farmerPanel: "किसान पैनल",
      myScans: "मेरे स्कैन",
      myListings: "मेरी लिस्टिंग",
      recentScans: "हाल के स्कैन",
      addNewListing: "नई लिस्टिंग जोड़ें",
      earnings: "कुल कमाई",
      myProducts: "मेरे उत्पाद",
      productName: "उत्पाद का नाम",
      productPrice: "कीमत",
      productCategory: "श्रेणी",
      addProduct: "उत्पाद जोड़ें",
      agroNews: "कृषि समाचार",
      latestNews: "नवीनतम कृषि समाचार",
      readMore: "अधिक पढ़ें",
      myCrops: "मेरी फसलें",
      addCrop: "फसल जोड़ें",
      cropName: "फसल का नाम",
      cropType: "फसल का प्रकार",
      preferences: "प्राथमिकताएं",
      organicFarming: "जैविक खेती",
      pestAlerts: "कीट अलर्ट",
      marketUpdates: "बाजार अपडेट",
      savePreferences: "प्राथमिकताएं सहेजें",
      payment: "भुगतान",
      selectPaymentMethod: "भुगतान विधि चुनें",
      upi: "यूपीआई (UPI)",
      card: "क्रेडिट/डेबिट कार्ड",
      netBanking: "नेट बैंकिंग",
      payNow: "अभी भुगतान करें",
      cardNumber: "कार्ड नंबर",
      expiryDate: "समाप्ति तिथि",
      cvv: "सीवीवी (CVV)",
      upiId: "यूपीआई आईडी",
      paymentProcessing: "भुगतान संसाधित हो रहा है...",
      paymentSuccess: "भुगतान सफल रहा",
      paymentFailed: "भुगतान विफल रहा",
      scanQr: "QR स्कैन करें",
      scanToPay: "भुगतान के लिए स्कैन करें",
      qrDescription: "भुगतान करने के लिए किसी भी UPI QR कोड को स्कैन करें",
      plantingDate: "बुवाई की तारीख",
      harvestDate: "अपेक्षित कटाई",
      status: "स्थिति",
      growing: "बढ़ रहा है",
      harvested: "कटाई हो गई",
      failed: "विफल",
      pastQueries: "पिछले प्रश्न",
      noPastQueries: "अभी तक कोई पिछला प्रश्न नहीं है",
      scanCropPlaceholder: "रोग की पहचान के लिए अपनी फसल को स्कैन करें...",
      scanToPayPlaceholder: "तुरंत भुगतान करने के लिए कोई भी क्यूआर स्कैन करें...",
      paymentQr: "भुगतान क्यूआर",
    },
    mr: {
      title: "RDAGRO (आरडी एग्रो)",
      subtitle: "तुमचा स्मार्ट शेती सोबती",
      detectDisease: "रोग ओळखा",
      weatherTips: "शेती सल्ला",
      selectLanguage: "भाषा निवडा",
      uploadImage: "फोटो अपलोड करा",
      takePhoto: "फोटो काढा",
      analyzing: "पिकाच्या आरोग्याचे विश्लेषण करत आहे...",
      resultTitle: "विश्लेषण निकाल",
      treatment: "शिफारस केलेले उपचार",
      fertilizer: "खत सूचना",
      weatherTitle: "हवामान आणि सल्ला",
      getTips: "शेती सल्ला मिळवा",
      locationAccess: "अचूक सल्ल्यासाठी कृपया लोकेशन परवानगी द्या",
      history: "अलीकडील स्कॅन",
      cameraError: "कॅमेरा प्रवेश नाकारला",
      back: "मागे",
      share: "शेअर करा",
      notifications: "सूचना",
      chat: "RDchat",
      aiSuggestions: "एआय सल्ला",
      settings: "सेटिंग्ज",
      darkMode: "डार्क मोड",
      feedback: "प्रतिसाद",
      sendFeedback: "प्रतिसाद पाठवा",
      feedbackThanks: "तुमच्या प्रतिसादाबद्दल धन्यवाद!",
      submitFeedback: "प्रतिसाद सबमिट करा",
      q1: "आरडीच्या (RD) रोग ओळखीबद्दल तुम्ही किती समाधानी आहात?",
      q2: "शेती सल्ला तुमच्या पिकांसाठी उपयुक्त आहे का?",
      q3: "तुमच्या पसंतीच्या भाषेत अॅप वापरणे सोपे आहे का?",
      q4: "विश्लेषणाच्या गतीला तुम्ही कसे रेट कराल?",
      q5: "इतर काही सूचना किंवा वैशिष्ट्ये जी तुम्हाला पाहायला आवडतील?",
      rating1: "खूप असमाधानी",
      rating2: "असमाधानी",
      rating3: "तटस्थ",
      rating4: "समाधानी",
      rating5: "खूप समाधानी",
      cropRates: "पिकांचे दर",
      selectState: "राज्य निवडा",
      selectCrop: "पीक निवडा",
      fetchingRates: "पिकांचे नवीनतम दर मिळवत आहे...",
      temperature: "तापमान",
      humidity: "आद्रता",
      windSpeed: "वाऱ्याचा वेग",
      weather: "हवामान",
      login: "लॉगिन",
      logout: "लॉगआउट",
      phoneNumber: "फोन नंबर",
      fullName: "पूर्ण नाव",
      farmLocation: "शेताचे ठिकाण",
      saveProfile: "प्रोफाइल जतन करा",
      welcomeBack: "पुन्हा स्वागत आहे",
      enterDetails: "कृपया सुरू ठेवण्यासाठी तुमचे तपशील प्रविष्ट करा",
      profile: "वापरकर्ता प्रोफाइल",
      shop: "दुकान",
      seeds: "बियाणे",
      pesticides: "कीटकनाशके",
      buyNow: "आता खरेदी करा",
      price: "किंमत",
      category: "वर्ग",
      addToCart: "कार्टमध्ये जोडा",
      cart: "कार्ट",
      emptyCart: "तुमची कार्ट रिकामी आहे",
      total: "एकूण",
      checkout: "चेकआउट",
      items: "वस्तू",
      searchPlaceholder: "नाव, वर्ग किंवा डीलरनुसार शोधा...",
      noProductsFound: "कोणतेही उत्पादन आढळले नाही",
      clearSearch: "शोध साफ करा",
      orderHistory: "ऑर्डर इतिहास",
      noOrders: "अद्याप कोणतीही ऑर्डर दिली नाही",
      orderDate: "ऑर्डरची तारीख",
      orderId: "ऑर्डर आयडी",
      adminSettings: "अॅडमिन सेटिंग्स",
      accountType: "खात्याचा प्रकार",
      farmer: "शेतकरी",
      customer: "ग्राहक",
      adminEmail: "अॅडमिन ईमेल",
      adminPassword: "अॅडमिन पासवर्ड",
      updateCredentials: "क्रेडेंशियल अपडेट करा",
      localDealers: "स्थानिक डीलर",
      district: "जिल्हा",
      yavatmal: "यवतमाळ",
      wardha: "वर्धा",
      amravati: "अमरावती",
      pune: "पुणे",
      nagpur: "नागपूर",
      nashik: "नाशिक",
      sambhajinagar: "संभाजीनगर",
      jalgaon: "जळगाव",
      solapur: "सोलापूर",
      kolhapur: "कोल्हापूर",
      ahmednagar: "अहमदनगर",
      buldhana: "बुलढाणा",
      akola: "अकोला",
      callNow: "आता कॉल करा",
      visitShop: "दुकानाला भेट द्या",
      dailyRateGraph: "दैनिक दर ग्राफ",
      historicalTrends: "ऐतिहासिक कल (मागील ३० दिवस)",
      pricePerQuintal: "प्रति क्विंटल किंमत (₹)",
      selectCity: "शहर/मंडी निवडा",
      enterCity: "शहर किंवा मंडीचे नाव प्रविष्ट करा",
      role: "भूमिका",
      farmerPanel: "शेतकरी पॅनेल",
      myScans: "माझे स्कॅन",
      myListings: "माझ्या सूची",
      recentScans: "अलीकडील स्कॅन",
      addNewListing: "नवीन सूची जोडा",
      earnings: "एकूण कमाई",
      myProducts: "माझी उत्पादने",
      productName: "उत्पादनाचे नाव",
      productPrice: "किंमत",
      productCategory: "वर्ग",
      addProduct: "उत्पादन जोडा",
      agroNews: "कृषी बातम्या",
      latestNews: "नवीनतम कृषी बातम्या",
      readMore: "अधिक वाचा",
      myCrops: "माझी पिके",
      addCrop: "पीक जोडा",
      cropName: "पिकाचे नाव",
      cropType: "पिकाचा प्रकार",
      preferences: "प्राधान्ये",
      organicFarming: "सेंद्रिय शेती",
      pestAlerts: "कीड अलर्ट",
      marketUpdates: "बाजार अपडेट",
      savePreferences: "प्राधान्ये जतन करा",
      payment: "पेमेंट",
      selectPaymentMethod: "पेमेंट पद्धत निवडा",
      upi: "यूपीआय (UPI)",
      card: "क्रेडिट/डेबिट कार्ड",
      netBanking: "नेट बँकिंग",
      payNow: "आता पेमेंट करा",
      cardNumber: "कार्ड नंबर",
      expiryDate: "कालबाह्यता तारीख",
      cvv: "सीव्हीव्ही (CVV)",
      upiId: "यूपीआय आयडी",
      paymentProcessing: "पेमेंट प्रक्रिया सुरू आहे...",
      paymentSuccess: "पेमेंट यशस्वी झाले",
      paymentFailed: "पेमेंट अयशस्वी झाले",
      scanQr: "QR स्कॅन करा",
      scanToPay: "पेमेंटसाठी स्कॅन करा",
      qrDescription: "पेमेंट करण्यासाठी कोणताही UPI QR कोड स्कॅन करा",
      plantingDate: "लागवडीची तारीख",
      harvestDate: "अपेक्षित कापणी",
      status: "स्थिती",
      growing: "वाढत आहे",
      harvested: "कापणी झाली",
      failed: "अयशस्वी",
      pastQueries: "मागील प्रश्न",
      noPastQueries: "अद्याप कोणतेही मागील प्रश्न नाहीत",
      scanCropPlaceholder: "रोग ओळखण्यासाठी तुमचे पीक स्कॅन करा...",
      scanToPayPlaceholder: "त्वरित पेमेंट करण्यासाठी कोणताही QR स्कॅन करा...",
      paymentQr: "पेमेंट क्यूआर",
    }
  }
