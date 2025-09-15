import React, { useState, useEffect, createContext, useContext } from 'react';
import { Upload, Download, Search, Settings, Book, Sun, Moon, Plus, Minus, Copy, Eye, EyeOff, Grid, List, FileText, BookOpen, Trash2, Edit3, Languages, BookMarked, X, Check, ArrowRight, Mic, Volume2, Play, Square } from 'lucide-react';
import { SupabaseDB, Hiwar, VocabEntry } from './supabase';
import LahajatiTTSApp from './LahajatiTTS';
import ArabicTextReader from './ArabicTextReader';

// Use Supabase instead of IndexedDB for centralized data

// Use Supabase database service
const db = new SupabaseDB();

// All database methods are now handled by SupabaseDB instance

// Database operations moved to SupabaseDB class

// All database operations now handled by SupabaseDB instance

// Types (Hiwar and VocabEntry imported from supabase.ts)
interface HiwarLine {
  id: number;
  speaker: string;
  text_ar: string;
  text_id: string;
  ref?: string | null;
}

interface HiwarContextType {
  hiwarList: Hiwar[];
  currentHiwar: Hiwar | null;
  isLoading: boolean;
  loadHiwarList: () => Promise<void>;
  addHiwar: (hiwar: Hiwar) => Promise<void>;
  updateHiwar: (hiwar: Hiwar) => Promise<void>;
  deleteHiwar: (id: string) => Promise<void>;
  loadHiwar: (id: string) => Promise<void>;
  setCurrentHiwar: (hiwar: Hiwar | null) => void;
  exportHiwar: (hiwar: Hiwar) => void;
  exportAllHiwar: () => void;
  searchHiwar: (query: string) => Promise<Hiwar[]>;
  // Vocabulary methods
  vocabList: VocabEntry[];
  loadVocabList: () => Promise<void>;
  addVocab: (vocab: VocabEntry) => Promise<void>;
  deleteVocab: (id: string) => Promise<void>;
  updateVocab: (vocab: VocabEntry) => Promise<void>;
  searchVocab: (query: string) => Promise<VocabEntry[]>;
  getVocabByArabic: (arabic: string) => Promise<VocabEntry[]>;
}

// Global state context
const HiwarContext = createContext<HiwarContextType | null>(null);

const useHiwarStore = () => {
  const context = useContext(HiwarContext);
  if (!context) {
    throw new Error('useHiwarStore must be used within HiwarProvider');
  }
  return context;
};

// Provider component
const HiwarProvider = ({ children }: { children: React.ReactNode }) => {
  const [hiwarList, setHiwarList] = useState<Hiwar[]>([]);
  const [currentHiwar, setCurrentHiwar] = useState<Hiwar | null>(null);
  const [vocabList, setVocabList] = useState<VocabEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDB = async () => {
      try {
        await loadHiwarList();
        
        // Add demo data if empty
        const list = await db.getAllHiwar();
        if (list.length === 0) {
          await db.addDemoData();
          await loadHiwarList();
        }
        
        // Load vocabulary
        await loadVocabList();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initDB();
  }, []);

  // Demo data functions moved to SupabaseDB class

  // Demo vocabulary function moved to SupabaseDB class

  const loadHiwarList = async () => {
    try {
      const list = await db.getAllHiwar();
      setHiwarList(list);
    } catch (error) {
      console.error('Failed to load hiwar list:', error);
    }
  };

  const addHiwar = async (hiwar: Hiwar) => {
    try {
      await db.addHiwar(hiwar);
      await loadHiwarList();
    } catch (error) {
      console.error('Failed to add hiwar:', error);
      throw error;
    }
  };

  const updateHiwar = async (hiwar: Hiwar) => {
    try {
      await db.updateHiwar(hiwar);
      await loadHiwarList();
      if (currentHiwar && currentHiwar.id === hiwar.id) {
        setCurrentHiwar(hiwar);
      }
    } catch (error) {
      console.error('Failed to update hiwar:', error);
      throw error;
    }
  };

  const deleteHiwar = async (id: string) => {
    try {
      await db.deleteHiwar(id);
      await loadHiwarList();
      if (currentHiwar && currentHiwar.id === id) {
        setCurrentHiwar(null);
      }
    } catch (error) {
      console.error('Failed to delete hiwar:', error);
      throw error;
    }
  };

  const loadHiwar = async (id: string) => {
    try {
      const hiwar = await db.getHiwar(id);
      setCurrentHiwar(hiwar);
    } catch (error) {
      console.error('Failed to load hiwar:', error);
      throw error;
    }
  };

  const exportHiwar = (hiwar: Hiwar) => {
    const dataStr = JSON.stringify(hiwar, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${hiwar.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAllHiwar = () => {
    const dataStr = JSON.stringify(hiwarList, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'all-hiwar.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const searchHiwar = async (query: string) => {
    try {
      return await db.searchHiwar(query);
    } catch (error) {
      console.error('Failed to search hiwar:', error);
      return [];
    }
  };

  // Vocabulary functions
  const loadVocabList = async () => {
    try {
      const list = await db.getAllVocab();
      setVocabList(list);
    } catch (error) {
      console.error('Failed to load vocab list:', error);
    }
  };

  const addVocab = async (vocab: VocabEntry) => {
    try {
      await db.addVocab(vocab);
      await loadVocabList();
    } catch (error) {
      console.error('Failed to add vocab:', error);
      throw error;
    }
  };

  const deleteVocab = async (id: string) => {
    try {
      await db.deleteVocab(id);
      await loadVocabList();
    } catch (error) {
      console.error('Failed to delete vocab:', error);
      throw error;
    }
  };

  const updateVocab = async (vocab: VocabEntry) => {
    try {
      await db.updateVocab(vocab);
      await loadVocabList();
    } catch (error) {
      console.error('Failed to update vocab:', error);
      throw error;
    }
  };

  const searchVocab = async (query: string) => {
    try {
      return await db.searchVocab(query);
    } catch (error) {
      console.error('Failed to search vocab:', error);
      return [];
    }
  };

  const getVocabByArabic = async (arabic: string) => {
    try {
      return await db.getVocabByArabic(arabic);
    } catch (error) {
      console.error('Failed to get vocab by arabic:', error);
      return [];
    }
  };

  return (
    <HiwarContext.Provider value={{
      hiwarList,
      currentHiwar,
      isLoading,
      loadHiwarList,
      addHiwar,
      deleteHiwar,
      loadHiwar,
      setCurrentHiwar,
      exportHiwar,
      exportAllHiwar,
      searchHiwar,
      // Vocabulary
      vocabList,
      loadVocabList,
      addVocab,
      deleteVocab,
      updateVocab,
      searchVocab,
      getVocabByArabic,
      updateHiwar
    }}>
      {children}
    </HiwarContext.Provider>
  );
};

// Settings context for UI preferences
const SettingsContext = createContext();

const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hiwar-settings');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      fontSize: 22,
      showTranslation: true,
      viewMode: 'dual', // dual, stacked
      columnWidth: 'normal', // narrow, normal, wide
      showLineNumbers: false
    };
  });

  useEffect(() => {
    localStorage.setItem('hiwar-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// API Key Context
export const APIKeyContext = createContext();

export const useAPIKey = () => {
  const context = useContext(APIKeyContext);
  if (!context) {
    throw new Error('useAPIKey must be used within APIKeyProvider');
  }
  return context;
};

const APIKeyProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('lahajati-api-key') || '';
  });

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('lahajati-api-key', apiKey);
    } else {
      localStorage.removeItem('lahajati-api-key');
    }
  }, [apiKey]);

  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('lahajati-api-key');
  };

  return (
    <APIKeyContext.Provider value={{ apiKey, setApiKey, clearApiKey }}>
      {children}
    </APIKeyContext.Provider>
  );
};

