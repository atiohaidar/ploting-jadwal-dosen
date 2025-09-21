
import React, { useState } from 'react';

interface InputFormProps {
  onSubmit: (description: string) => void;
  isLoading: boolean;
}

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9.93 2.55a2 2 0 0 0-1.86 0L6.6 4.2a2 2 0 0 1-2.12 0l-.7-.7a2 2 0 0 0-2.83 0L.25 4.2a2 2 0 0 0 0 2.83l.7.7a2 2 0 0 1 0 2.12l-1.47 1.47a2 2 0 0 0 0 2.83l1.47 1.47a2 2 0 0 1 0 2.12l-.7.7a2 2 0 0 0 0 2.83l.7.7a2 2 0 0 0 2.83 0l.7-.7a2 2 0 0 1 2.12 0l1.47 1.47a2 2 0 0 0 2.83 0l1.47-1.47a2 2 0 0 1 2.12 0l.7.7a2 2 0 0 0 2.83 0l.7-.7a2 2 0 0 0 0-2.83l-.7-.7a2 2 0 0 1 0-2.12L22 12a2 2 0 0 0 0-2.83l-1.47-1.47a2 2 0 0 1 0-2.12l.7-.7a2 2 0 0 0 0-2.83l-.7-.7a2 2 0 0 0-2.83 0l-.7.7a2 2 0 0 1-2.12 0L9.93 2.55Z"/>
    </svg>
);


const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit(description);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
        Describe Your Project
      </h2>
      <p className="text-center text-gray-300">
        Provide a detailed description of your project, including its purpose, target audience, and desired feel (e.g., "minimalist", "playful", "corporate"). The more detail you give, the better the design guide will be.
      </p>
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., A sleek, modern productivity app for developers with a dark mode theme. It should feel techy and futuristic..."
          className="w-full h-40 p-4 bg-[#525252] text-gray-100 border border-[#656565] rounded-lg focus:ring-2 focus:ring-[#656565] focus:outline-none transition-shadow duration-300 placeholder:text-gray-400"
          disabled={isLoading}
        />
      </div>
      <div className="text-center">
        <button
          type="submit"
          disabled={isLoading || !description.trim()}
          className="inline-flex items-center justify-center px-8 py-3 bg-[#656565] hover:bg-opacity-80 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#494949] focus:ring-white"
        >
          {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
            </>
          ) : (
            <>
                <SparklesIcon className="mr-2 h-5 w-5"/>
                Generate Design Guide
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default InputForm;
