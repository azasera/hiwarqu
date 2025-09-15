import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Volume2, Settings, Mic, User, Search, Star, ArrowLeft, X } from 'lucide-react';
import { useAPIKey } from './App';

const LahajatiTTSApp = ({ onBack }) => {
  // Gunakan API Key dari environment variable
  const apiKey = import.meta.env.VITE_LAHAJATI_API_KEY || '';
  const { apiKey: contextApiKey, setApiKey } = useAPIKey();
  
  // Prioritaskan API key dari environment, fallback ke context
  const effectiveApiKey = apiKey || contextApiKey;
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [settings, setSettings] = useState({
    speechSpeed: 1.0,
    volume: 1.0,
    professionalQuality: true
  });

  const audioRef = useRef(null);
  const textareaRef = useRef(null);

  // Effect untuk menangani event audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      // Hanya set playing jika belum playing untuk mencegah race condition
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
      
      // Jangan set error untuk AbortError karena ini normal
      if (e.target?.error?.code === 20) { // 20 adalah MEDIA_ERR_ABORTED
        return;
      }
      
      // Handle berbagai jenis error audio
      const errorCode = e.target?.error?.code;
      let errorMessage = 'Error saat memutar audio. Silakan coba lagi.';
      
      switch (errorCode) {
        case 1: // MEDIA_ERR_ABORTED
          return; // Jangan tampilkan error
        case 2: // MEDIA_ERR_NETWORK
          errorMessage = 'Error jaringan saat memuat audio. Periksa koneksi internet.';
          break;
        case 3: // MEDIA_ERR_DECODE
          errorMessage = 'Format audio tidak didukung atau rusak. Generate ulang audio.';
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          errorMessage = 'Format audio tidak didukung browser. Generate ulang audio.';
          break;
        default:
          errorMessage = 'Error tidak dikenal saat memutar audio. Silakan generate ulang.';
      }
      
      setError(errorMessage);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  // Cleanup URL saat komponen unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  // Auto-resize textarea berdasarkan konten
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height untuk mendapatkan scrollHeight yang akurat
      textarea.style.height = 'auto';
      // Set tinggi minimum 160px (h-40) dan maksimum 400px
      const minHeight = 160;
      const maxHeight = 400;
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
    }
  }, [text]);

  // Ambil daftar suara dari API Laa Taskut akhi
  const fetchVoices = async (page = 1) => {
    if (!effectiveApiKey) {
      setError('API Key tidak tersedia. Silakan hubungi administrator.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      let url = `https://lahajati.ai/api/v1/voices?page=${page}&per_page=20`;
      if (filterGender) url += `&gender=${filterGender}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${effectiveApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API Key tidak valid. Periksa kembali API Key Anda');
        } else if (response.status === 403) {
          throw new Error('Akses ditolak. Pastikan API Key memiliki izin yang cukup');
        } else if (response.status === 429) {
          throw new Error('Terlalu banyak permintaan. Coba lagi dalam beberapa saat');
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setVoices(data.data);
        setTotalPages(data.pagination?.total_pages || 1);
        if (!selectedVoice && data.data.length > 0) {
          setSelectedVoice(data.data[0]);
        }
        setSuccess(`Berhasil memuat ${data.data.length} suara!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Format respons tidak valid dari server');
      }
    } catch (err) {
      setError(`Error memuat suara: ${err.message}`);
      console.error('Fetch voices error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate audio menggunakan API Laa Taskut akhi
  const generateSpeech = async () => {
    if (!effectiveApiKey) {
      setError('API Key tidak tersedia. Silakan hubungi administrator.');
      return;
    }
    
    if (!selectedVoice) {
      setError('Silakan pilih suara terlebih dahulu');
      return;
    }
    
    if (!text.trim()) {
      setError('Silakan masukkan teks yang ingin dikonversi');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('https://lahajati.ai/api/v1/text-to-speech-pro', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text.trim(),
          id_voice: selectedVoice.id_voice,
          privacy: false,
          professional_quality: settings.professionalQuality,
          speech_speed: settings.speechSpeed,
          volume: settings.volume
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API Key tidak valid atau kedaluwarsa');
        } else if (response.status === 402) {
          throw new Error('Saldo poin tidak mencukupi');
        } else if (response.status === 403) {
          throw new Error('Akses ditolak atau batas penggunaan terlampaui');
        } else if (response.status === 404) {
          throw new Error('Suara yang dipilih tidak ditemukan');
        } else if (response.status === 429) {
          throw new Error('Terlalu banyak permintaan. Coba lagi dalam beberapa saat');
        }
        
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('audio')) {
        throw new Error('Respons bukan file audio. Periksa konfigurasi API');
      }

      const audioBlob = await response.blob();
      
      // Validasi ukuran blob
      if (audioBlob.size === 0) {
        throw new Error('File audio kosong. Silakan coba lagi.');
      }
      
      // Validasi tipe MIME audio
      if (!audioBlob.type.startsWith('audio/')) {
        throw new Error('File yang diterima bukan format audio yang valid.');
      }
      
      // Cleanup URL lama jika ada
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setSuccess('Audio berhasil dibuat! Anda dapat memutar atau mengunduhnya sekarang.');
      setTimeout(() => setSuccess(''), 5000);

      // Auto load audio ke player
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
        
        // Wait for audio to be ready
        audioRef.current.addEventListener('canplaythrough', () => {
          console.log('Audio ready to play');
        }, { once: true });
      }
    } catch (err) {
      setError(`Error membuat audio: ${err.message}`);
      console.error('Generate speech error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Kontrol audio player
  const playPause = async () => {
    if (!audioRef.current || !audioUrl) {
      setError('Audio belum tersedia. Silakan generate audio terlebih dahulu.');
      return;
    }

    const audio = audioRef.current;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        // Reset error sebelum mencoba play
        setError('');
        
        // Validasi src audio
        if (!audio.src || audio.src !== audioUrl) {
          audio.src = audioUrl;
        }
        
        // Pastikan audio sudah loaded dengan timeout
        if (audio.readyState < 2) {
          audio.load();
          // Tunggu sampai audio ready dengan timeout
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              audio.removeEventListener('canplay', handleCanPlay);
              reject(new Error('Timeout loading audio'));
            }, 5000);
            
            const handleCanPlay = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', handleCanPlay);
              resolve();
            };
            
            audio.addEventListener('canplay', handleCanPlay);
          });
        }
        
        // Set state playing sebelum memanggil play untuk mencegah race condition
        setIsPlaying(true);
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (err) {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
        
        if (err.name === 'NotSupportedError') {
          setError('Format audio tidak didukung browser. Silakan generate ulang audio.');
        } else if (err.name === 'AbortError') {
          // Jangan tampilkan error untuk AbortError karena ini normal saat user mengklik cepat
          console.log('Audio play was aborted, this is normal behavior');
        } else if (err.message === 'Timeout loading audio') {
          setError('Audio membutuhkan waktu terlalu lama untuk dimuat. Silakan generate ulang.');
        } else {
          setError('Gagal memutar audio. Silakan generate ulang atau coba lagi.');
        }
      }
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) {
      setError('Tidak ada audio untuk diunduh. Generate audio terlebih dahulu.');
      return;
    }

    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `lahajati-audio-${new Date().toISOString().slice(0, 16).replace(/:/g, '-')}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setSuccess('Audio berhasil diunduh!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Filter suara berdasarkan pencarian
  const filteredVoices = voices.filter(voice => {
    const matchesSearch = !searchTerm || 
      voice.voice_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voice.dialect?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voice.voice_tags?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Helper function untuk gender
  const getGenderText = (gender) => {
    switch(gender) {
      case 1: return 'Pria';
      case 2: return 'Wanita';
      case 3: return 'Anak';
      default: return 'Tidak diketahui';
    }
  };

  useEffect(() => {
    if (effectiveApiKey && effectiveApiKey.length > 10) {
      fetchVoices(currentPage);
    }
  }, [effectiveApiKey, filterGender, currentPage]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);
      const handleError = () => {
        setIsPlaying(false);
        setError('Error saat memutar audio');
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [audioUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 top-0 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 text-white transition-all duration-200"
              title="Kembali ke Halaman Utama"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Kembali</span>
            </button>
          )}
          
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            🎙️ Laa Taskut akhi Indonesia
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Konversi teks ke suara berkualitas tinggi dengan teknologi AI terdepan. 
            Mendukung 108+ dialek bahasa Arab dengan suara natural seperti penutur asli.
          </p>
        </div>







        {/* Konten utama hanya ditampilkan jika API key tersedia */}
        {effectiveApiKey ? (
          <>
            {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Text Input & Audio Player Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text Input */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <Mic className="w-5 h-5 text-blue-300" />
                <h2 className="text-xl font-semibold text-white">Input Teks</h2>
              </div>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Masukkan teks bahasa Arab yang ingin dikonversi ke suara di sini..."
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-all overflow-hidden"
                dir="rtl"
                style={{ minHeight: '160px' }}
              />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
                <div className="text-blue-200 text-sm space-y-1">
                  <div>Jumlah karakter: {text.length}</div>
                  <div>Suara dipilih: {selectedVoice ? selectedVoice.voice_name : 'Belum dipilih'}</div>
                </div>
                <button
                  onClick={generateSpeech}
                  disabled={isLoading || !effectiveApiKey || !selectedVoice || !text.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2"
                >
                  {isLoading ? '⏳ Memproses...' : '🎤 Generate Audio'}
                </button>
              </div>
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <Volume2 className="w-5 h-5 text-blue-300" />
                  <h2 className="text-xl font-semibold text-white">Audio Player</h2>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-3">
                      <button
                        onClick={playPause}
                        className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </button>
                      <button
                        onClick={downloadAudio}
                        className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                      >
                        <Download className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="text-blue-200 text-sm text-right">
                      <div className="font-medium">{selectedVoice?.voice_name}</div>
                      <div className="opacity-75">{selectedVoice?.dialect}</div>
                    </div>
                  </div>
                </div>
                <audio ref={audioRef} className="hidden" />
              </div>
            )}

            {/* Settings Panel */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5 text-blue-300" />
                <h2 className="text-xl font-semibold text-white">Pengaturan Audio</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-blue-200 text-sm mb-2 font-medium">
                    Kecepatan Bicara: {settings.speechSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={settings.speechSpeed}
                    onChange={(e) => setSettings(prev => ({...prev, speechSpeed: parseFloat(e.target.value)}))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-blue-300 mt-1">
                    <span>0.5x (Lambat)</span>
                    <span>2.0x (Cepat)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-blue-200 text-sm mb-2 font-medium">
                    Volume Audio: {Math.round(settings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={settings.volume}
                    onChange={(e) => setSettings(prev => ({...prev, volume: parseFloat(e.target.value)}))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-blue-300 mt-1">
                    <span>10% (Pelan)</span>
                    <span>100% (Keras)</span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <label className="flex items-center gap-3 text-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.professionalQuality}
                    onChange={(e) => setSettings(prev => ({...prev, professionalQuality: e.target.checked}))}
                    className="w-4 h-4 text-blue-500 bg-white/20 border-white/30 rounded focus:ring-blue-400 focus:ring-2"
                  />
                  <span className="font-medium">Gunakan kualitas profesional (320kbps)</span>
                </label>
                <p className="text-blue-300 text-xs mt-1 ml-7">
                  Mengaktifkan ini akan menghasilkan audio berkualitas tinggi
                </p>
              </div>
            </div>
          </div>

          {/* Voices Selection Panel */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-300" />
                <h2 className="text-xl font-semibold text-white">Pilih Suara</h2>
              </div>
              <button
                onClick={() => fetchVoices(1)}
                disabled={!effectiveApiKey || isLoading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
              >
                {isLoading ? '⏳ Memuat...' : '🔄 Muat Suara'}
              </button>
            </div>

            {/* Voice Filters */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari suara, dialek, atau karakteristik..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              >
                <option value="">Semua Jenis Suara</option>
                <option value="1">Suara Pria</option>
                <option value="2">Suara Wanita</option>
                <option value="3">Suara Anak</option>
              </select>
            </div>

            {/* Voices List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {filteredVoices.length > 0 ? (
                filteredVoices.map((voice) => (
                  <div
                    key={voice.id_voice}
                    onClick={() => setSelectedVoice(voice)}
                    className={`p-4 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] ${
                      selectedVoice?.id_voice === voice.id_voice
                        ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-2 border-blue-400 shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm">{voice.voice_name}</h3>
                        <p className="text-blue-200 text-xs mt-1">
                          {voice.dialect} • {getGenderText(voice.gender)}
                        </p>
                        {voice.voice_tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {voice.voice_tags.split(',').slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white/10 text-blue-300 text-xs rounded-full">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        {voice.is_cloned && <Star className="w-4 h-4 text-yellow-400" title="Suara Kloning" />}
                        {selectedVoice?.id_voice === voice.id_voice && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-blue-200">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Tidak ada suara yang ditemukan</p>
                  <p className="text-xs mt-1">Coba ubah filter pencarian</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all"
                >
                  ← Sebelumnya
                </button>
                <span className="text-blue-200 text-sm font-medium">
                  {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all"
                >
                  Selanjutnya →
                </button>
              </div>
            )}

            {/* Voice Stats */}
            {voices.length > 0 && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-blue-200 text-xs text-center">
                  Total {voices.length} suara • {filteredVoices.length} hasil pencarian
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-400/50 rounded-xl text-red-200 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">❌</span>
              <div>
                <div className="font-medium">Error:</div>
                <div className="text-sm opacity-90">{error}</div>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-400/50 rounded-xl text-green-200 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <div>
                <div className="font-medium">Sukses!</div>
                <div className="text-sm opacity-90">{success}</div>
              </div>
            </div>
          </div>
        )}



        {/* Footer Info */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🚀</span>
            <h3 className="text-lg font-semibold text-white">Dibuat dengan Laa Taskut akhi</h3>
          </div>
          <p className="text-blue-200 text-sm mb-4">
            Platform Text-to-Speech terdepan untuk bahasa Arab dengan teknologi AI yang revolusioner
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-blue-300">
            <span>📊 108+ Dialek</span>
            <span>🎵 Kualitas 320kbps</span>
            <span>⚡ Real-time Processing</span>
            <span>🔒 Privacy Protected</span>
          </div>
        </div>
        </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
              <span className="text-6xl mb-4 block">🔑</span>
              <h2 className="text-2xl font-semibold text-white mb-4">API Key Diperlukan</h2>
              <p className="text-blue-200 mb-6">
                API Key Lahajati.ai belum dikonfigurasi. Silakan hubungi administrator untuk mengatur API Key.
              </p>
              <a 
                href="https://lahajati.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-medium"
              >
                🌐 Kunjungi Lahajati.ai
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LahajatiTTSApp;