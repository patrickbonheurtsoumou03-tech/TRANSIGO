import React, { useEffect, useState } from 'react';
import { PageId } from '../types';

interface PageTransitionWrapperProps {
  pageKey: PageId;
  transitionType?: 'arrive' | 'slide' | 'zoom';
  children: React.ReactNode;
}

export const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({
  pageKey,
  transitionType = 'arrive',
  children,
}) => {
  const [animKey, setAnimKey] = useState(pageKey);

  useEffect(() => {
    setAnimKey(pageKey);
  }, [pageKey]);

  const animationClass =
    transitionType === 'zoom'
      ? 'animate-page-zoom'
      : transitionType === 'slide'
      ? 'animate-page-slide'
      : 'animate-page-arrive';

  return (
    <div
      key={animKey}
      className={`w-full flex-1 transition-all duration-300 ${animationClass}`}
    >
      {children}
    </div>
  );
};
