"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Asset } from "@/types";

interface AssetContextType {
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset | null) => void;
  clearSelection: () => void;
}

const AssetContext = createContext<AssetContextType>({
  selectedAsset: null,
  setSelectedAsset: () => {},
  clearSelection: () => {},
});

export function AssetProvider({ children }: { children: React.ReactNode }) {
  const [selectedAsset, setSelectedAssetState] = useState<Asset | null>(null);

  const setSelectedAsset = useCallback((asset: Asset | null) => {
    setSelectedAssetState(asset);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAssetState(null);
  }, []);

  return (
    <AssetContext.Provider value={{ selectedAsset, setSelectedAsset, clearSelection }}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAssetContext() {
  return useContext(AssetContext);
}
