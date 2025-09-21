import React from 'react';
import ComponentShowcase from './components/ComponentShowcase';

const App: React.FC = () => {
  return (
    <div className="min-h-screen text-white p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <header className="text-center my-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Web Design Guide
          </h1>
          <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
            A guide to the visual style, components, and design patterns for this project.
          </p>
        </header>

        <main className="mt-8 flex justify-center items-center flex-col">
          <div className="animate-fade-in w-full">
            <ComponentShowcase />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;