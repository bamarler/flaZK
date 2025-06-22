const baseConfig = require('@flazk/shared/tailwind.config.base');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
}