export default {
  text: {
    default: '#000000',
    inverted: '#FFFFFF',
  },
  primary: {
    default: '#0043C5',
  },
  secondary: {
    default: '#00AAFF',
  },
  warning: {
    default: '#FF9900',
  },
  danger: {
    default: '#F60C36',
  },
  link: {
    default: '#0043C5',
    inverted: '#FFFFFF',
  },
  background: {
    default: '#F2FFFE',
    light: '#FFFFFF',
  },
  shadow: {
    default: 'rgba(24, 0, 255, 0.5)',
    ui: 'rgba(0, 67, 197, 0.5);',
  },
  glow: {
    default: 'rgba(255, 255, 255, 0.5)',
  },
  fontSize: {
    xl: '1.5rem',
    lg: '1.33rem',
    md: '1rem',
    sm: '0.875rem',
    xs: '0.75rem',
  },
  hexToRgba: (hexColor, alpha) => {
    let hexValues = hexColor.replace('#', '');
    const isShorthand = hexColor.length === 3;

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
  debug: 'outline: 2px solid red',
};
