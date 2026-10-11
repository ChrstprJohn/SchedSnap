import { createContext, useContext } from 'react';
export const CatalogContext = createContext({ templates: [], loading: true, error: '' });
export const useTemplates = () => useContext(CatalogContext).templates;
export const useCatalogStatus = () => useContext(CatalogContext);
