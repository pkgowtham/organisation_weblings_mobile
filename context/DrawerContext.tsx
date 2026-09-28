import React, { createContext, useContext, useState } from 'react';

type DrawerType = 'mail' | 'eoffice' | 'accounts' | null;

interface DrawerContextType {
  openDrawer: (type: DrawerType) => void;
  closeDrawer: () => void;
  activeDrawer: DrawerType;
  selectedLabel?: string;
  selectedEOfficeLabel?: string;
  selectedAccountsLabel?: string;
  setSelectedLabel: (label: string) => void;
  setSelectedEOfficeLabel: (label: string) => void;
  setSelectedAccountsLabel: (label: string) => void;
}

const DrawerContext = createContext<DrawerContextType>({
  openDrawer: () => {},
  closeDrawer: () => {},
  activeDrawer: null,
  selectedLabel: "Inbox",
  selectedEOfficeLabel: "Attendance",
  selectedAccountsLabel: "Org Details",
  setSelectedLabel: () => {},
  setSelectedEOfficeLabel: () => {},
  setSelectedAccountsLabel: () => {},
});

export const useDrawer = () => useContext(DrawerContext);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [selectedLabel, setSelectedLabel] = useState("Inbox");
  const [selectedEOfficeLabel, setSelectedEOfficeLabel] = useState("Attendance");
  const [selectedAccountsLabel, setSelectedAccountsLabel] = useState("Org Details");

  const openDrawer = (type: DrawerType) => {
    setActiveDrawer(type);
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
  };

  return (
    <DrawerContext.Provider
      value={{
        openDrawer,
        closeDrawer,
        activeDrawer,
        selectedLabel,
        selectedEOfficeLabel,
        selectedAccountsLabel,
        setSelectedLabel,
        setSelectedEOfficeLabel,
        setSelectedAccountsLabel,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};