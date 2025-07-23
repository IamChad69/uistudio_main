import React from 'react';

interface SwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  'aria-label'?: string;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onChange,
  'aria-label': ariaLabel,
  disabled = false,
}) => {
  // Generate an ID if none provided
  const switchId = id || `switch-${Math.random().toString(36).substring(2, 9)}`;

  const styles = {
    switch: {
      position: 'relative' as const,
      display: 'inline-block',
      width: '36px',
      height: '20px',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    },
    input: {
      opacity: 0,
      width: 0,
      height: 0,
    },
    slider: {
      position: 'absolute' as const,
      cursor: disabled ? 'not-allowed' : 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: checked ? '#8B5CF6' : '#374151', // Using purple-600 and gray-700 colors
      transition: '.3s',
      borderRadius: '34px',
    },
    sliderBefore: {
      position: 'absolute' as const,
      content: '""',
      height: '16px',
      width: '16px',
      left: checked ? '18px' : '2px',
      bottom: '2px',
      backgroundColor: 'white',
      transition: '.3s',
      borderRadius: '50%',
    },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <label style={styles.switch} htmlFor={switchId}>
      <input
        type="checkbox"
        id={switchId}
        checked={checked}
        onChange={handleChange}
        style={styles.input}
        aria-label={ariaLabel || `Toggle ${id || 'switch'}`}
        disabled={disabled}
      />
      <span style={{ ...styles.slider }}>
        <span style={styles.sliderBefore} />
      </span>
    </label>
  );
};

export default Switch;
