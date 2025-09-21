import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#222222] text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          {/* 404 Icon/Graphic */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-[#BFFF00] mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
              404
            </div>
            <div className="text-6xl text-[#656565]">😵</div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl font-bold text-[#BFFF00] mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Page Not Found
          </h1>

          <p className="text-xl text-[#AAAAAA] mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-[#BFFF00] text-[#222222] font-semibold px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => navigate(-1)}
              className="bg-[#656565] text-[#AAAAAA] font-semibold px-6 py-3 rounded-md hover:bg-[#525252] transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Go Back
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-12 text-sm text-[#656565]">
            <p>If you believe this is an error, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;