// Arabic Text Component
const ArabicText = ({ children, className = '', style = {}, onClick = null, selectable = false }) => {
  const { settings } = useSettings();
  
  return (
    <div 
      dir="rtl"
      className={`font-arabic leading-relaxed ${className} ${selectable ? 'cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded px-1 transition-colors' : ''}`}
      style={{
        fontSize: `${settings.fontSize}px`,
        fontFamily: "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif",
        textAlign: 'center',
        ...style
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Add Vocabulary Modal Component  
const AddVocabModal = ({ isOpen, onClose, onSave }) => {
  const [arabicText, setArabicText] = useState('');
  const [translation, setTranslation] = useState('');
  const [category, setCategory] = useState('umum');
  const [root, setRoot] = useState('');
  const [examples, setExamples] = useState('');

  useEffect(() => {
    if (isOpen) {
      setArabicText('');
      setTranslation('');
      setCategory('umum');
      setRoot('');
      setExamples('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!arabicText.trim() || !translation.trim()) return;
    
    const vocabEntry: VocabEntry = {
      id: `vocab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      arabic: arabicText.trim(),
      indonesian: translation.trim(),
      root: root.trim() || undefined,
      category: category,
      examples: examples.trim() ? [examples.trim()] : undefined,
      frequency: 1,
      meta: {
        created_at: new Date().toISOString(),
        source: 'manual_add'
      }
    };
    
    onSave(vocabEntry);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-md shadow-2xl border border-white/20 dark:border-slate-700/30 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Plus size={20} className="text-blue-600 dark:text-blue-400" />
            Tambah Kosakata
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Arabic Text Input */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Teks Arab:</label>
          <input
            type="text"
            value={arabicText}
            onChange={(e) => setArabicText(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أكتب النص العربي"
            dir="rtl"
          />
        </div>

        {/* Translation Input */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Terjemahan Indonesia:</label>
          <input
            type="text"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan terjemahan..."
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Kategori:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="umum">Umum</option>
            <option value="fiil">Fiil (Kata Kerja)</option>
            <option value="isim">Isim (Kata Benda)</option>
            <option value="sifat">Sifat (Kata Sifat)</option>
            <option value="salam">Salam</option>
            <option value="doa">Doa</option>
            <option value="adab">Adab</option>
            <option value="istifham">Istifham (Tanya)</option>
            <option value="profesi">Profesi</option>
          </select>
        </div>

        {/* Root (optional) */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Akar Kata (opsional):</label>
          <input
            type="text"
            value={root}
            onChange={(e) => setRoot(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ج-م-ل"
            dir="rtl"
          />
        </div>

        {/* Examples (optional) */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Contoh Penggunaan (opsional):</label>
          <textarea
            value={examples}
            onChange={(e) => setExamples(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Contoh kalimat dalam Arab..."
            dir="rtl"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!arabicText.trim() || !translation.trim()}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check size={16} />
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Vocabulary Modal Component
const EditVocabModal = ({ isOpen, onClose, vocab, onSave }) => {
  const [arabicText, setArabicText] = useState(vocab?.arabic || '');
  const [translation, setTranslation] = useState(vocab?.indonesian || '');
  const [category, setCategory] = useState(vocab?.category || 'umum');
  const [root, setRoot] = useState(vocab?.root || '');
  const [examples, setExamples] = useState((vocab?.examples && vocab.examples[0]) || '');

  useEffect(() => {
    if (isOpen && vocab) {
      setArabicText(vocab.arabic || '');
      setTranslation(vocab.indonesian || '');
      setCategory(vocab.category || 'umum');
      setRoot(vocab.root || '');
      setExamples((vocab.examples && vocab.examples[0]) || '');
    }
  }, [isOpen, vocab]);

  const handleSave = () => {
    if (!arabicText.trim() || !translation.trim()) return;
    const updated: VocabEntry = {
      ...vocab,
      arabic: arabicText.trim(),
      indonesian: translation.trim(),
      root: root.trim() || undefined,
      category,
      examples: examples.trim() ? [examples.trim()] : undefined,
      meta: {
        ...(vocab?.meta || { created_at: new Date().toISOString() }),
        updated_at: new Date().toISOString(),
      },
    };
    onSave(updated);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-md shadow-2xl border border-white/20 dark:border-slate-700/30 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Edit3 size={20} className="text-emerald-600 dark:text-emerald-400" />
            Edit Kosakata
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Arabic Text */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Teks Arab:</label>
          <input
            type="text"
            value={arabicText}
            onChange={(e) => setArabicText(e.target.value)}
            className="w-full p-3 border border-gray-400 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            placeholder="أكتب النص العربي"
            dir="rtl"
          />
        </div>

        {/* Translation Input */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Terjemahan Indonesia:</label>
          <input
            type="text"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="w-full p-3 border border-gray-400 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            placeholder="Masukkan terjemahan..."
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Kategori:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-400 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="umum">Umum</option>
            <option value="fiil">Fiil (Kata Kerja)</option>
            <option value="isim">Isim (Kata Benda)</option>
            <option value="sifat">Sifat (Kata Sifat)</option>
            <option value="salam">Salam</option>
            <option value="doa">Doa</option>
            <option value="adab">Adab</option>
            <option value="istifham">Istifham (Tanya)</option>
            <option value="profesi">Profesi</option>
          </select>
        </div>

        {/* Root */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Akar Kata (opsional):</label>
          <input
            type="text"
            value={root}
            onChange={(e) => setRoot(e.target.value)}
            className="w-full p-3 border border-gray-400 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            placeholder="ج-م-ل"
            dir="rtl"
          />
        </div>

        {/* Examples */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Contoh (opsional):</label>
          <textarea
            value={examples}
            onChange={(e) => setExamples(e.target.value)}
            className="w-full p-3 border border-gray-400 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            rows={2}
            placeholder="Contoh kalimat dalam Arab..."
            dir="rtl"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20">Batal</button>
          <button onClick={handleSave} disabled={!arabicText.trim() || !translation.trim()} className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
};

// Manual Hiwar Creation Component
const ManualHiwarModal = ({ isOpen, onClose, onSave }) => {
  const [title_ar, setTitleAr] = useState('');
  const [title_id, setTitleId] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [lines, setLines] = useState([
    { speaker: '', text_ar: '', text_id: '' },
    { speaker: '', text_ar: '', text_id: '' }
  ]);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setTitleAr('');
      setTitleId('');
      setDescription('');
      setTags('');
      setLines([
        { speaker: '', text_ar: '', text_id: '' },
        { speaker: '', text_ar: '', text_id: '' }
      ]);
    }
  }, [isOpen]);

  const addLine = () => {
    setLines([...lines, { speaker: '', text_ar: '', text_id: '' }]);
  };

  const removeLine = (index) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index, field, value) => {
    const updatedLines = [...lines];
    updatedLines[index][field] = value;
    setLines(updatedLines);
  };

  const handleSave = () => {
    if (!title_ar.trim() || !title_id.trim()) return;
    
    // Filter out empty lines and ensure valid lines
    const validLines = lines.filter(line => 
      line.text_ar.trim() && line.text_id.trim()
    ).map((line, index) => ({
      id: index + 1,
      speaker: line.speaker.trim() || `Speaker ${index + 1}`,
      text_ar: line.text_ar.trim(),
      text_id: line.text_id.trim()
    }));

    if (validLines.length === 0) return;

    const hiwarData = {
      id: `manual-hiwar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title_ar: title_ar.trim(),
      title_id: title_id.trim(),
      description: description.trim() || 'Manual hiwar creation',
      tags: tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : ['manual'],
      lines: validLines,
      meta: {
        created_at: new Date().toISOString(),
        source: 'manual_creation',
        total_lines: validLines.length,
        language_pair: 'ar-id'
      }
    };

    onSave(hiwarData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-2xl p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-4xl shadow-2xl border border-white/20 dark:border-slate-700/30 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 sm:gap-3">
            <Plus size={20} className="sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Buat Hiwar Manual</span>
            <span className="sm:hidden">Buat Hiwar</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Title Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Judul Arab (العربية) *
              </label>
              <input
                type="text"
                value={title_ar}
                onChange={(e) => setTitleAr(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="عنوان الحوار"
                dir="rtl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Judul Indonesia *
              </label>
              <input
                type="text"
                value={title_id}
                onChange={(e) => setTitleId(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Judul hiwar dalam Bahasa Indonesia"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Deskripsi (opsional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Deskripsi singkat tentang hiwar ini..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Tag (pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="percakapan, sehari-hari, pemula"
            />
          </div>

          {/* Dialogue Lines */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Dialog Hiwar
              </h3>
              <button
                onClick={addLine}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <Plus size={16} />
                Tambah Baris
              </button>
            </div>

            <div className="space-y-4">
              {lines.map((line, index) => (
                <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Baris {index + 1}
                    </span>
                    {lines.length > 1 && (
                      <button
                        onClick={() => removeLine(index)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {/* Speaker */}
                    <div>
                      <input
                        type="text"
                        value={line.speaker}
                        onChange={(e) => updateLine(index, 'speaker', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder={`Pembicara ${index + 1} (opsional)`}
                      />
                    </div>

                    {/* Arabic Text */}
                    <div>
                      <textarea
                        value={line.text_ar}
                        onChange={(e) => updateLine(index, 'text_ar', e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        rows={2}
                        placeholder="النص العربي..."
                        dir="rtl"
                      />
                    </div>

                    {/* Indonesian Text */}
                    <div>
                      <textarea
                        value={line.text_id}
                        onChange={(e) => updateLine(index, 'text_id', e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        placeholder="Terjemahan dalam Bahasa Indonesia..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={!title_ar.trim() || !title_id.trim() || !lines.some(line => line.text_ar.trim() && line.text_id.trim())}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              <Check size={20} />
              Simpan Hiwar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Hiwar Modal Component
const EditHiwarModal = ({ isOpen, onClose, hiwar, onSave }) => {
  const [title_ar, setTitleAr] = useState(hiwar?.title_ar || '');
  const [title_id, setTitleId] = useState(hiwar?.title_id || '');
  const [tags, setTags] = useState(hiwar ? hiwar.tags.join(', ') : '');
  const [lines, setLines] = useState(hiwar?.lines || []);

  useEffect(() => {
    if (isOpen && hiwar) {
      setTitleAr(hiwar.title_ar || '');
      setTitleId(hiwar.title_id || '');
      setTags((hiwar.tags || []).join(', '));
      setLines(hiwar.lines || []);
    }
  }, [isOpen, hiwar]);

  const updateLine = (index, field, value) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const addLine = () => {
    setLines([...lines, { speaker: '', text_ar: '', text_id: '' }]);
  };

  const removeLine = (index) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    const validLines = lines
      .filter(l => (l.text_ar || '').trim() || (l.text_id || '').trim())
      .map((l, i) => ({
        id: i + 1,
        speaker: (l.speaker || '').trim(),
        text_ar: (l.text_ar || '').trim(),
        text_id: (l.text_id || '').trim(),
        ref: l.ref || null
      }));
    const data = {
      title_ar: title_ar.trim(),
      title_id: title_id.trim(),
      tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      lines: validLines
    };
    onSave(data);
  };

  if (!isOpen || !hiwar) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-2xl p-4 sm:p-6 w-full max-w-4xl shadow-2xl border border-white/20 dark:border-slate-700/30 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Edit Hiwar</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Judul Arab</label>
              <input type="text" value={title_ar} onChange={(e)=>setTitleAr(e.target.value)} dir="rtl" className="w-full p-3 border border-gray-400 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-300" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Judul Indonesia</label>
              <input type="text" value={title_id} onChange={(e)=>setTitleId(e.target.value)} className="w-full p-3 border border-gray-400 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-300" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Tag (pisahkan dengan koma)</label>
            <input type="text" value={tags} onChange={(e)=>setTags(e.target.value)} className="w-full p-3 border border-gray-400 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-300" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Dialog Hiwar</h3>
              <button onClick={addLine} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 text-emerald-700 dark:text-emerald-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                <Plus size={16} /> Tambah Baris
              </button>
            </div>
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-700/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" value={line.speaker || ''} onChange={(e)=>updateLine(index,'speaker',e.target.value)} className="p-2 border border-gray-400 dark:border-slate-500 rounded bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-300" placeholder={`Pembicara ${index+1} (opsional)`} />
                    <textarea value={line.text_ar || ''} onChange={(e)=>updateLine(index,'text_ar',e.target.value)} dir="rtl" rows={2} className="p-2 border border-gray-400 dark:border-slate-500 rounded bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-300" placeholder="النص العربي..." />
                    <textarea value={line.text_id || ''} onChange={(e)=>updateLine(index,'text_id',e.target.value)} rows={2} className="p-2 border border-gray-400 dark:border-slate-500 rounded bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-300" placeholder="Terjemahan..." />
                  </div>
                  {lines.length > 1 && (
                    <div className="mt-2 text-right">
                      <button onClick={()=>removeLine(index)} className="px-2 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20">Hapus</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={onClose}
              title="Batal"
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 min-w-[110px]"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              title="Simpan Perubahan"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white min-w-[170px]"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Translation Modal Component (for clicking on words)
const TranslationModal = ({ isOpen, onClose, arabicText, onSave }) => {
  const [translation, setTranslation] = useState('');
  const [category, setCategory] = useState('umum');
  const [root, setRoot] = useState('');
  const [examples, setExamples] = useState('');
  const { getVocabByArabic } = useHiwarStore();
  const [existingVocab, setExistingVocab] = useState([]);

  useEffect(() => {
    if (isOpen && arabicText) {
      // Check if vocabulary already exists
      getVocabByArabic(arabicText).then(setExistingVocab);
      setTranslation('');
      setCategory('umum');
      setRoot('');
      setExamples('');
    }
  }, [isOpen, arabicText]);

  const handleSave = () => {
    if (!translation.trim()) return;
    
    const vocabEntry: VocabEntry = {
      id: `vocab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      arabic: arabicText,
      indonesian: translation.trim(),
      root: root.trim() || undefined,
      category: category,
      examples: examples.trim() ? [examples.trim()] : undefined,
      frequency: 1,
      meta: {
        created_at: new Date().toISOString(),
        source: 'manual_translation'
      }
    };
    
    onSave(vocabEntry);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-md shadow-2xl border border-white/20 dark:border-slate-700/30 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Languages size={20} className="text-emerald-600 dark:text-emerald-400" />
            Tambah Terjemahan
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Arabic Text */}
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-700/50">
          <label className="text-sm font-medium text-emerald-700 dark:text-emerald-300 block mb-1">Teks Arab:</label>
          <ArabicText className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
            {arabicText}
          </ArabicText>
        </div>

        {/* Existing Vocabulary */}
        {existingVocab.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
            <label className="text-sm font-medium text-blue-700 dark:text-blue-300 block mb-2">Sudah Ada dalam Kamus:</label>
            {existingVocab.map((vocab, index) => (
              <div key={index} className="text-sm text-blue-800 dark:text-blue-200">
                <strong>{vocab.category}:</strong> {vocab.indonesian}
                {vocab.root && <span className="text-blue-600 dark:text-blue-400"> (Akar: {vocab.root})</span>}
              </div>
            ))}
          </div>
        )}

        {/* Translation Input */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Terjemahan Indonesia:</label>
          <input
            type="text"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Masukkan terjemahan..."
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Kategori:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="umum">Umum</option>
            <option value="fiil">Fiil (Kata Kerja)</option>
            <option value="isim">Isim (Kata Benda)</option>
            <option value="sifat">Sifat (Kata Sifat)</option>
            <option value="salam">Salam</option>
            <option value="doa">Doa</option>
            <option value="adab">Adab</option>
            <option value="istifham">Istifham (Tanya)</option>
            <option value="profesi">Profesi</option>
          </select>
        </div>

        {/* Root (optional) */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Akar Kata (opsional):</label>
          <input
            type="text"
            value={root}
            onChange={(e) => setRoot(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="ج-م-ل"
            dir="rtl"
          />
        </div>

        {/* Examples (optional) */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Contoh Penggunaan (opsional):</label>
          <textarea
            value={examples}
            onChange={(e) => setExamples(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            rows={2}
            placeholder="Contoh kalimat dalam Arab..."
            dir="rtl"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!translation.trim()}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check size={16} />
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

// Vocabulary Dictionary Component
const VocabularyDictionary = ({ onBack }) => {
  const { vocabList, deleteVocab, addVocab, updateVocab } = useHiwarStore();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState(null);

  // Get unique categories
  const allCategories = [...new Set(vocabList.map(v => v.category))];

  // Filter vocabulary
  const filteredVocab = vocabList.filter(vocab => {
    const matchesSearch = searchQuery === '' || 
      vocab.arabic.includes(searchQuery) ||
      vocab.indonesian?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vocab.root?.includes(searchQuery) ||
      vocab.examples?.some(ex => ex.includes(searchQuery));
    
    const matchesCategory = selectedCategory === '' || vocab.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleDeleteConfirm = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kosakata ini?')) {
      deleteVocab(id);
    }
  };

  const handleAddVocab = (vocabEntry: VocabEntry) => {
    addVocab(vocabEntry);
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200/60 dark:border-slate-700/60 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              ← Kembali ke Daftar
            </button>
            
            <div className="text-center flex-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-slate-100 flex items-center justify-center gap-3">
                <BookMarked size={28} className="text-gray-700 dark:text-slate-300" />
                Kamus Mufrodat
              </h1>
              
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300/70 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Plus size={18} />
              Tambah
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Cari kosakata Arab atau terjemahan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300/70 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-600 focus:border-gray-400"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 border border-gray-300/70 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-600 focus:border-gray-400"
            >
              <option value="">Semua Kategori</option>
              {allCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {filteredVocab.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-10 border border-gray-200/60 dark:border-slate-700/60 shadow-sm">
              <BookMarked size={48} className="mx-auto mb-3 text-gray-400 dark:text-slate-500" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-slate-300 mb-1">
                {vocabList.length === 0 ? 'Belum ada kosakata' : 'Tidak ada kosakata yang sesuai'}
              </h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6">
                {vocabList.length === 0 
                  ? 'Mulai tambahkan kosakata untuk membangun kamus Anda'
                  : 'Coba ubah kata kunci pencarian atau filter kategori'
                }
              </p>
              {vocabList.length === 0 && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-5 py-2.5 border border-gray-300/70 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Tambah Kosakata Pertama
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredVocab.map(vocab => (
              <VocabCard
                key={vocab.id}
                vocab={vocab}
                onDelete={handleDeleteConfirm}
                onEdit={(v) => { setEditingVocab(v); setIsEditModalOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Vocabulary Modal */}
      <AddVocabModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddVocab}
      />

      {/* Edit Vocab Modal - reuse AddVocabModal with initial values */}
      {isEditModalOpen && editingVocab && (
        <EditVocabModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          vocab={editingVocab}
          onSave={(updated) => {
            updateVocab(updated);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Vocabulary Card Component
const VocabCard = ({ vocab, onDelete, onEdit }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 border border-white/20 dark:border-slate-700/30 group">
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200/50 dark:border-blue-700/50`}>
          {vocab.category}
        </span>
        
        <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(vocab)}
            className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all duration-200"
            title="Edit"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
            title="Detail"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => onDelete(vocab.id)}
            className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <ArabicText className="text-lg font-bold text-gray-900 dark:text-blue-100 mb-1">
          {vocab.arabic}
        </ArabicText>
        <p className="text-gray-700 dark:text-slate-300 font-medium">
          {vocab.indonesian}
        </p>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600 space-y-2">
          {vocab.root && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-slate-400">Akar:</span>
              <ArabicText className="text-blue-600 dark:text-blue-400 font-medium inline ml-2">
                {vocab.root}
              </ArabicText>
            </div>
          )}
          {vocab.examples && vocab.examples.length > 0 && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-slate-400">Contoh:</span>
              <ArabicText className="text-gray-600 dark:text-slate-300 text-sm mt-1">
                {vocab.examples[0]}
              </ArabicText>
            </div>
          )}
          {vocab.frequency && (
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Frekuensi: {vocab.frequency}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Line Item Component
const LineItem = ({ line, index, showTranslation, onToggleTranslation, onEditHiwar }) => {
  const { settings } = useSettings();
  const { getVocabByArabic, addVocab } = useHiwarStore();
  
  const [selectedWord, setSelectedWord] = useState('');
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [vocabLookup, setVocabLookup] = useState([]);
  const [isTranslationOpen, setIsTranslationOpen] = useState(false);
  
  // Audio states
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioError, setAudioError] = useState('');

  // ElevenLabs API credentials
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID;

  // Audio functions
  const generateAudio = async () => {
    if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
      setAudioError('API Key atau Voice ID tidak ditemukan');
      return;
    }

    setIsLoadingAudio(true);
    setAudioError('');

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: line.text_ar,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Auto-play the audio
      const audio = new Audio(url);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      audio.play();
      setCurrentAudio(audio);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error generating audio:', error);
      setAudioError('Gagal membuat audio. Silakan coba lagi.');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const playAudio = () => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      audio.play();
      setCurrentAudio(audio);
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  const handleWordClick = async (word) => {
    const cleanWord = word.replace(/[\u064B-\u065F\u0670\u0640]/g, '').trim(); // Remove diacritics
    if (!cleanWord) return;
    
    setSelectedWord(cleanWord);
    const vocab = await getVocabByArabic(cleanWord);
    setVocabLookup(vocab);
    
    if (vocab.length === 0) {
      // No translation found, open translation modal
      setShowTranslationModal(true);
    } else {
      // Show vocabulary lookup tooltip or modal
      console.log('Found translations:', vocab);
    }
  };

  const handleSaveTranslation = async (vocabEntry) => {
    await addVocab(vocabEntry);
    setShowTranslationModal(false);
    // Refresh the lookup for the word
    const updatedVocab = await getVocabByArabic(selectedWord);
    setVocabLookup(updatedVocab);
  };

  const renderClickableArabicText = (text) => {
    const words = text.split(' ');
    return words.map((word, idx) => (
      <span key={idx}>
        <span
          className="cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:text-yellow-800 dark:hover:text-yellow-200 rounded px-1 transition-colors duration-200"
          onClick={() => handleWordClick(word)}
          title="Klik untuk terjemahan"
        >
          {word}
        </span>
        {idx < words.length - 1 && ' '}
      </span>
    ));
  };

  const getDualModeClass = () => {
    switch (settings.columnWidth) {
      case 'narrow': return 'max-w-md';
      case 'wide': return 'max-w-4xl';
      default: return 'max-w-2xl';
    }
  };

  if (settings.viewMode === 'dual') {
    return (
      <div className={`group p-5 rounded-xl transition-all duration-200 ${getDualModeClass()} mx-auto bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 shadow-sm`}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.showLineNumbers && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">{index + 1}</span>
              )}
              {/* Audio Button */}
              <button
                onClick={generateAudio}
                disabled={isLoadingAudio}
                className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isLoadingAudio ? 'Memproses Audio...' : 'Putar Audio'}
              >
                {isLoadingAudio ? (
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Volume2 size={16} />
                )}
              </button>
            </div>
            {onEditHiwar && (
              <button
                onClick={onEditHiwar}
                title="Edit Hiwar"
                className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <Edit3 size={16} />
              </button>
            )}
          </div>
          {/* Arabic */}
            <div className="text-xs font-medium text-gray-600 dark:text-slate-300 mb-2 px-2 py-0.5 rounded bg-gray-50 dark:bg-slate-800 inline-block border border-gray-200/60 dark:border-slate-700/60">
              {line.speaker}
            </div>
            <ArabicText className="text-gray-900 dark:text-slate-100">
              <div className="leading-relaxed">
                {renderClickableArabicText(line.text_ar)}
              </div>
            </ArabicText>
            
            {/* Audio Error Message */}
            {audioError && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-xs">{audioError}</p>
              </div>
            )}

            {/* Audio Controls */}
            {audioUrl && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={playAudio}
                  disabled={isPlaying}
                  className="px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs rounded-lg transition-all duration-200 flex items-center gap-1"
                >
                  <Play size={10} />
                  {isPlaying ? 'Sedang Diputar...' : 'Putar Ulang'}
                </button>
                {isPlaying && (
                  <button
                    onClick={stopAudio}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-all duration-200 flex items-center gap-1"
                  >
                    <Square size={10} />
                    Stop
                  </button>
                )}
              </div>
            )}
            
            {isTranslationOpen && (
              <div className="mt-2 pl-3 border-l-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/10 py-3 rounded-r-lg">
                <div className="text-gray-800 dark:text-slate-200 leading-relaxed">
                  {line.text_id}
                </div>
              </div>
            )}

            {/* Translation Toggle placed under its text (dual mode) */}
            <button
              onClick={() => setIsTranslationOpen(!isTranslationOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${isTranslationOpen ? 'text-gray-800 dark:text-slate-200 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800' : 'text-gray-600 dark:text-gray-300 border-gray-300/70 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
            >
              {isTranslationOpen ? <Eye size={16} /> : <EyeOff size={16} />}
              Terjemahan
            </button>
        </div>
      </div>
    );
  }

  // Stacked mode
  return (
    <div className="group p-5 rounded-xl transition-all duration-200 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {settings.showLineNumbers && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">{index + 1}</span>
          )}
          {/* Audio Button */}
          <button
            onClick={generateAudio}
            disabled={isLoadingAudio}
            className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isLoadingAudio ? 'Memproses Audio...' : 'Putar Audio'}
          >
            {isLoadingAudio ? (
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Volume2 size={16} />
            )}
          </button>
        </div>
        {onEditHiwar && (
          <button
            onClick={onEditHiwar}
            title="Edit Hiwar"
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Arabic */}
        <div>
          <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full inline-block">
            {line.speaker}
          </div>
          <ArabicText className="text-gray-900 dark:text-emerald-100 text-shadow-sm">
            <div className="leading-relaxed">
              {renderClickableArabicText(line.text_ar)}
            </div>
          </ArabicText>
          
          {/* Audio Error Message */}
          {audioError && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-xs">{audioError}</p>
            </div>
          )}

          {/* Audio Controls */}
          {audioUrl && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={playAudio}
                disabled={isPlaying}
                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs rounded-lg transition-all duration-200 flex items-center gap-1"
              >
                <Play size={10} />
                {isPlaying ? 'Sedang Diputar...' : 'Putar Ulang'}
              </button>
              {isPlaying && (
                <button
                  onClick={stopAudio}
                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-all duration-200 flex items-center gap-1"
                >
                  <Square size={10} />
                  Stop
                </button>
              )}
            </div>
          )}
        </div>

        {/* Translation */}
        {isTranslationOpen && (
          <div className="mt-2 pl-3 border-l-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/10 py-3 rounded-r-lg">
            <div className="text-gray-800 dark:text-slate-200 leading-relaxed font-medium text-center">
              {line.text_id}
            </div>
          </div>
        )}

        {/* Translation Toggle placed under its text (stacked) */}
        <button
          onClick={() => setIsTranslationOpen(!isTranslationOpen)}
          className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${isTranslationOpen ? 'text-gray-800 dark:text-slate-200 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800' : 'text-gray-600 dark:text-gray-300 border-gray-300/70 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
        >
          {isTranslationOpen ? <Eye size={16} /> : <EyeOff size={16} />}
          Terjemahan
        </button>
      </div>
      
      {/* Translation Modal */}
      <TranslationModal
        isOpen={showTranslationModal}
        onClose={() => setShowTranslationModal(false)}
        arabicText={selectedWord}
        onSave={handleSaveTranslation}
      />
      
      {/* Vocabulary Lookup Tooltip */}
      {vocabLookup.length > 0 && selectedWord && (
        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/50">
          <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
            Arti dari: <ArabicText className="inline font-bold">{selectedWord}</ArabicText>
          </div>
          {vocabLookup.map((vocab, idx) => (
            <div key={idx} className="text-sm text-yellow-700 dark:text-yellow-300">
              <span className="font-medium">{vocab.category}:</span> {vocab.indonesian}
              {vocab.root && <span className="text-yellow-600 dark:text-yellow-400 ml-2">(Akar: {vocab.root})</span>}
            </div>
          ))}
          <button
            onClick={() => {
              setSelectedWord('');
              setVocabLookup([]);
            }}
            className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 underline"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
};

// Viewer Toolbar Component
const ViewerToolbar = ({ onBack }) => {
  const { settings, updateSettings } = useSettings();
  const { currentHiwar, exportHiwar } = useHiwarStore();

  const adjustFontSize = (delta) => {
    const newSize = Math.max(16, Math.min(32, settings.fontSize + delta));
    updateSettings({ fontSize: newSize });
  };

  return (
    <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 p-4 z-10 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg font-medium"
        >
          ← Kembali ke Daftar
        </button>
        
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 text-gray-700 dark:text-yellow-400 hover:text-gray-900 dark:hover:text-yellow-300 border border-gray-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50"
            title={settings.theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
          >
            {settings.theme === 'light' ? 
              <Moon size={20} className="theme-toggle-icon text-slate-700" /> : 
              <Sun size={20} className="theme-toggle-icon text-yellow-400" />
            }
          </button>

          {/* Export */}
          <button
            onClick={() => exportHiwar(currentHiwar)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 dark:hover:from-emerald-700 dark:hover:to-teal-700 transition-all duration-200 shadow-sm font-medium"
          >
            <Download size={16} />
            Ekspor
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">

        {/* Font Size */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 border border-gray-200/50 dark:border-slate-700/50">
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium px-2">Font:</span>
          <button
            onClick={() => adjustFontSize(-2)}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 text-gray-600 dark:text-gray-300"
          >
            <Minus size={16} />
          </button>
          <span className="text-sm font-mono w-8 text-center text-gray-700 dark:text-gray-200 font-medium">{settings.fontSize}</span>
          <button
            onClick={() => adjustFontSize(2)}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 text-gray-600 dark:text-gray-300"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Line Numbers */}
        <button
          onClick={() => updateSettings({ showLineNumbers: !settings.showLineNumbers })}
          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
            settings.showLineNumbers 
              ? 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-700/50 shadow-sm' 
              : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200/50 dark:border-slate-700/50 hover:bg-gray-150 dark:hover:bg-slate-700'
          }`}
        >
          Nomor Baris
        </button>
      </div>
    </div>
  );
};

// Hiwar Reader Component
const HiwarReader = ({ onBack }) => {
  const { currentHiwar } = useHiwarStore();
  const { settings } = useSettings();

  if (!currentHiwar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>Hiwar tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950">
      <ViewerToolbar onBack={onBack} />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50">
          <ArabicText className="text-4xl font-bold text-gray-900 dark:text-emerald-100 mb-3 drop-shadow-sm">
            {currentHiwar.title_ar}
          </ArabicText>
          {currentHiwar.title_id && (
            <h2 className="text-xl text-gray-600 dark:text-emerald-200/80 mb-4 font-medium">
              {currentHiwar.title_id}
            </h2>
          )}
          <div className="flex justify-center gap-2 flex-wrap">
            {currentHiwar.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/70 dark:to-teal-900/70 text-emerald-700 dark:text-emerald-200 rounded-full text-sm font-medium shadow-sm border border-emerald-200/50 dark:border-emerald-700/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {currentHiwar.lines.map((line, index) => (
            <LineItem
              key={index}
              line={line}
              index={index}
              showTranslation={settings.showTranslation}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Hiwar Card Component
const HiwarCard = ({ hiwar, onRead, onEdit, onDelete, onExport }) => {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioError, setAudioError] = useState('');

  // ElevenLabs API credentials
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID;

  const generateAudio = async (e) => {
    e.stopPropagation();
    
    if (!hiwar.title_ar?.trim()) {
      setAudioError('Tidak ada teks Arab untuk dikonversi');
      return;
    }

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
      setAudioError('ElevenLabs API key atau Voice ID tidak ditemukan');
      return;
    }

    setIsLoadingAudio(true);
    setAudioError('');
    setAudioUrl(null);

    try {
      // Menghentikan audio yang sedang berjalan
      if (currentAudio) {
        currentAudio.pause();
        setIsPlaying(false);
      }

      // Menggunakan ElevenLabs API untuk TTS berkualitas tinggi
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: hiwar.title_ar,
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
        const errorText = await response.text();
        console.error('ElevenLabs API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Mengkonversi response ke blob audio
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      
      // Auto play setelah generate
      setTimeout(() => playAudio(), 100);

    } catch (err) {
      console.error('Error generating audio:', err);
      setAudioError(`Error: ${err.message}`);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      audio.onerror = () => {
        setAudioError('Gagal memutar audio');
        setIsPlaying(false);
        setCurrentAudio(null);
      };

      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setAudioError('Gagal memutar audio');
        setIsPlaying(false);
      });
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 dark:border-slate-700/30 group hover:scale-[1.02] hover:bg-white/80 dark:hover:bg-slate-800/80">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <ArabicText className="text-xl font-bold text-gray-900 dark:text-emerald-100 mb-2 group-hover:text-emerald-800 dark:group-hover:text-emerald-200 transition-colors">
            {hiwar.title_ar}
          </ArabicText>
          {hiwar.title_id && (
            <h3 className="text-lg text-gray-600 dark:text-slate-300 mb-2 font-medium">
              {hiwar.title_id}
            </h3>
          )}
        </div>
        
        <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={generateAudio}
            disabled={isLoadingAudio}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isLoadingAudio ? 'Memproses Audio...' : 'Putar Audio'}
          >
            {isLoadingAudio ? (
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Volume2 size={16} />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(hiwar);
            }}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
            title="Edit"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExport(hiwar);
            }}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all duration-200"
            title="Ekspor"
          >
            <Download size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(hiwar.id);
            }}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 flex-wrap">
          {hiwar.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium border border-emerald-200/50 dark:border-emerald-700/50"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-sm text-gray-500 dark:text-slate-400 font-medium bg-gray-100 dark:bg-slate-700/50 px-2 py-1 rounded-full">
          {hiwar.lines.length} dialog
        </span>
      </div>

      {/* Audio Error Message */}
      {audioError && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-xs">{audioError}</p>
        </div>
      )}

      {/* Audio Controls */}
      {audioUrl && (
        <div className="mb-3 flex gap-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playAudio();
            }}
            disabled={isPlaying}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs rounded-lg transition-all duration-200 flex items-center gap-1"
          >
            <Play size={12} />
            {isPlaying ? 'Sedang Diputar...' : 'Putar Ulang'}
          </button>
          {isPlaying && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopAudio();
              }}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-all duration-200 flex items-center gap-1"
            >
              <Square size={12} />
              Stop
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => onRead(hiwar)}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
      >
        <BookOpen size={20} />
        Baca Hiwar
      </button>
    </div>
  );
};

// File Parser utilities
const parseTextFile = (content) => {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  if (lines.length === 0) {
    throw new Error('File kosong');
  }

  let title_ar = '';
  let dialogLines = [];

  // Check if first line is title (starts with #)
  if (lines[0].startsWith('#')) {
    title_ar = lines[0].substring(1).trim();
    dialogLines = lines.slice(1);
  } else {
    title_ar = 'Hiwar Tanpa Judul';
    dialogLines = lines;
  }

  const parsedLines = [];
  
  for (const line of dialogLines) {
    // Pattern: SPEAKER: arabic_text | indonesian_text
    const match = line.match(/^([^:]+):\s*([^|]+?)(?:\|\s*(.*))?$/);
    
    if (match) {
      const [, speaker, text_ar, text_id] = match;
      parsedLines.push({
        speaker: speaker.trim(),
        text_ar: text_ar.trim(),
        text_id: text_id ? text_id.trim() : '',
        ref: null
      });
    }
  }

  if (parsedLines.length === 0) {
    throw new Error('Tidak ada dialog yang valid ditemukan');
  }

  // Generate ID from title
  const id = title_ar
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'hiwar-' + Date.now();

  return {
    id,
    title_ar,
    title_id: '',
    tags: ['impor'],
    lines: parsedLines,
    meta: {
      created_at: new Date().toISOString(),
      source: 'text_import'
    }
  };
};

// Import Component
const ImportPage = ({ onBack, onImported }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addHiwar } = useHiwarStore();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (selectedFile) => {
    setFile(selectedFile);
    setError('');
    setIsProcessing(true);

    try {
      const content = await readFileAsText(selectedFile);
      const parsed = parseTextFile(content);
      setParsedData(parsed);
    } catch (err) {
      setError(err.message);
      setParsedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Gagal membaca file'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  const handleSave = async () => {
    if (!parsedData) return;
    
    try {
      await addHiwar(parsedData);
      onImported(parsedData);
    } catch (err) {
      setError('Gagal menyimpan hiwar: ' + err.message);
    }
  };

  const updateParsedData = (field, value) => {
    setParsedData(prev => ({ ...prev, [field]: value }));
  };

  const updateLine = (index, field, value) => {
    setParsedData(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            ← Kembali ke Daftar
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Impor Hiwar
          </h1>
          <div></div>
        </div>

        {!parsedData && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unggah file .txt atau .docx
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Seret file ke sini atau klik tombol di bawah
              </p>
              <input
                type="file"
                accept=".txt,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium cursor-pointer transition-colors inline-block"
              >
                Pilih File
              </label>
            </div>

            {isProcessing && (
              <div className="mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Memproses file...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Format Instructions */}
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                Format File yang Didukung:
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
                <p><strong>Format .txt:</strong></p>
                <pre className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded font-mono text-xs">
{`# طَلَبُ الإِذْنِ لِدُخُولِ الفَصْلِ
الطالب: اَلسَّلَامُ عَلَيْكُمْ يَا أُسْتَاذُ | Assalamualaikum Ustaz
الأستاذ: وَعَلَيْكُمُ السَّلَامُ | Waalaikumsalam`}
                </pre>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  * Judul diawali dengan #<br/>
                  * Format: PEMBICARA: teks_arab | teks_indonesia<br/>
                  * Terjemahan opsional (bisa hanya teks Arab)
                </p>
              </div>
            </div>
          </div>
        )}

        {parsedData && (
          <div className="space-y-6">
            {/* Preview Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Pratinjau Hiwar
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Judul Arab
                  </label>
                  <input
                    type="text"
                    value={parsedData.title_ar}
                    onChange={(e) => updateParsedData('title_ar', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    dir="rtl"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Judul Indonesia (opsional)
                  </label>
                  <input
                    type="text"
                    value={parsedData.title_id}
                    onChange={(e) => updateParsedData('title_id', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tag (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={parsedData.tags.join(', ')}
                  onChange={(e) => updateParsedData('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="pemula, dialog, dll"
                />
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Ditemukan {parsedData.lines.length} baris dialog
              </div>
            </div>

            {/* Preview Lines */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Dialog
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {parsedData.lines.map((line, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Pembicara
                        </label>
                        <input
                          type="text"
                          value={line.speaker}
                          onChange={(e) => updateLine(index, 'speaker', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Teks Arab
                        </label>
                        <textarea
                          value={line.text_ar}
                          onChange={(e) => updateLine(index, 'text_ar', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          dir="rtl"
                          rows="2"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Terjemahan
                        </label>
                        <textarea
                          value={line.text_id}
                          onChange={(e) => updateLine(index, 'text_id', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          rows="2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setFile(null);
                  setParsedData(null);
                  setError('');
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
              >
                Simpan Hiwar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Hiwar List Component
const HiwarList = ({ onRead, onImport, onDictionary, onTTS, onIstima }) => {
  const { hiwarList, deleteHiwar, exportHiwar, exportAllHiwar, addHiwar, updateHiwar } = useHiwarStore();
  const { settings, updateSettings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHiwar, setEditingHiwar] = useState(null);

  // Get unique tags
  const allTags = [...new Set(hiwarList.flatMap(h => h.tags))];

  // Handle manual hiwar save
  const handleManualHiwarSave = async (hiwarData) => {
    try {
      await addHiwar(hiwarData);
      setIsManualModalOpen(false);
      // Optionally navigate to the newly created hiwar
      onRead(hiwarData);
    } catch (error) {
      console.error('Failed to save manual hiwar:', error);
    }
  };

  // Filter hiwar based on search and tag
  const filteredHiwar = hiwarList.filter(hiwar => {
    const matchesSearch = searchQuery === '' || 
      hiwar.title_ar.includes(searchQuery) ||
      hiwar.title_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hiwar.lines.some(line => 
        line.text_ar.includes(searchQuery) || 
        line.text_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesTag = selectedTag === '' || hiwar.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const handleDeleteConfirm = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus hiwar ini?')) {
      deleteHiwar(id);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-emerald-200/40 dark:border-emerald-900/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8 lg:py-10">
            {/* Title Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4">
                 <img 
                   src="/Laa Taskut.png" 
                   alt="Laa Taskut Logo" 
                   className="w-full h-full object-contain rounded-2xl shadow-lg"
                 />
               </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 dark:from-emerald-300 dark:via-emerald-200 dark:to-emerald-100 bg-clip-text text-transparent leading-tight">
                Laa Taskut
              </h1>
              <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-emerald-700 dark:text-emerald-300 mt-2 mb-3" dir="rtl">
                لا تسكت
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <span className="text-sm sm:text-base font-medium text-emerald-800 dark:text-emerald-200">
                  Bahasa Arab IC At-Tauhid
                </span>
              </div>

            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {/* Theme Toggle */}
              <button
                onClick={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
                className="group relative p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200/50 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                title={settings.theme === 'light' ? 'Ubah ke Mode Gelap' : 'Ubah ke Mode Terang'}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-900/20 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <div className="relative">
                  {settings.theme === 'light' ? 
                    <Moon size={20} className="text-emerald-700 dark:text-emerald-300" /> : 
                    <Sun size={20} className="text-yellow-500" />
                  }
                </div>
              </button>

              {/* Primary Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Create Hiwar */}
                <button
                  onClick={() => setIsManualModalOpen(true)}
                  className="group relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl font-medium text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  title="Buat Hiwar Baru"
                >
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                  <span>Buat Hiwar</span>
                </button>

                {/* Import */}
                <button
                  onClick={onImport}
                  className="group relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-800 border-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl font-medium text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Impor Hiwar"
                >
                  <Upload size={18} className="sm:w-5 sm:h-5" />
                  <span>Impor Hiwar</span>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* TTS */}
                <button
                  onClick={onTTS}
                  className="group relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-800 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl font-medium text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Text-to-Speech Arab"
                >
                  <Mic size={18} className="sm:w-5 sm:h-5" />
                  <span>TTS</span>
                </button>

                {/* Istima' */}
                <button
                  onClick={onIstima}
                  className="group relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-800 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl font-medium text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Pembaca Teks Arab untuk Istima'"
                >
                  <Volume2 size={18} className="sm:w-5 sm:h-5" />
                  <span>Istima'</span>
                </button>

                {/* Dictionary */}
                <button
                  onClick={onDictionary}
                  className="group relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-800 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl font-medium text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Buka Kamus"
                >
                  <BookMarked size={18} className="sm:w-5 sm:h-5" />
                  <span>Kamus</span>
                </button>

                {/* Export All */}
                <button
                  onClick={exportAllHiwar}
                  className="group relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-800 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl font-medium text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Ekspor Semua Hiwar"
                >
                  <Download size={18} className="sm:w-5 sm:h-5" />
                  <span>Ekspor</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 dark:text-emerald-400 transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Cari hiwar berdasarkan judul, konten, atau tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 border border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-600/50 focus:border-emerald-400 dark:focus:border-emerald-500 transition-all duration-200 shadow-sm focus:shadow-lg text-base"
                  />
                </div>
              </div>
              
              <div className="relative group">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="appearance-none px-6 py-4 border border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-600/50 focus:border-emerald-400 dark:focus:border-emerald-500 transition-all duration-200 shadow-sm focus:shadow-lg text-base min-w-[160px] cursor-pointer"
                >
                  <option value="">🏷️ Semua Tag</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>📌 {tag}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {filteredHiwar.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-12 border border-white/20 dark:border-slate-700/30 shadow-lg">
              <BookOpen size={64} className="mx-auto mb-4 text-emerald-300 dark:text-emerald-600" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-slate-300 mb-2">
                {hiwarList.length === 0 ? 'Belum ada hiwar' : 'Tidak ada hiwar yang sesuai'}
              </h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6">
                {hiwarList.length === 0 
                  ? 'Mulai dengan mengimpor hiwar dari file .txt atau .docx'
                  : 'Coba ubah kata kunci pencarian atau filter tag'
                }
              </p>
              {hiwarList.length === 0 && (
                <button
                  onClick={onImport}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm"
                >
                  Impor Hiwar Pertama
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredHiwar.map(hiwar => (
              <HiwarCard
                key={hiwar.id}
                hiwar={hiwar}
                onRead={onRead}
                onEdit={(h) => { setEditingHiwar(h); setIsEditModalOpen(true); }}
                onDelete={handleDeleteConfirm}
                onExport={exportHiwar}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Manual Hiwar Creation Modal */}
      <ManualHiwarModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={handleManualHiwarSave}
      />

      {/* Edit Hiwar Modal (reuse ManualHiwarModal-like structure) */}
      {isEditModalOpen && editingHiwar && (
        <EditHiwarModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          hiwar={editingHiwar}
          onSave={async (newData) => {
            const updated = { ...editingHiwar, ...newData, id: editingHiwar.id, meta: { ...(editingHiwar.meta||{}), updated_at: new Date().toISOString() } };
            await updateHiwar(updated);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('list'); // list, reader, import, dictionary, tts, istima
  const { isLoading, loadHiwar, setCurrentHiwar } = useHiwarStore();
  const { settings } = useSettings();

  useEffect(() => {
    // Apply theme to document
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleReadHiwar = (hiwar) => {
    setCurrentHiwar(hiwar);
    setCurrentView('reader');
  };

  const handleImportSuccess = (hiwar) => {
    setCurrentHiwar(hiwar);
    setCurrentView('reader');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentView === 'list' && (
        <HiwarList 
          onRead={handleReadHiwar}
          onImport={() => setCurrentView('import')}
          onDictionary={() => setCurrentView('dictionary')}
          onTTS={() => setCurrentView('tts')}
          onIstima={() => setCurrentView('istima')}
        />
      )}
      
      {currentView === 'reader' && (
        <HiwarReader onBack={() => setCurrentView('list')} />
      )}
      
      {currentView === 'import' && (
        <ImportPage 
          onBack={() => setCurrentView('list')}
          onImported={handleImportSuccess}
        />
      )}
      
      {currentView === 'dictionary' && (
        <VocabularyDictionary 
          onBack={() => setCurrentView('list')}
        />
      )}
      
      {currentView === 'tts' && (
        <LahajatiTTSApp 
          onBack={() => setCurrentView('list')}
        />
      )}
      
      {currentView === 'istima' && (
        <ArabicTextReader 
          onBack={() => setCurrentView('list')}
        />
      )}
    </div>
  );
};

// Root App with Providers
const HiwarApp = () => {
  return (
    <APIKeyProvider>
      <SettingsProvider>
        <HiwarProvider>
          <App />
        </HiwarProvider>
      </SettingsProvider>
    </APIKeyProvider>
  );
};

export default HiwarApp;