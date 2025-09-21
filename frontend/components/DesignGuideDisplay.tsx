
import React from 'react';
import type { DesignGuide, Color, Typography } from '../types';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-[#656565]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {title}
    </h2>
    {children}
  </section>
);

const ColorPalette: React.FC<{ colors: Color[] }> = ({ colors }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {colors.map((color) => (
      <div key={color.hex} className="bg-[#525252] p-4 rounded-lg shadow-md transition-transform transform hover:-translate-y-1">
        <div className="w-full h-24 rounded-md mb-3 border border-[#656565]" style={{ backgroundColor: color.hex }}></div>
        <h4 className="font-bold text-lg text-white">{color.name}</h4>
        <p className="text-gray-300 font-mono" style={{ fontFamily: "'Fira Code', monospace" }}>{color.hex.toUpperCase()}</p>
        <p className="text-sm text-gray-400 mt-2">{color.description}</p>
      </div>
    ))}
  </div>
);

const TypographyGuide: React.FC<{ typography: Typography }> = ({ typography }) => (
  <div className="space-y-8">
    <div>
      <h3 className="text-xl font-semibold text-gray-200 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Headings</h3>
      <p className="text-5xl" style={{ fontFamily: `'${typography.heading.fontFamily}', sans-serif`, fontWeight: typography.heading.fontWeight }}>
        Aa - The quick brown fox
      </p>
      <div className="mt-3 text-gray-400">
        <span className="font-semibold text-gray-300">Font:</span> {typography.heading.fontFamily} | <span className="font-semibold text-gray-300">Weight:</span> {typography.heading.fontWeight}
        <p className="mt-1 text-sm">{typography.heading.description}</p>
      </div>
    </div>
    <div className="border-t border-[#656565] my-6"></div>
    <div>
      <h3 className="text-xl font-semibold text-gray-200 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Body Text</h3>
      <p className="text-lg" style={{ fontFamily: `'${typography.body.fontFamily}', sans-serif`, fontWeight: typography.body.fontWeight }}>
        The quick brown fox jumps over the lazy dog. This is the default text style for paragraphs and other long-form content, designed for maximum readability and a clean, modern aesthetic.
      </p>
      <div className="mt-3 text-gray-400">
        <span className="font-semibold text-gray-300">Font:</span> {typography.body.fontFamily} | <span className="font-semibold text-gray-300">Weight:</span> {typography.body.fontWeight}
        <p className="mt-1 text-sm">{typography.body.description}</p>
      </div>
    </div>
    <div className="border-t border-[#656565] my-6"></div>
    <div>
        <h3 className="text-xl font-semibold text-gray-200 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Code Snippets</h3>
        <pre className="bg-[#3a3a3a] p-4 rounded-md text-sm" style={{ fontFamily: `'${typography.code.fontFamily}', monospace`, fontWeight: typography.code.fontWeight }}>
            <code>{`const greeting = "Hello, World!";\nconsole.log(greeting);`}</code>
        </pre>
        <div className="mt-3 text-gray-400">
            <span className="font-semibold text-gray-300">Font:</span> {typography.code.fontFamily} | <span className="font-semibold text-gray-300">Weight:</span> {typography.code.fontWeight}
            <p className="mt-1 text-sm">{typography.code.description}</p>
        </div>
    </div>
  </div>
);

const InfoCard: React.FC<{title: string; description: string}> = ({title, description}) => (
    <div className="bg-[#525252] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-200 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
);


const DesignGuideDisplay: React.FC<{ guide: DesignGuide }> = ({ guide }) => {
  return (
    <div className="w-full max-w-5xl mx-auto bg-[#494949] text-gray-200 p-4 sm:p-8 rounded-lg">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {guide.projectName}
        </h1>
        <p className="text-lg text-gray-300 mt-2">Design Guide</p>
      </header>

      <Section title="Color Palette">
        <ColorPalette colors={guide.palette} />
      </Section>

      <Section title="Typography">
        <TypographyGuide typography={guide.typography} />
      </Section>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Section title="Iconography">
            <InfoCard title="Style Guide" description={guide.iconography} />
        </Section>
        <Section title="Layout & Spacing">
            <InfoCard title="Core Principles" description={guide.layout} />
        </Section>
      </div>

       <Section title="Logo Concept">
            <InfoCard title="Initial Idea" description={guide.logoConcept} />
        </Section>
    </div>
  );
};

export default DesignGuideDisplay;
