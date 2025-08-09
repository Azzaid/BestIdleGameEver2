import { createTheme, createThemeContract } from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: {
    primary: '',
    primaryDark: '',
    secondary: '',
    text: '',
    background: '',
    border: '',
    link: '',
    buttonText: '',
  },
});

export const techTheme = createTheme(vars, {
  color: {
    primary: '#5b6cff', // blue-violet
    primaryDark: '#454fc9',
    secondary: '#7f8c8d', // grey
    text: '#e8eaf6',
    background: '#0f1226',
    border: '#3b3f5c',
    link: '#8a9aff',
    buttonText: '#ffffff',
  },
});

export const natureTheme = createTheme(vars, {
  color: {
    primary: '#2ecc71', // green
    primaryDark: '#27ae60',
    secondary: '#f1c40f', // yellow
    text: '#223322',
    background: '#ffffff',
    border: '#dfe6e0',
    link: '#1e8449',
    buttonText: '#ffffff',
  },
});

export const medievalTheme = createTheme(vars, {
  color: {
    primary: '#8b4513', // dark brown
    primaryDark: '#5e2f0c',
    secondary: '#b22222', // red
    text: '#2b1a0a',
    background: '#f6efe5',
    border: '#c9b39a',
    link: '#8b0000',
    buttonText: '#fff8e7',
  },
});

export const aetherTheme = createTheme(vars, {
  color: {
    primary: '#3ad5c9', // light turquoise
    primaryDark: '#1b9b96',
    secondary: '#0e3c7d', // deep blue
    text: '#0e2233',
    background: '#ffffff',
    border: '#d6eef0',
    link: '#0e3c7d',
    buttonText: '#ffffff',
  },
});

export type ThemeName = 'tech' | 'nature' | 'medieval' | 'aether';

export const themeByName: Record<ThemeName, string> = {
  tech: techTheme,
  nature: natureTheme,
  medieval: medievalTheme,
  aether: aetherTheme,
};
