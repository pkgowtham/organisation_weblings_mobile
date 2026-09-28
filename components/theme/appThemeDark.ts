export const appThemeDark = {
  colors: {
    neutral: {
      surface: {
        lighter: "#060606",
        light: "#131313",
        medium: "#252525",
        disabled: "#060606",
        inverse: "#ffffff"
      },
      border: {
        light: "#252525",
        medium: "#4c4c4c",
        disabled: "#252525",
        dark: "#626262"
      },
      onSurface: {
        light: "#dedede",
        medium: "#c1c1c1",
        dark: "#7f7f7f",
        inverse: "#151515",
        disabled: "#626262"
      },
      overlay: {
        light: "rgba(0,0,0,0.15)",
        medium: "rgba(0,0,0,0.30)",
        dark: "rgba(0,0,0,0.50)"
      }
    },
    brand: {
      surface: {
        lighter: "#00142a",
        light: "#003966",
        medium: "#0081dd",
        dark: "#56a3fe",
        darker: "#9fc3fe"
      },
      border: {
        light: "#002546",
        medium: "#0065ae",
        dark: "#cfdffe"
      },
      onSurface: {
        light: "#0081dd",
        medium: "#131313"
      }
    },
    info: {
      surface: {
        lighter: "#200035",
        light: "#54008e",
        medium: "#a64fff",
        dark: "#ba88ff",
        darker: "#d1b5ff"
      },
      border: {
        light: "#390063",
        medium: "#9100f0",
        dark: "#e6d8ff"
      },
      onSurface: {
        light: "#a64fff",
        medium: "#131313"
      }
    },
    positive: {
      surface: {
        lighter: "#001900",
        light: "#004100",
        medium: "#18922c",
        dark: "#5bb35f",
        darker: "#94d095"
      },
      border: {
        light: "#002c00",
        medium: "#007307",
        dark: "#c7e6c7"
      },
      onSurface: {
        light: "#18922c",
        medium: "#131313"
      }
    },
    negative: {
      surface: {
        lighter: "#320003",
        light: "#750010",
        medium: "#fc002f",
        dark: "#fe757d",
        darker: "#feabaf"
      },
      border: {
        light: "#510008",
        medium: "#c80023",
        dark: "#fed4d6"
      },
      onSurface: {
        light: "#fc002f",
        medium: "#131313"
      }
    },
    warning: {
      surface: {
        lighter: "#260d00",
        light: "#5c2900",
        medium: "#c76200",
        dark: "#fc7d00",
        darker: "#feaf8e"
      },
      border: {
        light: "#3f1a00",
        medium: "#9d4c00",
        dark: "#fed5c8"
      },
      onSurface: {
        light: "#c76200",
        medium: "#131313"
      }
    }
  },
  brandColorGradient: {
    colors: ['#0081dd', '#56a3fe'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  borderRadius: {
    b0: 0,
    b50: 2,
    b100: 4,
    b150: 6,
    b200: 8,
    b300: 12,
    b400: 16,
    b500: 20,
    b700: 28,
    b900: 36,
    b1200: 48,
    b2500: 100
  },
  fontSize: {
    DM: { size: 84, lineHeight: 100 },
    HM: { size: 48, lineHeight: 60 },
    HS: { size: 36, lineHeight: 44 },
    TM: { size: 28, lineHeight: 36 },
    TS: { size: 20, lineHeight: 28 },
    BL: { size: 18, lineHeight: 28 },
    BM: { size: 16, lineHeight: 24 },
    BS: { size: 14, lineHeight: 22 },
    BXS: { size: 12, lineHeight: 16 },
    LM: { size: 16, lineHeight: 24 },
    LS: { size: 14, lineHeight: 22 },
    LXS: { size: 12, lineHeight: 16 }
  },
  spacing: {
    s0: 0,
    s100: 4,
    s200: 8,
    s300: 12,
    s400: 16,
    s500: 20,
    s600: 24,
    s700: 28,
    s800: 32,
    s900: 36,
    s1000: 40,
    s1200: 48,
    s1600: 62,
    s2000: 80,
  },
  elevation: {
    s: "0px 0px 6px 0px rgba(0, 0, 0, 0.25)",
    m: "0px 0px 6px 2px rgba(0, 0, 0, 0.25)",
    l: "0px 0px 8px 4px rgba(0, 0, 0, 0.25)"
  },
  easing: {
    li: "(0, 0, 1, 1)",
    eIn: "(0.1, 0, 0.3, 1)",
    eOut: "(0.3, 0, 0.7, 1)",
    einout: "(0.4, 0, 0.6, 1)",
    bo: "(0.4, -0.3, 0.6, 1)"
  },
  duration: {
    d1: 0,
    d2: 0.05,
    d3: 0.15,
    d4: 0.3,
    d5: 0.5,
    d6: 1
  }
}