import React, { useState } from 'react';
import { Play, Square, Volume2, BookOpen, Loader2, ArrowLeft } from 'lucide-react';

const ArabicTextReader = ({ onBack }) => {
  const [arabicText, setArabicText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [error, setError] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Drew');

  // API credentials
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const LAHAJATI_API_KEY = import.meta.env.VITE_LAHAJATI_API_KEY;
  
  // Voice gratis ElevenLabs yang tersedia
  const FREE_VOICES = {
    'Rachel': '21m00Tcm4TlvDq8ikWAM',      // Perempuan, netral
    'Drew': '29vD33N1CtxCmqQRPOHJ',        // Laki-laki, muda
    'Clyde': '2EiwWnXFnvU5JabPnv8n',       // Laki-laki, tua
    'Bella': 'EXAVITQu4vr4xnSDxMaL',       // Perempuan, muda
    'Antoni': 'ErXwobaYiN019PkySvjV',      // Laki-laki, dewasa
    'Elli': 'MF3mGyEYCl7XYWbV9V6O',        // Perempuan, dewasa
    'Josh': 'TxGEqnHWrfWFTfGW9XjX',        // Laki-laki, muda
    'Arnold': 'VR6AewLTigWG4xSOukaG',      // Laki-laki, dewasa
    'Adam': 'pNInz6obpgDQGcFmaJgB',        // Laki-laki, dewasa (voice yang sedang digunakan)
    'Sam': 'yoZ06aMxZJJ28mfd3POQ'          // Laki-laki, muda
  };
  
  // Menggunakan voice yang dipilih atau default dari env (Drew - suara pria)
  const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || FREE_VOICES[selectedVoice];

  // Contoh teks Arab
  const sampleTexts = [
    'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ'
  ];

  const generateAudio = async () => {
    if (!arabicText.trim()) {
      setError('Silakan masukkan teks Arab terlebih dahulu');
      return;
    }

    setIsLoading(true);
    setError('');
    setAudioUrl(null);

    try {
      // Menghentikan audio yang sedang berjalan
      if (currentAudio) {
        currentAudio.pause();
        setIsPlaying(false);
      }

      // Coba ElevenLabs API terlebih dahulu jika tersedia
      if (ELEVENLABS_API_KEY && ELEVENLABS_VOICE_ID) {
        try {
          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
              text: arabicText,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
                style: 0.0,
                use_speaker_boost: true
              }
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('ElevenLabs API Error:', errorData);
            
            // Jika quota habis, fallback ke Web Speech API
            if (response.status === 401 && errorData.detail?.status === 'quota_exceeded') {
              console.log('ElevenLabs quota exceeded, falling back to Web Speech API');
              await generateAudioWithWebSpeech();
              return;
            }
            
            throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
          }

          // Mengkonversi response ke blob audio
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
          return;

        } catch (elevenLabsError) {
          console.error('ElevenLabs API failed, trying Lahajati TTS:', elevenLabsError);
          
          // Coba Lahajati TTS sebagai fallback kedua
          if (LAHAJATI_API_KEY) {
            try {
              await generateAudioWithLahajati();
              return;
            } catch (lahajatiError) {
              console.error('Lahajati TTS failed, falling back to Web Speech API:', lahajatiError);
              await generateAudioWithWebSpeech();
              return;
            }
          } else {
            // Jika tidak ada Lahajati API key, langsung ke Web Speech API
            console.log('Lahajati API key tidak tersedia, menggunakan Web Speech API');
            await generateAudioWithWebSpeech();
            return;
          }
        }
      } else {
        // Jika tidak ada ElevenLabs API key, coba Lahajati dulu
        if (LAHAJATI_API_KEY) {
          try {
            await generateAudioWithLahajati();
            return;
          } catch (lahajatiError) {
            console.error('Lahajati TTS failed, falling back to Web Speech API:', lahajatiError);
            await generateAudioWithWebSpeech();
            return;
          }
        } else {
          // Jika tidak ada API key sama sekali, langsung gunakan Web Speech API
          await generateAudioWithWebSpeech();
        }
      }

    } catch (err) {
      console.error('Error generating audio:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAudioWithLahajati = async () => {
    if (!LAHAJATI_API_KEY) {
      throw new Error('Lahajati API key tidak tersedia');
    }

    try {
      // Ambil daftar voice dari Lahajati
      const voicesResponse = await fetch('https://lahajati.ai/api/v1/voices?per_page=5', {
        headers: {
          'Authorization': `Bearer ${LAHAJATI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!voicesResponse.ok) {
        throw new Error(`Lahajati voices API error: ${voicesResponse.status}`);
      }

      const voicesData = await voicesResponse.json();
      const voices = voicesData.data || [];
      
      if (voices.length === 0) {
        throw new Error('Tidak ada voice tersedia dari Lahajati');
      }

      // Pilih voice pertama yang tersedia
      const selectedLahajatiVoice = voices[0];

      // Generate audio menggunakan Lahajati
      const response = await fetch('https://lahajati.ai/api/v1/text-to-speech-pro', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LAHAJATI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: arabicText,
          id_voice: selectedLahajatiVoice.id_voice,
          privacy: false,
          professional_quality: true,
          speech_speed: 1.0,
          volume: 1.0
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Lahajati API key tidak valid');
        } else if (response.status === 402) {
          throw new Error('Saldo Lahajati tidak mencukupi');
        } else if (response.status === 429) {
          throw new Error('Terlalu banyak permintaan ke Lahajati');
        }
        throw new Error(`Lahajati API error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('audio')) {
        throw new Error('Respons Lahajati bukan file audio');
      }

      const audioBlob = await response.blob();
      
      if (audioBlob.size === 0) {
        throw new Error('File audio Lahajati kosong');
      }
      
      if (!audioBlob.type.startsWith('audio/')) {
        throw new Error('File Lahajati bukan format audio yang valid');
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      console.log('Lahajati TTS berhasil digunakan');
      
    } catch (err) {
      console.error('Lahajati TTS error:', err);
      throw err;
    }
  };

  const generateAudioWithWebSpeech = async () => {
    return new Promise((resolve, reject) => {
      // Cek apakah browser mendukung Web Speech API
      if (!('speechSynthesis' in window)) {
        reject(new Error('Browser tidak mendukung Text-to-Speech. Silakan gunakan browser yang lebih baru.'));
        return;
      }

      // Hentikan speech yang sedang berjalan
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(arabicText);
      
      // Tunggu voices dimuat jika belum tersedia
      const setVoice = () => {
        const voices = speechSynthesis.getVoices();
        const arabicVoice = voices.find(voice => 
          voice.lang.startsWith('ar') || 
          voice.name.toLowerCase().includes('arabic') ||
          voice.name.toLowerCase().includes('arab')
        );
        
        if (arabicVoice) {
          utterance.voice = arabicVoice;
        } else {
          // Fallback ke voice default
          utterance.lang = 'ar-SA';
        }
      };

      // Coba set voice langsung
      setVoice();
      
      // Jika voices belum dimuat, tunggu event voiceschanged
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = () => {
          setVoice();
          speechSynthesis.onvoiceschanged = null; // Hapus listener setelah digunakan
        };
      }

      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log('Web Speech API started');
        setIsPlaying(true);
      };

      utterance.onend = () => {
        console.log('Web Speech API ended');
        setIsPlaying(false);
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Web Speech API error:', event);
        setIsPlaying(false);
        reject(new Error(`Web Speech API error: ${event.error}`));
      };

      // Simpan utterance untuk kontrol
      setCurrentAudio(utterance);
      
      speechSynthesis.speak(utterance);
    });
  };

  const playAudio = () => {
    if (audioUrl) {
      // Untuk audio dari ElevenLabs
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      audio.onerror = () => {
        setError('Gagal memutar audio');
        setIsPlaying(false);
        setCurrentAudio(null);
      };

      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('Gagal memutar audio');
        setIsPlaying(false);
      });
    } else if (currentAudio && currentAudio instanceof SpeechSynthesisUtterance) {
      // Untuk Web Speech API - langsung mulai speak
      speechSynthesis.speak(currentAudio);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      if (audioUrl) {
        // Untuk audio dari ElevenLabs
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } else {
        // Untuk Web Speech API
        speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  const insertSampleText = (text) => {
    setArabicText(text);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          {onBack && (
            <div className="mb-6">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all duration-200"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Kembali ke Beranda</span>
              </button>
            </div>
          )}
          
          <div className="text-center">
             <div className="flex items-center justify-center mb-4">
               <BookOpen className="w-10 h-10 text-emerald-600 mr-3" />
               <h1 className="text-4xl font-bold text-emerald-800">قارئ النصوص العربية</h1>
             </div>
             <h2 className="text-2xl font-semibold text-emerald-700 mb-2">Pembaca Teks Arab untuk Istima'</h2>
             <p className="text-emerald-600">Masukkan teks Arab dan dengarkan bacaannya dengan suara yang jelas</p>
           </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Sample Texts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-emerald-800 mb-3">Contoh Teks Arab:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sampleTexts.map((text, index) => (
                <button
                  key={index}
                  onClick={() => insertSampleText(text)}
                  className="p-3 text-right bg-gray-50 hover:bg-emerald-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-all duration-200 text-lg text-gray-900"
                  style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selection */}
          {ELEVENLABS_API_KEY && (
            <div className="mb-6">
              <label htmlFor="voiceSelect" className="block text-lg font-semibold text-emerald-800 mb-3">
                🎤 Pilih Voice ElevenLabs:
              </label>
              <select
                id="voiceSelect"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-gray-900"
              >
                {Object.keys(FREE_VOICES).map(voiceName => (
                  <option key={voiceName} value={voiceName}>
                    {voiceName} {voiceName === 'Drew' ? '(Default - Laki-laki, Muda)' : 
                                voiceName === 'Rachel' ? '(Perempuan, Netral)' :
                                voiceName === 'Clyde' ? '(Laki-laki, Tua)' :
                                voiceName === 'Bella' ? '(Perempuan, Muda)' :
                                voiceName === 'Antoni' ? '(Laki-laki, Dewasa)' :
                                voiceName === 'Elli' ? '(Perempuan, Dewasa)' :
                                voiceName === 'Josh' ? '(Laki-laki, Muda)' :
                                voiceName === 'Arnold' ? '(Laki-laki, Dewasa)' :
                                voiceName === 'Adam' ? '(Laki-laki, Dewasa)' :
                                voiceName === 'Sam' ? '(Laki-laki, Muda)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-2">
                💡 Semua voice di atas adalah voice gratis ElevenLabs (10.000 karakter/bulan)
              </p>
            </div>
          )}

          {/* Text Input */}
          <div className="mb-6">
            <label htmlFor="arabicText" className="block text-lg font-semibold text-emerald-800 mb-3">
              النص العربي - Teks Arab:
            </label>
            <textarea
              id="arabicText"
              value={arabicText}
              onChange={(e) => {
                setArabicText(e.target.value);
                setError('');
              }}
              className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none text-xl text-right text-gray-900"
              style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}
              placeholder="أدخل النص العربي هنا..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <button
              onClick={generateAudio}
              disabled={isLoading || !arabicText.trim()}
              className="flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Volume2 className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Memproses...' : 'Buat Audio'}
            </button>

            {(audioUrl || currentAudio) && (
              <>
                <button
                  onClick={playAudio}
                  disabled={isPlaying}
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isPlaying ? 'Sedang Diputar...' : 'Putar Audio'}
                </button>

                {isPlaying && (
                  <button
                    onClick={stopAudio}
                    className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop
                  </button>
                )}
              </>
            )}
          </div>

          {/* Status Information */}
          <div className="mb-6">
            {ELEVENLABS_API_KEY && ELEVENLABS_VOICE_ID ? (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-r-lg">
                <p className="font-medium">🎤 ElevenLabs API tersedia</p>
                <p className="text-sm">
                  Voice aktif: <strong>{selectedVoice}</strong> (Suara Pria - Gratis 10.000 karakter/bulan)
                </p>
                <p className="text-sm">
                  Chain fallback: ElevenLabs → {LAHAJATI_API_KEY ? 'Lahajati TTS' : 'Web Speech API'} → Web Speech API
                </p>
              </div>
            ) : LAHAJATI_API_KEY ? (
              <div className="p-4 bg-purple-50 border-l-4 border-purple-500 text-purple-700 rounded-r-lg">
                <p className="font-medium">🎙️ Lahajati TTS tersedia</p>
                <p className="text-sm">Menggunakan TTS Arab berkualitas tinggi dengan 108+ dialek</p>
                <p className="text-sm">Chain fallback: Lahajati TTS → Web Speech API</p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 rounded-r-lg">
                <p className="font-medium">🔊 Web Speech API</p>
                <p className="text-sm">Menggunakan Text-to-Speech browser. Untuk kualitas suara yang lebih baik, silakan konfigurasi ElevenLabs atau Lahajati API key.</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg mb-6">
              <p className="font-medium">خطأ - Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Audio Player (hidden, for control) */}
          {audioUrl && (
            <div className="text-center">
              <div className="inline-flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <Volume2 className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-700 font-medium">Audio siap diputar!</span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-emerald-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3">كيفية الاستخدام - Cara Penggunaan:</h3>
          <ul className="space-y-2 text-emerald-700">
            <li>• <strong>Pilih Voice:</strong> Default suara pria (Drew), pilih voice ElevenLabs yang diinginkan (semua gratis)</li>
            <li>• Pilih salah satu contoh teks Arab atau ketik teks Arab Anda sendiri</li>
            <li>• Klik tombol "Buat Audio" untuk menghasilkan suara bacaan</li>
            <li>• Setelah audio dibuat, klik "Putar Audio" untuk mendengarkan</li>
            <li>• Gunakan tombol "Stop" untuk menghentikan audio</li>
            <li>• Aplikasi ini cocok untuk latihan istima' (mendengar) bahasa Arab</li>
            <li>• <strong>Chain Fallback:</strong> ElevenLabs → Lahajati TTS → Web Speech API (otomatis)</li>
            <li>• <strong>Kualitas Suara:</strong> ElevenLabs (gratis) → Lahajati (108+ dialek Arab) → Web Speech (standar)</li>
            <li>• <strong>Voice Gratis:</strong> ElevenLabs 10.000 karakter/bulan, Lahajati sesuai saldo</li>
          </ul>
        </div>
      </div>


    </div>
  );
};

export default ArabicTextReader;