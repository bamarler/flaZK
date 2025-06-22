// components/ScenarioSelector.tsx
import { useState, useEffect } from 'react';
import { getCurrentScenario, setScenario, type MockScenario } from '../mocks/scenarios';
import { config } from '../config';

export function ScenarioSelector() {
  const [currentScenario, setCurrentScenario] = useState<MockScenario>(getCurrentScenario());
  const [isOpen, setIsOpen] = useState(false);

  const scenarios: { value: MockScenario; label: string; description: string }[] = [
    {
      value: 'all-docs',
      label: 'All Documents',
      description: 'User has all required documents'
    },
    {
      value: 'missing-one',
      label: 'Missing One',
      description: 'Missing driving record points'
    },
    {
      value: 'missing-two',
      label: 'Missing Two',
      description: 'Missing license expiry & points'
    }
  ];

  const handleScenarioChange = (scenario: MockScenario) => {
    setScenario(scenario);
    setCurrentScenario(scenario);
    // Reload page to reset state
    window.location.reload();
  };

  // Only show in development with mocks enabled
  if (!config.isDevelopment || !config.useMocks) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        Scenario: {scenarios.find(s => s.value === currentScenario)?.label}
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[250px]">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
            Mock Scenarios
          </p>
          {scenarios.map((scenario) => (
            <button
              key={scenario.value}
              onClick={() => handleScenarioChange(scenario.value)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                currentScenario === scenario.value
                  ? 'bg-purple-100 text-purple-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-sm">{scenario.label}</div>
              <div className="text-xs text-gray-500">{scenario.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}