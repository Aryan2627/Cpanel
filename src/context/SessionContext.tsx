"use client";
import React, { createContext, useContext } from 'react';

type SessionType = any;

type SessionContextType = {
  session: SessionType;
  loading: boolean;
};

export const SessionContext = createContext<SessionContextType>({ session: null, loading: true });

export const useSession = () => useContext(SessionContext);
