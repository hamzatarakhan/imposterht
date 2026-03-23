import React from 'react';
import { useCountries } from '@/context/CountriesGameContext';
import CountriesModeSelect from './CountriesModeSelect';
import CountriesCreateRoom from './CountriesCreateRoom';
import CountriesJoinRoom from './CountriesJoinRoom';
import CountriesAdminScreen from './CountriesAdminScreen';
import CountriesSpectatorScreen from './CountriesSpectatorScreen';

const CountriesGame: React.FC = () => {
  const { screen } = useCountries();

  switch (screen) {
    case 'countriesModeSelect': return <CountriesModeSelect />;
    case 'countriesCreateRoom': return <CountriesCreateRoom />;
    case 'countriesJoinRoom': return <CountriesJoinRoom />;
    case 'countriesAdmin': return <CountriesAdminScreen />;
    case 'countriesSpectator': return <CountriesSpectatorScreen />;
    default: return <CountriesModeSelect />;
  }
};

export default CountriesGame;
