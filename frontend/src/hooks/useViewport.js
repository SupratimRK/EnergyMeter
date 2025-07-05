import { useState, useEffect } from 'react';

export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...viewport,
    isMobile: viewport.width < 640,
    isTablet: viewport.width >= 640 && viewport.width < 1024,
    isDesktop: viewport.width >= 1024,
    isLargeDesktop: viewport.width >= 1280,
  };
};

export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isTouchDevice: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
  });

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

    setDeviceInfo({
      isTouchDevice,
      isIOS,
      isAndroid,
      isSafari,
    });
  }, []);

  return deviceInfo;
};
