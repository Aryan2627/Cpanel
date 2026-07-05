'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Intake = {
  refId: string;
  title: string;
  reqName: string;
  status: string;
  type: string;
  buyer: string;
  reqAt: string;
  updAt: string;
};

type IntakeContextType = {
  intakes: Intake[];
  addIntake: (intake: Intake) => Promise<void>;
};

const IntakeContext = createContext<IntakeContextType | undefined>(undefined);

export function IntakeProvider({ children }: { children: ReactNode }) {
  const [intakes, setIntakes] = useState<Intake[]>([]);

  useEffect(() => {
    // Fetch initial data from API
    fetch('/api/intakes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setIntakes(data);
        }
      })
      .catch(err => console.error('Failed to fetch intakes:', err));
  }, []);

  const addIntake = async (intake: Intake) => {
    try {
      const response = await fetch('/api/intakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intake),
      });
      if (response.ok) {
        const newIntake = await response.json();
        setIntakes(prev => [newIntake, ...prev]);
      } else {
        console.error('Failed to add intake to DB');
      }
    } catch (err) {
      console.error('Error adding intake:', err);
    }
  };

  return (
    <IntakeContext.Provider value={{ intakes, addIntake }}>
      {children}
    </IntakeContext.Provider>
  );
}

export function useIntake() {
  const context = useContext(IntakeContext);
  if (context === undefined) {
    throw new Error('useIntake must be used within an IntakeProvider');
  }
  return context;
}
