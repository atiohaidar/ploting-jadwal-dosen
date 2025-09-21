import React from 'react';

// Section component for consistent styling
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-16">
    <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {title}
    </h2>
    {children}
  </section>
);

// Color Palette Component
const ColorPalette: React.FC = () => {
  const colors = [
    { name: 'Primary Background', hex: '#222222' },
    { name: 'UI Background', hex: '#494949' },
    { name: 'UI Element', hex: '#525252' },
    { name: 'Accent / Border', hex: '#656565' },
    { name: 'Text / Body', hex: '#AAAAAA' },
    { name: 'Accent / Highlight', hex: '#BFFF00' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {colors.map((color) => (
        <div key={color.hex} className="bg-[#525252] p-4 rounded-lg shadow-md">
          <div className="w-full h-24 rounded-md mb-3 border border-[#656565]" style={{ backgroundColor: color.hex }}></div>
          <h4 className="font-bold text-lg text-white">{color.name}</h4>
          <p className="text-gray-300 font-mono" style={{ fontFamily: "'Fira Code', monospace" }}>{color.hex.toUpperCase()}</p>
        </div>
      ))}
    </div>
  );
};

// Typography Guide Component
const TypographyGuide: React.FC = () => (
  <div className="space-y-8 text-[#AAAAAA]">
    <div>
      <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Headings (Poppins)</h3>
      <p className="text-5xl font-bold text-white" style={{ fontFamily: `'Poppins', sans-serif` }}>
        Heading 1
      </p>
      <p className="text-4xl font-bold text-white mt-2" style={{ fontFamily: `'Poppins', sans-serif` }}>
        Heading 2
      </p>
      <p className="text-3xl font-semibold text-white mt-2" style={{ fontFamily: `'Poppins', sans-serif` }}>
        Heading 3
      </p>
      <div className="mt-3 text-gray-400">
        <span className="font-semibold text-gray-300">Usage:</span> For page titles and major section headings.
      </div>
    </div>
    <div className="border-t border-[#656565] my-6"></div>
    <div>
      <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Body Text (Inter)</h3>
      <p className="text-lg" style={{ fontFamily: `'Inter', sans-serif` }}>
        The quick brown fox jumps over the lazy dog. This is the default text style for paragraphs and other long-form content, designed for maximum readability and a clean, modern aesthetic. Use it for descriptions, labels, and any non-heading text.
      </p>
      <div className="mt-3 text-gray-400">
        <span className="font-semibold text-gray-300">Font:</span> Inter | <span className="font-semibold text-gray-300">Weight:</span> 400 (Regular)
      </div>
    </div>
    <div className="border-t border-[#656565] my-6"></div>
    <div>
      <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Code Snippets (Fira Code)</h3>
      <pre className="bg-[#222222] p-4 rounded-md text-sm" style={{ fontFamily: `'Fira Code', monospace` }}>
        <code>{`const greeting = "Hello, World!";\nconsole.log(greeting);`}</code>
      </pre>
      <div className="mt-3 text-gray-400">
        <span className="font-semibold text-gray-300">Usage:</span> For displaying code examples and technical snippets.
      </div>
    </div>
  </div>
);

// Component Examples
const ComponentExamples: React.FC = () => {
  return (
    <div className="space-y-12">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Buttons</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <button className="px-6 py-2 bg-[#BFFF00] hover:bg-opacity-80 text-[#222222] font-bold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#494949] focus:ring-[#BFFF00]">Primary</button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap px-3 py-1.5 bg-[#222222] text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Primary action button
            </span>
          </div>
          <div className="relative group">
            <button className="px-6 py-2 bg-transparent border-2 border-[#656565] hover:bg-[#BFFF00] hover:border-[#BFFF00] hover:text-[#222222] text-white font-bold rounded-lg transition-colors duration-300">Secondary</button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap px-3 py-1.5 bg-[#222222] text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Secondary outline button
            </span>
          </div>
          <button className="px-6 py-2 bg-[#656565] text-white font-bold rounded-lg opacity-50 cursor-not-allowed" disabled>Disabled</button>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Input Fields</h3>
        <div className="space-y-4 max-w-sm">
          <input type="text" placeholder="Standard Input" className="w-full p-3 bg-[#525252] text-gray-100 border border-[#656565] rounded-lg focus:ring-2 focus:ring-[#BFFF00] focus:outline-none transition-shadow duration-300 placeholder:text-gray-400" />
          <input type="text" placeholder="Disabled Input" className="w-full p-3 bg-[#525252] text-gray-100 border border-[#656565] rounded-lg placeholder:text-gray-400 opacity-50 cursor-not-allowed" disabled />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Card</h3>
        <div className="bg-[#525252] rounded-lg overflow-hidden border border-[#656565] max-w-sm">
          <div className="p-6">
            <h4 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Card Title</h4>
            <p className="text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
              This is a sample card component. It's a versatile container for content, featuring a consistent dark theme, clean typography, and subtle borders.
            </p>
          </div>
          <div className="bg-[#494949] px-6 py-4 border-t border-[#656565]">
            <button className="px-4 py-2 text-sm bg-transparent border border-[#656565] hover:bg-[#656565] text-white font-bold rounded-lg transition-colors duration-300">Action</button>
          </div>
        </div>
      </div>
    </div>
  );
};


const ComponentShowcase: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto bg-[#494949] text-gray-200 p-4 sm:p-8 rounded-lg">
      <Section title="Color Palette">
        <ColorPalette />
      </Section>

      <Section title="Typography">
        <TypographyGuide />
      </Section>

      <Section title="Components">
        <ComponentExamples />
      </Section>
    </div>
  );
};

export default ComponentShowcase;
