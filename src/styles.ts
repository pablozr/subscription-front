import { definePreset } from '@primeng/themes'
import Aura from '@primeng/themes/aura'

export const Amethyst = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '4px',
      sm: '6px',
      md: '10px',
      lg: '14px',
      xl: '20px'
    }
  },
  semantic: {
    primary: {
      50: '{violet.50}',
      100: '{violet.100}',
      200: '{violet.200}',
      300: '{violet.300}',
      400: '{violet.400}',
      500: '{violet.500}',
      600: '{violet.600}',
      700: '{violet.700}',
      800: '{violet.800}',
      900: '{violet.900}',
      950: '{violet.950}'
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{violet.400}',
      offset: '2px'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{violet.700}',
          inverseColor: '#ffffff',
          hoverColor: '{violet.800}',
          activeColor: '{violet.900}'
        },
        highlight: {
          background: '{violet.50}',
          focusBackground: '{violet.100}',
          color: '{violet.700}',
          focusColor: '{violet.800}'
        },
        surface: {
          0: '#f3f2f6',
          50: '#ebeaf0',
          100: '#e2e0e8',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}'
        }
      },
      dark: {
        primary: {
          color: '{violet.400}',
          inverseColor: '{zinc.950}',
          hoverColor: '{violet.300}',
          activeColor: '{violet.200}'
        },
        highlight: {
          background: 'rgba(139, 92, 246, 0.16)',
          focusBackground: 'rgba(139, 92, 246, 0.24)',
          color: 'rgba(255, 255, 255, 0.87)',
          focusColor: 'rgba(255, 255, 255, 0.87)'
        },
        surface: {
          0: '#ffffff',
          50: '#ededf0',
          100: '#d4d3da',
          200: '#b0aebb',
          300: '#8b899c',
          400: '#6e6b80',
          500: '#514e64',
          600: '#3d3a50',
          700: '#2a2740',
          800: '#1a1625',
          900: '#13111c',
          950: '#0f0d15'
        }
      }
    }
  },
  components: {
    toast: {
      root: {
        width: 'min(22rem, calc(100vw - 2rem))',
        borderRadius: '14px'
      },
      icon: { size: '1.125rem' },
      content: { padding: '0.875rem 1rem 0.875rem 0.95rem', gap: '0.75rem' },
      text: { gap: '0.1875rem' },
      summary: {
        fontWeight: '600',
        fontSize: '0.875rem'
      },
      detail: {
        fontWeight: '400',
        fontSize: '0.8125rem'
      },
      closeButton: {
        width: '2rem',
        height: '2rem',
        borderRadius: '10px',
        focusRing: {
          width: '{focus.ring.width}',
          style: '{focus.ring.style}',
          offset: '{focus.ring.offset}'
        }
      },
      closeIcon: { size: '0.875rem' },
      colorScheme: {
        light: {
          blur: '16px',
          info: {
            background: 'rgba(255, 255, 255, 0.94)',
            borderColor: 'rgba(15, 23, 42, 0.08)',
            color: '#0f172a',
            detailColor: '#64748b',
            shadow:
              '0 20px 48px -12px rgba(15, 23, 42, 0.14), 0 8px 20px -10px rgba(15, 23, 42, 0.08)',
            closeButton: {
              hoverBackground: 'rgba(15, 23, 42, 0.06)',
              focusRing: {
                color: '#64748b',
                shadow: '0 0 0 2px rgba(148, 163, 184, 0.35)'
              }
            }
          },
          success: {
            background: 'rgba(255, 255, 255, 0.94)',
            borderColor: 'rgba(15, 23, 42, 0.08)',
            color: '#0f172a',
            detailColor: '#64748b',
            shadow:
              '0 20px 48px -12px rgba(15, 23, 42, 0.14), 0 8px 20px -10px rgba(15, 23, 42, 0.08)',
            closeButton: {
              hoverBackground: 'rgba(15, 23, 42, 0.06)',
              focusRing: {
                color: '#059669',
                shadow: '0 0 0 2px rgba(16, 185, 129, 0.25)'
              }
            }
          },
          warn: {
            background: 'rgba(255, 255, 255, 0.94)',
            borderColor: 'rgba(15, 23, 42, 0.08)',
            color: '#0f172a',
            detailColor: '#64748b',
            shadow:
              '0 20px 48px -12px rgba(15, 23, 42, 0.14), 0 8px 20px -10px rgba(15, 23, 42, 0.08)',
            closeButton: {
              hoverBackground: 'rgba(15, 23, 42, 0.06)',
              focusRing: {
                color: '#d97706',
                shadow: '0 0 0 2px rgba(245, 158, 11, 0.28)'
              }
            }
          },
          error: {
            background: 'rgba(255, 255, 255, 0.94)',
            borderColor: 'rgba(15, 23, 42, 0.08)',
            color: '#0f172a',
            detailColor: '#64748b',
            shadow:
              '0 20px 48px -12px rgba(15, 23, 42, 0.14), 0 8px 20px -10px rgba(15, 23, 42, 0.08)',
            closeButton: {
              hoverBackground: 'rgba(15, 23, 42, 0.06)',
              focusRing: {
                color: '#e11d48',
                shadow: '0 0 0 2px rgba(244, 63, 94, 0.25)'
              }
            }
          },
          secondary: {
            background: 'rgba(255, 255, 255, 0.94)',
            borderColor: 'rgba(15, 23, 42, 0.08)',
            color: '#0f172a',
            detailColor: '#64748b',
            shadow:
              '0 20px 48px -12px rgba(15, 23, 42, 0.12), 0 8px 20px -10px rgba(15, 23, 42, 0.06)',
            closeButton: {
              hoverBackground: 'rgba(15, 23, 42, 0.06)',
              focusRing: {
                color: '#64748b',
                shadow: '0 0 0 2px rgba(148, 163, 184, 0.3)'
              }
            }
          },
          contrast: {
            background: 'rgba(15, 23, 42, 0.96)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            detailColor: '#cbd5e1',
            shadow: '0 20px 48px -12px rgba(0, 0, 0, 0.35)',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.08)',
              focusRing: {
                color: '#f8fafc',
                shadow: '0 0 0 2px rgba(248, 250, 252, 0.25)'
              }
            }
          }
        },
        dark: {
          blur: '18px',
          info: {
            background: 'rgba(28, 28, 32, 0.92)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            color: '#f4f4f5',
            detailColor: '#a1a1aa',
            shadow:
              '0 24px 56px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04)',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.07)',
              focusRing: {
                color: '#38bdf8',
                shadow: '0 0 0 2px rgba(56, 189, 248, 0.35)'
              }
            }
          },
          success: {
            background: 'rgba(28, 28, 32, 0.92)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            color: '#f4f4f5',
            detailColor: '#a1a1aa',
            shadow:
              '0 24px 56px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04)',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.07)',
              focusRing: {
                color: '#34d399',
                shadow: '0 0 0 2px rgba(52, 211, 153, 0.3)'
              }
            }
          },
          warn: {
            background: 'rgba(28, 28, 32, 0.92)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            color: '#f4f4f5',
            detailColor: '#a1a1aa',
            shadow:
              '0 24px 56px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04)',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.07)',
              focusRing: {
                color: '#fbbf24',
                shadow: '0 0 0 2px rgba(251, 191, 36, 0.3)'
              }
            }
          },
          error: {
            background: 'rgba(28, 28, 32, 0.92)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            color: '#f4f4f5',
            detailColor: '#a1a1aa',
            shadow:
              '0 24px 56px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04)',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.07)',
              focusRing: {
                color: '#fb7185',
                shadow: '0 0 0 2px rgba(251, 113, 133, 0.3)'
              }
            }
          },
          secondary: {
            background: 'rgba(28, 28, 32, 0.88)',
            borderColor: 'rgba(255, 255, 255, 0.07)',
            color: '#e4e4e7',
            detailColor: '#a1a1aa',
            shadow: '0 20px 40px -12px rgba(0, 0, 0, 0.45)',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.06)',
              focusRing: {
                color: '#a1a1aa',
                shadow: '0 0 0 2px rgba(161, 161, 170, 0.35)'
              }
            }
          },
          contrast: {
            background: 'rgba(250, 250, 250, 0.96)',
            borderColor: 'rgba(15, 23, 42, 0.12)',
            color: '#0f172a',
            detailColor: '#475569',
            shadow: '0 20px 48px -12px rgba(15, 23, 42, 0.2)',
            closeButton: {
              hoverBackground: 'rgba(15, 23, 42, 0.06)',
              focusRing: {
                color: '#0f172a',
                shadow: '0 0 0 2px rgba(15, 23, 42, 0.2)'
              }
            }
          }
        }
      }
    }
  }
})
