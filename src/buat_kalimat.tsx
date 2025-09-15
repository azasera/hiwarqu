import React, { useState, useRef, useEffect } from 'react';
import { Volume2, RotateCcw, BookOpen, Languages, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';

const ArabicLearningApp = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('id'); // id = Indonesian, ar = Arabic
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [translationStatus, setTranslationStatus] = useState('ready'); // ready, translating, success, error
  const debounceRef = useRef(null);

  // Real-time translation with debounce
  useEffect(() => {
    if (realTimeMode && inputText.trim() && inputText.length > 2) {
      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      // Set new debounce
      debounceRef.current = setTimeout(() => {
        translateWithClaude();
      }, 1500); // Wait 1.5 seconds after user stops typing
    } else if (!inputText.trim()) {
      setTranslatedText('');
      setTranslationStatus('ready');
    }
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputText, realTimeMode, sourceLanguage]);

  // Claude-powered translation function
  const translateWithClaude = async () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    setTranslationStatus('translating');
    
    try {
      const fromLanguage = sourceLanguage === 'id' ? 'Indonesian' : 'Arabic';
      const toLanguage = sourceLanguage === 'id' ? 'Arabic' : 'Indonesian';
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Translate the following ${fromLanguage} text to ${toLanguage}. Provide ONLY the translation, no explanation or additional text:

"${inputText}"`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const translation = data.content[0].text.trim();
        
        // Remove any quotes that might be added
        const cleanTranslation = translation.replace(/^["'](.*)["']$/, '$1');
        
        setTranslatedText(cleanTranslation);
        setTranslationStatus('success');
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationStatus('error');
      
      // Fallback to offline dictionary
      translateWithFallback(inputText);
    }
    
    setIsTranslating(false);
  };

  // Manual translation function
  const translateText = async () => {
    await translateWithClaude();
  };

  // Fallback offline dictionary
  const translateWithFallback = (text) => {
    const basicTranslations = {
      'id-ar': {
        'halo': 'مرحبا',
        'selamat pagi': 'صباح الخير',
        'selamat siang': 'مساء الخير',
        'selamat malam': 'مساء الخير',
        'terima kasih': 'شكرا',
        'terima kasih banyak': 'شكرا جزيلا',
        'maaf': 'آسف',
        'permisi': 'عذرا',
        'ya': 'نعم',
        'tidak': 'لا',
        'apa kabar': 'كيف حالك',
        'kabar baik': 'بخير',
        'nama saya': 'اسمي',
        'saya dari indonesia': 'أنا من إندونيسيا',
        'saya belajar bahasa arab': 'أتعلم اللغة العربية',
        'saya tidak mengerti': 'لا أفهم',
        'bisakah anda membantu': 'هل يمكنك المساعدة',
        'rumah': 'بيت',
        'sekolah': 'مدرسة',
        'buku': 'كتاب',
        'air': 'ماء',
        'makanan': 'طعام',
        'teman': 'صديق',
        'keluarga': 'عائلة',
        'anak': 'طفل',
        'ayah': 'أب',
        'ibu': 'أم',
        'saudara': 'أخ',
        'saudari': 'أخت',
        'guru': 'معلم',
        'murid': 'طالب',
        'dokter': 'طبيب',
        'masjid': 'مسجد',
        'pasar': 'سوق',
        'jalan': 'طريق',
        'mobil': 'سيارة',
        'pesawat': 'طائرة'
      },
      'ar-id': {
        'مرحبا': 'halo',
        'صباح الخير': 'selamat pagi',
        'مساء الخير': 'selamat sore/malam',
        'شكرا': 'terima kasih',
        'شكرا جزيلا': 'terima kasih banyak',
        'آسف': 'maaf',
        'عذرا': 'permisi',
        'نعم': 'ya',
        'لا': 'tidak',
        'كيف حالك': 'apa kabar',
        'بخير': 'kabar baik',
        'اسمي': 'nama saya',
        'أنا من إندونيسيا': 'saya dari indonesia',
        'أتعلم اللغة العربية': 'saya belajar bahasa arab',
        'لا أفهم': 'saya tidak mengerti',
        'هل يمكنك المساعدة': 'bisakah anda membantu',
        'بيت': 'rumah',
        'مدرسة': 'sekolah',
        'كتاب': 'buku',
        'ماء': 'air',
        'طعام': 'makanan',
        'صديق': 'teman',
        'عائلة': 'keluarga',
        'طفل': 'anak',
        'أب': 'ayah',
        'أم': 'ibu',
        'أخ': 'saudara',
        'أخت': 'saudari',
        'معلم': 'guru',
        'طالب': 'murid',
        'طبيب': 'dokter',
        'مسجد': 'masjid',
        'سوق': 'pasar',
        'طريق': 'jalan',
        'سيارة': 'mobil',
        'طائرة': 'pesawat'
      }
    };
    
    const translationKey = `${sourceLanguage}-${sourceLanguage === 'id' ? 'ar' : 'id'}`;
    const translations = basicTranslations[translationKey];
    const lowerText = text.toLowerCase().trim();
    
    // Try exact match first
    if (translations[lowerText]) {
      setTranslatedText(translations[lowerText]);
      setTranslationStatus('success');
      return;
    }
    
    // Try partial matches for longer sentences
    let result = text;
    let foundMatch = false;
    
    Object.keys(translations).forEach(key => {
      if (lowerText.includes(key.toLowerCase())) {
        result = result.replace(new RegExp(key, 'gi'), translations[key]);
        foundMatch = true;
      }
    });
    
    if (foundMatch) {
      setTranslatedText(result);
      setTranslationStatus('success');
    } else {
      setTranslatedText(sourceLanguage === 'id' ? 
        'كلمة غير معروفة - جرب الكلمات الأساسية' : 
        'Kata tidak dikenal - coba kata-kata dasar'
      );
      setTranslationStatus('error');
    }
  };

  const switchLanguages = () => {
    setSourceLanguage(sourceLanguage === 'id' ? 'ar' : 'id');
    setInputText(translatedText);
    setTranslatedText(inputText);
    setTranslationStatus('ready');
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (e.target.value.trim() === '') {
      setTranslatedText('');
      setTranslationStatus('ready');
    }
  };

  const playAudio = () => {
    if (translatedText && !isPlaying) {
      setIsPlaying(true);
      
      try {
        // Use browser's built-in speech synthesis
        const utterance = new SpeechSynthesisUtterance(translatedText);
        
        if (sourceLanguage === 'id') {
          // Reading Arabic text
          utterance.lang = 'ar-SA';
          utterance.rate = 0.7;
        } else {
          // Reading Indonesian text
          utterance.lang = 'id-ID';
          utterance.rate = 0.8;
        }
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        utterance.onerror = () => {
          setIsPlaying(false);
        };
        
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Speech synthesis error:', error);
        setIsPlaying(false);
      }
    }
  };

  const commonPhrases = [
    { ar: 'صباح الخير', id: 'selamat pagi' },
    { ar: 'مساء الخير', id: 'selamat sore' },
    { ar: 'شكرا جزيلا', id: 'terima kasih banyak' },
    { ar: 'كيف حالك', id: 'apa kabar' },
    { ar: 'اسمي أحمد', id: 'nama saya ahmad' },
    { ar: 'أتعلم اللغة العربية', id: 'saya belajar bahasa arab' },
    { ar: 'لا أفهم', id: 'saya tidak mengerti' },
    { ar: 'هل يمكنك المساعدة', id: 'bisakah anda membantu' }
  ];

  const insertPhrase = (phrase) => {
    setInputText(phrase);
    if (realTimeMode) {
      // Trigger translation after a short delay
      setTimeout(() => {
        translateWithClaude();
      }, 500);
    }
  };

  const getStatusIcon = () => {
    switch (translationStatus) {
      case 'translating':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">تعلم العربية</h1>
                <p className="text-sm text-gray-600">Pembelajaran Bahasa Arab dengan AI</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <Languages className="w-4 h-4" />
              <span>Indonesia ↔ العربية</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Main Translation Interface */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          {/* Language Selector */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Languages className="w-5 h-5" />
                <span className="font-medium">
                  {sourceLanguage === 'id' ? 'Indonesia → العربية' : 'العربية → Indonesia'}
                </span>
                {realTimeMode && (
                  <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    <Zap className="w-3 h-3" />
                    <span>AI Real-time</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRealTimeMode(!realTimeMode)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    realTimeMode 
                      ? 'bg-white bg-opacity-30 text-white' 
                      : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                  }`}
                  title="Toggle real-time translation"
                >
                  <Zap className="w-4 h-4" />
                </button>
                <button
                  onClick={switchLanguages}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
                  title="Tukar bahasa"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    {sourceLanguage === 'id' ? 'Bahasa Indonesia' : 'اللغة العربية'}
                  </label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon()}
                    {translationStatus === 'translating' && (
                      <span className="text-xs text-blue-600">Translating with AI...</span>
                    )}
                    {translationStatus === 'success' && realTimeMode && (
                      <span className="text-xs text-green-600">✓ Translated</span>
                    )}
                    {translationStatus === 'error' && (
                      <span className="text-xs text-red-600">Using offline dictionary</span>
                    )}
                  </div>
                </div>
                <textarea
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={sourceLanguage === 'id' ? 'Ketik kalimat dalam bahasa Indonesia...' : 'اكتب جملة باللغة العربية...'}
                  className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
                  dir={sourceLanguage === 'ar' ? 'rtl' : 'ltr'}
                />
                {!realTimeMode && (
                  <div className="flex space-x-2">
                    <button
                      onClick={translateText}
                      disabled={!inputText.trim() || isTranslating}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-300 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      {isTranslating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Translating with AI...</span>
                        </>
                      ) : (
                        <>
                          <Languages className="w-4 h-4" />
                          <span>Translate with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                {realTimeMode && inputText.length > 0 && inputText.length <= 2 && (
                  <p className="text-xs text-gray-500">Ketik minimal 3 karakter untuk translate AI otomatis</p>
                )}
              </div>

              {/* Output */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {sourceLanguage === 'id' ? 'اللغة العربية' : 'Bahasa Indonesia'}
                </label>
                <div 
                  className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg flex items-start relative"
                  dir={sourceLanguage === 'id' ? 'rtl' : 'ltr'}
                >
                  {translatedText ? (
                    <span className="text-gray-800">{translatedText}</span>
                  ) : (
                    <span className="text-gray-400">
                      {sourceLanguage === 'id' ? 'الترجمة ستظهر هنا...' : 'Terjemahan akan muncul di sini...'}
                    </span>
                  )}
                  {isTranslating && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={playAudio}
                    disabled={!translatedText || isPlaying}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isPlaying ? 'Playing...' : 'Play Audio'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Common Phrases */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Frasa Umum - Klik untuk Coba</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonPhrases.map((phrase, index) => (
              <button
                key={index}
                onClick={() => insertPhrase(phrase.ar)}
                className="p-4 bg-gradient-to-br from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-gray-200 rounded-lg text-left transition-all duration-200 hover:shadow-md group"
              >
                <div className="text-lg font-arabic text-gray-800 group-hover:text-blue-700 mb-1" dir="rtl">
                  {phrase.ar}
                </div>
                <div className="text-sm text-gray-600">
                  {phrase.id}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-3">🤖 AI-Powered Translation</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>• Powered by Claude AI untuk terjemahan akurat</p>
              <p>• Real-time translation saat mengetik</p>
              <p>• Support kalimat kompleks dan konteks</p>
            </div>
            <div>
              <p>• Offline dictionary sebagai backup</p>
              <p>• Audio pronunciation dengan speech synthesis</p>
              <p>• Klik frasa umum untuk latihan cepat</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <p className="text-xs opacity-90">
              ⚡ <strong>Claude AI Translation:</strong> Teknologi terdepan untuk hasil terjemahan yang natural dan kontekstual
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArabicLearningApp;