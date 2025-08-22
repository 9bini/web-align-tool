# Code Formatter Pro 🚀

A comprehensive, professional-grade code formatting tool that supports multiple programming languages with customizable conventions and IDE integration.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Ant Design](https://img.shields.io/badge/Ant_Design-0170FE?logo=antdesign&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

## ✨ Features

### 🌐 Multi-Language Support
- **Java** - Google Java Style, Oracle Java Style, Eclipse Default
- **JavaScript/TypeScript** - Airbnb, Standard, Prettier styles
- **JSON** - Standard JSON, Prettier, Compact formatting
- **Kotlin** - JetBrains Official, Android Kotlin styles
- **SQL** - Standard SQL, PostgreSQL, Compact formatting

### 🎯 Advanced Formatting Options
- **Column Alignment** - Delimiter-based text alignment (legacy feature)
- **Code Formatting** - Language-specific formatting with popular conventions
- **JSON Tools** - Prettify and minify JSON data
- **Auto-formatting** - Real-time formatting as you type
- **Convention Presets** - Popular industry-standard style guides

### 🔧 IDE Integration
Export your formatting conventions to popular IDEs and tools:
- **Visual Studio Code** (.vscode/settings.json)
- **IntelliJ IDEA** (XML code style files)
- **Eclipse** (XML formatter profiles)
- **Prettier** (.prettierrc configuration)
- **ESLint** (.eslintrc.json configuration)
- **EditorConfig** (.editorconfig files)

### 📊 Smart Analytics
- Real-time processing statistics
- Line change tracking
- Performance metrics
- Warning and error reporting

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/9bini/web-align-tool.git
cd web-align-tool

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎮 Usage

### 1. Code Formatting
1. Select your programming language (Java, JavaScript, JSON, Kotlin, SQL)
2. Choose a formatting convention (Google, Airbnb, Standard, etc.)
3. Paste your code in the input area
4. Click "Execute" to format your code
5. Copy the formatted result or export IDE settings

### 2. Column Alignment
1. Switch to "Column Alignment" mode
2. Paste text with `/` delimiters
3. Execute to align columns for better readability

### 3. JSON Tools
1. Switch to "JSON Tools" mode  
2. Paste JSON data
3. Choose "Prettify" for formatted JSON or "Minify" for compressed JSON

### 4. IDE Export
1. Format your code with desired convention
2. Click "Export IDE Settings"
3. Choose your IDE/tool format
4. Download or copy the configuration file
5. Follow the provided integration instructions

## 🛠️ Supported Conventions

### Java
- **Google Java Style** - 2 spaces, 100 char line limit
- **Oracle Java Style** - 4 spaces, 80 char line limit  
- **Eclipse Default** - Tabs, 120 char line limit

### JavaScript/TypeScript
- **Airbnb JavaScript** - Single quotes, semicolons, trailing commas
- **JavaScript Standard** - No semicolons, avoid arrow parens
- **Prettier JavaScript** - Double quotes, ES5 trailing commas

### JSON
- **Standard JSON** - 2 space indent, no trailing commas
- **Prettier JSON** - 2 space indent, clean formatting
- **Compact JSON** - Minimal spacing, sorted keys

### Kotlin
- **Kotlin Official** - JetBrains official style guide
- **Android Kotlin** - Android development conventions

### SQL
- **Standard SQL** - UPPER keywords, lower identifiers
- **PostgreSQL Style** - lower keywords, leading commas
- **Compact SQL** - Minimal spacing, preserve case

## 🏗️ Architecture

### Core Components

#### Formatters
- `JavaFormatter` - Java code formatting with convention support
- `JsonFormatter` - JSON prettification and minification
- `JavaScriptFormatter` - JavaScript/TypeScript formatting
- `KotlinFormatter` - Kotlin code formatting
- `SqlFormatter` - SQL query formatting

#### Services
- `FormattingService` - Central formatting orchestration
- `IdeExporter` - IDE configuration file generation

#### UI Components
- `LanguageSelector` - Programming language selection
- `ConventionSelector` - Style convention chooser
- `IdeExportModal` - IDE integration interface

### Type System
Comprehensive TypeScript interfaces for:
- Language-specific formatting conventions
- IDE export formats
- Formatting results and statistics
- UI component props and state

## 🔍 Examples

### Java Code Formatting
```java
// Input (poorly formatted)
public class Example{
private String name;
public void method(){
if(condition){
doSomething();
}
}
}

// Output (Google Java Style)
public class Example {
  private String name;
  
  public void method() {
    if (condition) {
      doSomething();
    }
  }
}
```

### JSON Prettification
```json
// Input (minified)
{"name":"John","age":30,"items":["apple","banana"]}

// Output (prettified)
{
  "name": "John",
  "age": 30,
  "items": [
    "apple",
    "banana"
  ]
}
```

### Column Alignment
```
// Input (unaligned)
apple/fruit/red
banana/fruit/yellow
carrot/vegetable/orange

// Output (aligned)
apple  / fruit     / red
banana / fruit     / yellow  
carrot / vegetable / orange
```

## 📈 Performance

- **Real-time formatting** with sub-second processing
- **Memory efficient** with optimized algorithms
- **Large file support** up to several MB
- **Background processing** for non-blocking UI

## 🎨 Customization

### Adding New Languages
1. Define formatting convention interface in `types/FormattingTypes.ts`
2. Create language formatter in `formatters/`
3. Add presets to `constants/PresetConventions.ts`
4. Update `FormattingService` to support the new language
5. Add IDE export support in `IdeExporter`

### Adding New Conventions
1. Define convention in `constants/PresetConventions.ts`
2. Follow the existing pattern for official/community presets
3. Include popularity rating and description

### Custom IDE Export
1. Add new format type to `IdeExportFormat`
2. Implement export logic in `IdeExporter`
3. Add format-specific configuration generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add comprehensive comments for complex logic
- Include type definitions for new features
- Update documentation for new functionality
- Test formatting with various code samples

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ant Design** - Beautiful React UI components
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript development
- **Various Style Guides** - Google, Airbnb, Standard, JetBrains

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/9bini/web-align-tool/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/9bini/web-align-tool/discussions)  
- 📧 **Email**: Create an issue for support

---

**Made with ❤️ by Terragon Labs**

Built for developers, by developers. Format once, deploy everywhere! 🚀