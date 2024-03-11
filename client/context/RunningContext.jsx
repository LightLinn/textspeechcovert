'use client'

import React, { createContext, useRef, useContext, useEffect } from 'react';

export const RunningContext = createContext();

export const RunningProvider = ({ children }) => {
  const isRunning = useRef(false);

  return (
    <RunningContext.Provider value={isRunning}>
      {children}
    </RunningContext.Provider>
  );
};

// 自定义hook，方便在组件中使用
export const useRunning = () => useContext(RunningContext);
