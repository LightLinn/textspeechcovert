"use client";

import React, { createContext, useState, useContext } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [phrases, setPhrases] = useState([{id: 0, paragraph: 0, content: ""}] );

  return (
    <DataContext.Provider value={{ phrases, setPhrases }}>
      {children}
      
    </DataContext.Provider>
  );
};