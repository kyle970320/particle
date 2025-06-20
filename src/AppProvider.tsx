import React, { useCallback, useEffect, useMemo, useState } from "react";

interface DeviceMotionEventWithPermission extends DeviceMotionEvent {
  constructor: {
    requestPermission?: () => Promise<"granted" | "denied">;
  };
}
const AppContext = React.createContext({
  loaded: false,
  size: { w: 0, h: 0, iw: 0, ih: 0 },
});

const KEY = "motion_sensor";
const isNotMouse = () => {
  if (typeof window === "undefined") return false;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  return (
    window.innerWidth <= 1024 &&
    (isTouch || typeof window.DeviceOrientationEvent !== "undefined")
  );
};

export const AppProvider = ({ children }) => {
  const [loaded, setLoaded] = useState();
  const [showMenu, setShowMenu] = useState(false);
  const [psmode, setPSMode] = useState(false);

  const [size, setSize] = useState({ w: 0, h: 0, iw: 0, ih: 0 });
  const onChangeWindowSize = useCallback(
    (window) => {
      const _size = { w: 0, h: 0, iw: size.iw, ih: size.ih };
      if (typeof window !== "undefined") {
        if (isNotMouse()) {
          _size.w = screen.availWidth;
          _size.h = screen.availHeight;
          if (size.iw === 0 && size.ih === 0) {
            _size.iw = window.innerWidth;
            _size.ih = window.innerHeight;
          }
        } else {
          _size.w = window.innerWidth;
          _size.h = window.innerHeight;
          // _size.iw = window.innerWidth;
          // _size.ih = window.innerHeight;
        }
        setSize(_size);
      }
    },
    [size.iw === size.ih],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onResize = () => onChangeWindowSize(window);
      onResize();
      window.addEventListener("resize", onResize, false);
      return () => {
        window.removeEventListener("resize", onResize, false);
      };
    }
    return () => null;
  }, [onChangeWindowSize]);

  const isAppleDevice =
    typeof navigator !== "undefined" &&
    navigator?.userAgent?.includes("iPhone");
  const [showModal, setShowModal] = useState(false);
  const [handleEvents, setHandleEvents] = useState(false);
  const DeviceMotionWithPerm = DeviceMotionEvent as unknown as {
    requestPermission: () => Promise<"granted" | "denied">;
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAppleDevice) {
      setHandleEvents(true);
      return;
    }
    if (!!sessionStorage.getItem(KEY) !== handleEvents) {
      setHandleEvents(!!sessionStorage.getItem(KEY));
    } else if (typeof DeviceMotionWithPerm.requestPermission === "function") {
      setTimeout(() => setShowModal(true), 1);
    }
  }, [isAppleDevice, typeof window]);

  const handlePermission = useCallback(async (code) => {
    if (code) {
      sessionStorage.setItem(KEY, code);
      setHandleEvents(true);
      return;
    }

    const perm = await DeviceMotionWithPerm.requestPermission();
    sessionStorage.setItem(KEY, perm);
    setHandleEvents(true);
    setShowModal(false);
  }, []);

  const value = useMemo(() => {
    return {
      loaded,
      setLoaded,
      showMenu,
      setShowMenu,
      size,
      handleEvents,
      psmode,
      setPSMode,
    };
  }, [loaded, showMenu, size, handleEvents, psmode]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
