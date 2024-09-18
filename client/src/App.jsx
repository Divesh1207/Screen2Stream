
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Hero from './components/Hero/Hero';
import ResultSection from './components/ResultSection';
const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/result" element={<ResultSection />} />
    </Routes>
  </Router>
);

export default App;
