import React from 'react';
import { useCountries } from '@/context/CountriesGameContext';
import CountriesJoinRoom from './CountriesJoinRoom';
import CountriesAdminScreen from './CountriesAdminScreen';
import CountriesSpectatorScreen from './CountriesSpectatorScreen';

const CountriesGame: React.FC = () => {
  const { screen } = useCountries();

  switch (screen) {
    case 'countriesJoinRoom': return <CountriesJoinRoom />;
    case 'countriesAdmin': return <CountriesAdminScreen />;
    case 'countriesSpectator': return <CountriesSpectatorScreen />;
    default: return null;
  }
};

export default CountriesGame;
