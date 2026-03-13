import React, { createContext, useContext, ReactNode } from 'react';

interface ActiveSpeakersContextType {
  activeSpeakers: string[];
}

const ActiveSpeakersContext = createContext<ActiveSpeakersContextType>({ activeSpeakers: [] });

export const ActiveSpeakersProvider: React.FC<{ activeSpeakers: string[]; children: ReactNode }> = ({ activeSpeakers, children }) => (
  <ActiveSpeakersContext.Provider value={{ activeSpeakers }}>
    {children}
  </ActiveSpeakersContext.Provider>
);

export const useActiveSpeakers = () => useContext(ActiveSpeakersContext);
