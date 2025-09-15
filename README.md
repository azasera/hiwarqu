# Hiwar Arabic Learning App

A modern React application for learning Arabic through interactive dialogues (hiwar) with built-in dictionary and translation features.

## 🌟 Features

### 📚 Interactive Arabic Dialogues
- Read Arabic conversations with Indonesian translations
- Click on Arabic words for instant translations
- Dark/Light mode support
- Responsive design for all devices

### 🔤 Built-in Dictionary (Kamus Mufrodat)
- Comprehensive Arabic-Indonesian dictionary
- Add, search, and manage vocabulary
- Categorized entries (Grammar, Greetings, etc.)
- Root word tracking and examples

### 🎯 Learning Tools
- Import/Export dialogues from text files
- Clickable Arabic text for instant lookup
- Vocabulary frequency tracking
- Multiple viewing modes (side-by-side, stacked)

## 🚀 Technologies Used

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **IndexedDB** for local data storage
- **Lucide React** for icons
- **Arabic fonts** (Amiri, Scheherazade New)

## 📱 Screenshots

### Light Mode
![Light Mode](screenshots/light-mode.png)

### Dark Mode  
![Dark Mode](screenshots/dark-mode.png)

### Dictionary
![Dictionary](screenshots/dictionary.png)

## 🛠️ Installation & Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd hiwar-arabic-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Build for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Configure SPA redirects

### Deploy to GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add deploy script to package.json:
   ```json
   "deploy": "gh-pages -d dist"
   ```
3. Run: `npm run build && npm run deploy`

## 📁 Project Structure

```
hiwar-arabic-app/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   ├── index.css        # Global styles
│   └── vite-env.d.ts   # Vite type definitions
├── public/
│   └── index.html       # HTML template
├── dist/               # Production build output
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── vercel.json         # Vercel deployment configuration
```

## 🎮 Usage Guide

### Reading Dialogues
1. Browse available dialogues on the main page
2. Click "Baca Hiwar" to open a dialogue
3. Click on any Arabic word to see its translation
4. Use the toolbar to adjust font size and viewing mode

### Using the Dictionary
1. Click "Kamus" button in the header
2. Browse existing vocabulary or search for specific words
3. Add new vocabulary with the "+" button
4. Filter by categories or search across all fields

### Importing Content
1. Click "Impor Hiwar" on the main page
2. Upload a .txt file with the following format:
   ```
   # Title in Arabic
   Speaker1: Arabic text | Indonesian translation
   Speaker2: Arabic text | Indonesian translation
   ```
3. Review and edit the imported content
4. Save to add to your collection

## 🎨 Customization

### Themes
The app supports both light and dark themes. Toggle using the moon/sun icon in the header.

### Typography
Arabic text uses premium fonts:
- **Amiri**: Traditional Arabic typography
- **Scheherazade New**: Modern Arabic reading font
- **Noto Naskh Arabic**: Clean, readable Arabic font

### Colors
The app uses a green/emerald color scheme representing Islamic and Arabic cultural aesthetics.

## 🔧 Configuration

### Font Settings
Adjust Arabic font sizes using the toolbar controls (16px - 32px range).

### Display Modes
- **Dual Mode**: Arabic and translation side-by-side
- **Stacked Mode**: Arabic text with translation below

### Data Storage
All data is stored locally using IndexedDB:
- Dialogues and vocabulary persist between sessions
- No server required for basic functionality
- Export/import for data portability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Arabic fonts from Google Fonts
- Icons from Lucide React
- UI components inspired by modern Arabic learning platforms
- Community feedback for feature improvements

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the FAQ section below

## ❓ FAQ

### Q: How do I add my own dialogues?
A: Use the "Impor Hiwar" feature to upload .txt files in the specified format, or create them manually through the interface.

### Q: Can I export my vocabulary?
A: Yes, use the export buttons to download your dialogues and vocabulary as JSON files.

### Q: Does this work offline?
A: Yes, once loaded, the app works completely offline using IndexedDB for data storage.

### Q: How do I reset my data?
A: Clear your browser's IndexedDB data for this domain, or use browser developer tools.

---

**Made with ❤️ for Arabic language learners**