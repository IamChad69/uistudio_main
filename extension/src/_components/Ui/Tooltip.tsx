import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface TooltipProps {
  children: React.ReactNode;
  text: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  showDelay?: number;
  className?: string;
  showHoverEffect?: boolean;
}

// Define all styles as constants to keep the JSX clean
const styles = {
  container: {
    position: 'relative' as const,
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  motionWrapper: {
    position: 'relative' as const,
    zIndex: 0,
  },
  hoverEffect: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Changed from purple to white with opacity
    borderRadius: '9999px',
    opacity: 0,
    zIndex: 0,
  },
  childrenWrapper: {
    position: 'relative' as const,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  tooltipBase: {
    position: 'absolute' as const,
    whiteSpace: 'nowrap' as const,
    backgroundColor: '#000000', // Pure black background
    color: 'white',
    fontSize: '12px',
    padding: '6px 10px',
    borderRadius: '4px',
    pointerEvents: 'none' as const,
    zIndex: 50,
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1.4,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: 400,
  },
  tooltipArrow: {
    position: 'absolute' as const,
    width: '6px',
    height: '6px',
    backgroundColor: '#000000', // Pure black background
    transform: 'rotate(45deg)',
    display: 'block', // Show the arrow
  },
  // Position-specific styles for the arrow
  arrowTop: {
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
  },
  arrowRight: {
    right: '100%',
    top: '25%',
    transform: 'translateY(50%) translateX(50%) rotate(45deg)',
  },
  arrowBottom: {
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%) translateY(50%) rotate(45deg)',
  },
  arrowLeft: {
    right: '-3px', // Position the arrow at the right edge of the tooltip
    top: '50%',
    transform: 'translateY(-50%) rotate(-45deg)', // Rotate -45 degrees to point right
  },
  kbd: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1px 3px',
    fontSize: '10px',
    lineHeight: '1',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: 'transparent',
    color: '#ffffff',
    margin: '0',
    minWidth: '12px',
    height: '16px',
    border: 'none',
    boxShadow: 'none',
    fontWeight: 500,
  },
  kbdContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: '3px',
    padding: '2px 4px',
    marginLeft: '8px',
    gap: '2px',
  },
};

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  text,
  position = 'top',
  showDelay = 0.2,
  className = '',
  showHoverEffect = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Position offsets based on the desired tooltip position
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return { bottom: '100%', left: '50%', x: '-50%', y: '-8px' };
      case 'right':
        return { left: '100%', top: '50%', x: '8px', y: '-50%' };
      case 'bottom':
        return { top: '100%', left: '50%', x: '-50%', y: '8px' };
      case 'left':
        return { right: '100%', top: '50%', x: '-8px', y: '-50%' };
      default:
        return { bottom: '100%', left: '50%', x: '-50%', y: '-8px' };
    }
  };

  // Get arrow styles based on position
  const getArrowStyles = () => {
    let arrowStyle = {};

    switch (position) {
      case 'top':
        arrowStyle = { ...styles.arrowTop };
        break;
      case 'right':
        arrowStyle = { ...styles.arrowRight };
        break;
      case 'bottom':
        arrowStyle = { ...styles.arrowBottom };
        break;
      case 'left':
        arrowStyle = { ...styles.arrowLeft };
        break;
      default:
        arrowStyle = { ...styles.arrowTop };
    }

    return arrowStyle;
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(className ? { className } : {}),
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {/* The circular hover effect wrapper */}
      <motion.div
        style={styles.motionWrapper}
        whileHover={{
          scale: 1.05,
        }}
        whileTap={{
          scale: 0.95,
        }}
      >
        {/* Circular background effect on hover */}
        {showHoverEffect && (
          <motion.div
            style={styles.hoverEffect}
            animate={{
              opacity: isVisible ? 0.2 : 0,
              scale: isVisible ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* The actual button/content */}
        <div style={styles.childrenWrapper}>{children}</div>
      </motion.div>

      {/* Tooltip content */}
      {isVisible && (
        <motion.div
          style={{
            ...styles.tooltipBase,
            ...getPositionStyles(),
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            duration: 0.2,
            delay: isVisible ? showDelay : 0,
          }}
        >
          {typeof text === 'string' ? (
            <div
              dangerouslySetInnerHTML={{
                __html: text
                  .replace(
                    /<kbd>/g,
                    `<span style="${Object.entries(styles.kbd)
                      .map(([key, value]) => `${key}:${value}`)
                      .join(';')}">`
                  )
                  .replace(/<\/kbd>/g, '</span>')
                  .replace(
                    /class="kbd-container"/g,
                    `style="${Object.entries(styles.kbdContainer)
                      .map(([key, value]) => `${key}:${value}`)
                      .join(';')}"`
                  ),
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            />
          ) : (
            text
          )}
          <div
            style={{
              ...styles.tooltipArrow,
              ...getArrowStyles(),
            }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default Tooltip;
