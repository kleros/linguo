export default {
  color: {
    text: {
      default: '#000000',
      light: '#4A4A4A',
      inverted: '#FFFFFF',
    },
    primary: {
      default: '#0043C5',
      dark: '#00308D',
    },
    secondary: {
      default: '#009AFF',
      light: '#3DBEFF',
    },
    info: {
      default: '#009AFF',
    },
    warning: {
      default: '#FAAD14',
    },
    danger: {
      default: '#F60C36',
      light: '#FF4D4F',
    },
    success: {
      default: '#00C42B',
      light: '#389E0D',
    },
    background: {
      default: '#FBFFFF',
      light: '#FFFFFF',
      blueish: '#F2FFFE',
      neutral: '#F5F1FD',
    },
    link: {
      default: '#009AFF',
      highlight: '#0043C5',
      inverted: '#FFFFFF',
    },
    shadow: {
      default: 'rgba(0, 0, 0, 0.06)',
      light: 'rgba(0, 0, 0, 0.06)',
      ui: 'rgba(0, 0, 0, 0.06)',
    },
    glow: {
      default: 'rgba(255, 255, 255, 0.5)',
    },
    border: {
      default: '#CDDEFF',
    },
  },
  fontSize: {
    xxl: '1.5rem',
    xl: '1.25rem',
    lg: '1.125rem',
    md: '1rem',
    sm: '0.875rem',
    xs: '0.75rem',
    xxs: '0.625rem',
  },
  fontWeight: {
    regular: 400,
    medium: 400,
    semibold: 600,
    bold: 600,
  },
  transition: {
    slow: '0.5s cubic-bezier(0.77, 0, 0.175, 1)',
    default: '0.25s cubic-bezier(0.77, 0, 0.175, 1)',
    fast: '0.1s cubic-bezier(0.77, 0, 0.175, 1)',
  },
  debug: 'outline: 2px solid red',
  hexToRgba: (hexColor, alpha) => {
    let hexValues = hexColor.replace('#', '');
    const isShorthand = hexValues.length === 3;

    if (isShorthand) {
      /* Convert #000 to #000000 */
      hexValues = hexValues
        .split('')
        .map(v => `${v}${v}`)
        .join('');
    }

    const hexComponents = hexValues.match(/[0-9a-f]{2}/gi);
    const [r, g, b] = hexComponents.map(hex => Number.parseInt(hex, 16));

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
};
