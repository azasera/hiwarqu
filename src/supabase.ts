import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Hiwar {
  id: string
  title_ar: string
  title_id: string
  description: string
  tags: string[]
  lines: {
    id: number
    speaker: string
    text_ar: string
    text_id: string
  }[]
  meta: {
    created_at: string
    updated_at?: string
    source: string
    total_lines: number
    language_pair: string
  }
}

export interface VocabEntry {
  id: string
  arabic: string
  indonesian: string
  root?: string
  category: string
  examples?: string[]
  frequency: number
  created_at: string
}

// Supabase Database Service
export class SupabaseDB {
  private fallbackToLocal = false
  
  private checkTableExists(error: any): boolean {
    return error?.code === 'PGRST205' || error?.message?.includes('table') || error?.message?.includes('schema cache')
  }
  
  async getAllHiwar(): Promise<Hiwar[]> {
    try {
      const { data, error } = await supabase
        .from('hiwar')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error && this.checkTableExists(error)) {
        console.warn('Supabase tables not found, loading demo data')
        return this.getDemoHiwar()
      }
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Failed to fetch hiwar, loading demo data:', error)
      return this.getDemoHiwar()
    }
  }

  async addHiwar(hiwar: Hiwar): Promise<Hiwar> {
    try {
      // Add timestamp if not exists
      if (!hiwar.meta) {
        hiwar.meta = {
          created_at: new Date().toISOString(),
          source: 'manual',
          total_lines: hiwar.lines.length,
          language_pair: 'ar-id'
        }
      }
      hiwar.meta.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('hiwar')
        .insert([hiwar])
        .select()
        .single()
      
      if (error && this.checkTableExists(error)) {
        console.warn('Supabase tables not found, returning hiwar as-is')
        return hiwar
      }
      if (error) throw error
      return data
    } catch (error) {
      console.warn('Failed to add hiwar, returning hiwar as-is:', error)
      return hiwar
    }
  }

  async updateHiwar(hiwar: Hiwar): Promise<Hiwar> {
    hiwar.meta.updated_at = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('hiwar')
      .update(hiwar)
      .eq('id', hiwar.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async deleteHiwar(id: string): Promise<void> {
    const { error } = await supabase
      .from('hiwar')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  async getHiwar(id: string): Promise<Hiwar> {
    const { data, error } = await supabase
      .from('hiwar')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async getAllVocab(): Promise<VocabEntry[]> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .order('frequency', { ascending: false })
      
      if (error && this.checkTableExists(error)) {
        console.warn('Vocabulary table not found, loading demo data')
        return this.getDemoVocab()
      }
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching vocabulary, loading demo data:', error)
      return this.getDemoVocab()
    }
  }

  async addVocab(vocab: VocabEntry): Promise<VocabEntry> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .insert([vocab])
        .select()
        .single()
      
      if (error && this.checkTableExists(error)) {
        console.warn('Supabase vocabulary table not found, returning vocab as-is')
        return vocab
      }
      if (error) throw error
      return data
    } catch (error) {
      console.warn('Failed to add vocab, returning vocab as-is:', error)
      return vocab
    }
  }

  async updateVocab(vocab: VocabEntry): Promise<VocabEntry> {
    const { data, error } = await supabase
      .from('vocabulary')
      .update(vocab)
      .eq('id', vocab.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async deleteVocab(id: string): Promise<void> {
    const { error } = await supabase
      .from('vocabulary')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  async searchVocab(query: string): Promise<VocabEntry[]> {
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .or(`arabic.ilike.%${query}%,indonesian.ilike.%${query}%`)
      .order('frequency', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // Demo data methods
  private getDemoHiwar(): Hiwar[] {
    return [
      {
        id: 'demo-hiwar-1',
        title_ar: 'طَلَبُ الإِذْنِ لِدُخُولِ الفَصْلِ',
        title_id: 'Meminta Izin Masuk Kelas',
        description: 'Dialog tentang meminta izin untuk masuk ke dalam kelas',
        tags: ['kelas', 'izin', 'sekolah'],
        lines: [
          {
            id: 1,
            speaker: 'الطَّالِبُ',
            text_ar: 'السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ',
            text_id: 'Assalamu\'alaikum warahmatullahi wabarakatuh'
          },
          {
            id: 2,
            speaker: 'الأُسْتَاذُ',
            text_ar: 'وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ',
            text_id: 'Wa\'alaikumussalam warahmatullahi wabarakatuh'
          },
          {
            id: 3,
            speaker: 'الطَّالِبُ',
            text_ar: 'أَسْتَأْذِنُكَ لِلدُّخُولِ',
            text_id: 'Saya minta izin untuk masuk'
          },
          {
            id: 4,
            speaker: 'الأُسْتَاذُ',
            text_ar: 'تَفَضَّلْ، ادْخُلْ',
            text_id: 'Silakan, masuklah'
          },
          {
            id: 5,
            speaker: 'الطَّالِبُ',
            text_ar: 'شُكْرًا لَكَ يَا أُسْتَاذُ',
            text_id: 'Terima kasih, wahai ustadz'
          }
        ],
        meta: {
          created_at: new Date().toISOString(),
          source: 'demo',
          total_lines: 5,
          language_pair: 'ar-id'
        }
      },
      {
        id: 'demo-hiwar-2',
        title_ar: 'السُّؤَالُ عَنِ الاتِّجَاهَاتِ',
        title_id: 'Menanyakan Arah',
        description: 'Dialog tentang menanyakan arah jalan',
        tags: ['arah', 'jalan', 'perjalanan'],
        lines: [
          {
            id: 1,
            speaker: 'السَّائِلُ',
            text_ar: 'عَفْوًا، أَيْنَ الْمَسْجِدُ؟',
            text_id: 'Maaf, di mana masjid?'
          },
          {
            id: 2,
            speaker: 'الْمُجِيبُ',
            text_ar: 'الْمَسْجِدُ قَرِيبٌ مِنْ هُنَا',
            text_id: 'Masjid dekat dari sini'
          },
          {
            id: 3,
            speaker: 'السَّائِلُ',
            text_ar: 'كَيْفَ أَصِلُ إِلَيْهِ؟',
            text_id: 'Bagaimana cara sampai ke sana?'
          },
          {
            id: 4,
            speaker: 'الْمُجِيبُ',
            text_ar: 'اِذْهَبْ مُسْتَقِيمًا ثُمَّ انْعَطِفْ يَمِينًا',
            text_id: 'Jalan lurus kemudian belok kanan'
          },
          {
            id: 5,
            speaker: 'السَّائِلُ',
            text_ar: 'جَزَاكَ اللهُ خَيْرًا',
            text_id: 'Jazakallahu khairan'
          }
        ],
        meta: {
          created_at: new Date().toISOString(),
          source: 'demo',
          total_lines: 5,
          language_pair: 'ar-id'
        }
      }
    ]
  }

  private getDemoVocab(): VocabEntry[] {
    return [
      {
        id: 'vocab-1',
        arabic: 'السَّلاَمُ عَلَيْكُمْ',
        indonesian: 'Assalamu\'alaikum (salam)',
        category: 'Salam',
        frequency: 100,
        created_at: new Date().toISOString()
      },
      {
        id: 'vocab-2',
        arabic: 'شُكْرًا',
        indonesian: 'Terima kasih',
        category: 'Ucapan',
        frequency: 95,
        created_at: new Date().toISOString()
      },
      {
        id: 'vocab-3',
        arabic: 'أُسْتَاذُ',
        indonesian: 'Guru/Ustadz',
        category: 'Profesi',
        frequency: 80,
        created_at: new Date().toISOString()
      },
      {
        id: 'vocab-4',
        arabic: 'مَسْجِد',
        indonesian: 'Masjid',
        category: 'Tempat',
        frequency: 85,
        created_at: new Date().toISOString()
      },
      {
        id: 'vocab-5',
        arabic: 'طَالِب',
        indonesian: 'Siswa/Pelajar',
        category: 'Profesi',
        frequency: 90,
        created_at: new Date().toISOString()
      }
    ]
  }

  // Initialize demo data
  async addDemoData(): Promise<void> {
    const demoHiwar = [
      {
        id: 'demo-hiwar-1',
        title_ar: 'طَلَبُ الإِذْنِ لِدُخُولِ الفَصْلِ',
        title_id: 'Meminta Izin Masuk Kelas',
        description: 'Dialog tentang meminta izin untuk masuk ke dalam kelas',
        tags: ['kelas', 'izin', 'sekolah'],
        lines: [
          {
            id: 1,
            speaker: 'الطَّالِبُ',
            text_ar: 'السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ',
            text_id: 'Assalamu\'alaikum warahmatullahi wabarakatuh'
          },
          {
            id: 2,
            speaker: 'الأُسْتَاذُ',
            text_ar: 'وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ',
            text_id: 'Wa\'alaikumussalam warahmatullahi wabarakatuh'
          },
          {
            id: 3,
            speaker: 'الطَّالِبُ',
            text_ar: 'أَسْتَأْذِنُكَ لِلدُّخُولِ',
            text_id: 'Saya minta izin untuk masuk'
          },
          {
            id: 4,
            speaker: 'الأُسْتَاذُ',
            text_ar: 'تَفَضَّلْ، ادْخُلْ',
            text_id: 'Silakan, masuklah'
          },
          {
            id: 5,
            speaker: 'الطَّالِبُ',
            text_ar: 'شُكْرًا لَكَ يَا أُسْتَاذُ',
            text_id: 'Terima kasih, wahai ustadz'
          }
        ],
        meta: {
          created_at: new Date().toISOString(),
          source: 'demo',
          total_lines: 5,
          language_pair: 'ar-id'
        }
      },
      {
        id: 'demo-hiwar-2',
        title_ar: 'السُّؤَالُ عَنِ الاتِّجَاهَاتِ',
        title_id: 'Menanyakan Arah',
        description: 'Dialog tentang menanyakan arah jalan',
        tags: ['arah', 'jalan', 'perjalanan'],
        lines: [
          {
            id: 1,
            speaker: 'السَّائِلُ',
            text_ar: 'عَفْوًا، أَيْنَ الْمَسْجِدُ؟',
            text_id: 'Maaf, di mana masjid?'
          },
          {
            id: 2,
            speaker: 'الْمُجِيبُ',
            text_ar: 'الْمَسْجِدُ قَرِيبٌ مِنْ هُنَا',
            text_id: 'Masjid dekat dari sini'
          },
          {
            id: 3,
            speaker: 'السَّائِلُ',
            text_ar: 'كَيْفَ أَصِلُ إِلَيْهِ؟',
            text_id: 'Bagaimana cara sampai ke sana?'
          },
          {
            id: 4,
            speaker: 'الْمُجِيبُ',
            text_ar: 'اِذْهَبْ مُسْتَقِيمًا ثُمَّ انْعَطِفْ يَمِينًا',
            text_id: 'Jalan lurus kemudian belok kanan'
          },
          {
            id: 5,
            speaker: 'السَّائِلُ',
            text_ar: 'جَزَاكَ اللهُ خَيْرًا',
            text_id: 'Jazakallahu khairan'
          }
        ],
        meta: {
          created_at: new Date().toISOString(),
          source: 'demo',
          total_lines: 5,
          language_pair: 'ar-id'
        }
      }
    ]

    // Check if demo data already exists
    const { data: existingData } = await supabase
      .from('hiwar')
      .select('id')
      .in('id', ['demo-hiwar-1', 'demo-hiwar-2'])
    
    if (!existingData || existingData.length === 0) {
      const { error } = await supabase
        .from('hiwar')
        .insert(demoHiwar)
      
      if (error) throw error
    }
  }

  async addDemoVocab(): Promise<void> {
    const demoVocab = [
      {
        id: 'vocab-1',
        arabic: 'السَّلاَمُ عَلَيْكُمْ',
        indonesian: 'Assalamu\'alaikum (salam)',
        category: 'Salam',
        frequency: 100,
        created_at: new Date().toISOString()
      },
      {
        id: 'vocab-2',
        arabic: 'شُكْرًا',
        indonesian: 'Terima kasih',
        category: 'Ucapan',
        frequency: 95,
        created_at: new Date().toISOString()
      },
      {
        id: 'vocab-3',
        arabic: 'أُسْتَاذُ',
        indonesian: 'Guru/Ustadz',
        category: 'Profesi',
        frequency: 80,
        created_at: new Date().toISOString()
      },
      {
        id: 'vocab-4',
        arabic: 'مَسْجِد',
        indonesian: 'Masjid',
        category: 'Tempat',
        frequency: 85,
        created_at: new Date().toISOString()
      },
      {
        id: 'vocab-5',
        arabic: 'طَالِب',
        indonesian: 'Siswa/Pelajar',
        category: 'Profesi',
        frequency: 90,
        created_at: new Date().toISOString()
      }
    ]

    // Check if demo vocab already exists
    const { data: existingVocab } = await supabase
      .from('vocabulary')
      .select('id')
      .in('id', demoVocab.map(v => v.id))
    
    if (!existingVocab || existingVocab.length === 0) {
      const { error } = await supabase
        .from('vocabulary')
        .insert(demoVocab)
      
      if (error) throw error
    }
  }
}