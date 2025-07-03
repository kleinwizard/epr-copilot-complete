import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

interface MetricWithInfoProps {
  title: string;
  value: string | number | null;
  explanation: string;
  className?: string;
  children?: React.ReactNode;
  status?: string;
  insufficientDataMessage?: string;
}

export function MetricWithInfo({ 
  title, 
  value, 
  explanation, 
  className = "", 
  children,
  status = "success",
  insufficientDataMessage = "More data required. This metric will populate after 3 months of data is available."
}: MetricWithInfoProps) {
  const [isInfoVisible, setInfoVisible] = useState(false);
  const isInsufficientData = status === 'insufficient_data';

  if (isInsufficientData) {
    return (
      <div className={`metric-container relative ${className}`}>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{title}</p>
              <p className="text-lg text-gray-400 mt-1">--</p>
              <p className="text-xs text-gray-400 mt-2">{insufficientDataMessage}</p>
            </div>
            <div className="text-gray-300">
              <Info className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`metric-container relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <button 
          onClick={() => setInfoVisible(!isInfoVisible)} 
          className="info-button p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Show calculation details"
        >
          <Info className="h-4 w-4 text-gray-500 hover:text-gray-700" />
        </button>
      </div>
      
      <div className="text-2xl font-bold mb-2">
        {value}
      </div>
      
      {children}
      
      {isInfoVisible && (
        <div className="info-popup absolute top-8 right-2 bg-white p-4 rounded-lg shadow-lg border z-10 max-w-sm">
          <h5 className="font-bold mb-2 text-sm">How is this calculated?</h5>
          <p className="text-sm text-gray-600 leading-relaxed">{explanation}</p>
          <button 
            onClick={() => setInfoVisible(false)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
