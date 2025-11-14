import React, { useEffect, useRef } from 'react';
import { Platform, View, StyleProp, ViewStyle } from 'react-native';

type Props = {
  source: any; 
  loop?: boolean;
  autoPlay?: boolean;
  speed?: number;
  style?: StyleProp<ViewStyle>;
  onAnimationFinish?: () => void;
};

export default function LottiePlayer({
  source,
  loop = true,
  autoPlay = true,
  speed = 1,
  style,
  onAnimationFinish,
}: Props) {
  if (Platform.OS === 'web') {
    return (
      <WebLottie
        source={source}
        loop={loop}
        autoPlay={autoPlay}
        speed={speed}
        style={style}
        onAnimationFinish={onAnimationFinish}
      />
    );
  }

  // lazy require for native to avoid SSR issues
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const LottieView = require('lottie-react-native').default;
  return (
    <LottieView
      source={source}
      autoPlay={autoPlay}
      loop={loop}
      speed={speed}
      style={style}
      onAnimationFinish={onAnimationFinish}
    />
  );
}

/* ---------- Web implementation (uses lottie-web dynamically) ---------- */
function WebLottie({ source, loop, autoPlay, speed, style, onAnimationFinish }: any) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    let lottie: any;
    (async () => {
      lottie = (await import('lottie-web')).default;
      if (cancelled) return;
      if (!containerRef.current) return;

      // handle CommonJS vs ES module default import shape
      const json = source && source.default ? source.default : source;

      animRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop,
        autoplay: autoPlay,
        animationData: json,
      });

      animRef.current.setSpeed(speed || 1);
      if (onAnimationFinish) {
        animRef.current.addEventListener('complete', () => onAnimationFinish());
      }
    })();

    return () => {
      cancelled = true;
      try {
        animRef.current?.destroy();
      } catch (e) {
        // ignore
      }
    };
  }, [source, loop, autoPlay, speed, onAnimationFinish]);

  return (
    // style is a RN style prop but for web we accept inline style object
    // eslint-disable-next-line react/no-danger
    <div ref={containerRef as any} style={(style as any) ?? { width: '100%', height: '100%' }} />
  );
}