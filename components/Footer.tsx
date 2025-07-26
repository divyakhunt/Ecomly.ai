import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-32 border-t border-slate-800/50">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} E-Commerce AI Kit. All rights reserved.</p>
        <p className="mt-1">
          Designed and Developed by{' '}
          <a
            href="https://github.com/DivyaKhunt" // Replace with your actual GitHub profile URL
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-400 hover:underline transition-colors duration-200"
          >
            Divya Khunt
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
