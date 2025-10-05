import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider;
  }
}

// Spline component type declarations
declare module '@splinetool/react-spline' {
  import { ComponentType } from 'react';
  
  interface SplineProps {
    scene: string;
    onLoad?: () => void;
    onError?: (error: any) => void;
    style?: React.CSSProperties;
    className?: string;
  }
  
  const Spline: ComponentType<SplineProps>;
  export default Spline;
}
