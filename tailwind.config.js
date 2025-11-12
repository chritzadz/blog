// tailwind.config.js
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
        colors: {
            primary: {
            50:  '#f0f9ff',
            100: '#e6f5ff',
            200: '#bfeaff',
            300: '#99dfff',
            400: '#4dc8ff',
            500: '#0aa7ff',
            600: '#068be6',
            700: '#046aa8',
            800: '#034e7a',
            900: '#02334f',
            },
            brand: '#1E40AF',
            'secondary-gray': '#57564F',
            'primary-gray': '#7A7A73',
            'third-gray': '#DDDAD0',
            'crema-white': '#F8F3CE',
        },
        },
    },
    plugins: [],
};