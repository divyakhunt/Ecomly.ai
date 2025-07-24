import React from 'react';
import type { FC, SVGProps } from 'react';

export type IconName = 'logo' | 'hamburger' | 'home' | 'chat' | 'summary' | 'image' | 'background' | 'copy' | 'download' | 'send' | 'sparkles' | 'check' | 'close' | 'crop' | 'upload' | 'file-pdf' | 'amazon' | 'flipkart' | 'meesho' | 'trash' | 'chevron-down' | 'check-circle' | 'alert-triangle' | 'info' | 'tag' | 'user' | 'logout' | 'google' | 'mail' | 'lock' | 'arrow-left' | 'login' | 'user-plus';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export const Icon: FC<IconProps> = ({ name, ...props }) => {
  const icons: Record<IconName, React.ReactNode> = {
    logo: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
    hamburger: <path d="M3 12h18M3 6h18M3 18h18" />,
    home: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
    chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
    summary: <><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" /></>,
    image: <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></>,
    background: <><path d="M20.25 15.75L16 12l-4.25 3.75" /><path d="M10.25 15.75L6 12l-4.25 3.75" /><path d="M3 3h18v18H3z" mask="url(#mask-2)" /></>,
    copy: <><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></>,
    download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    upload: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
    sparkles: <path d="M10 3L8 8l-5 2 5 2 2 5 2-5 5-2-5-2-2-5zM18 13l-1.9 4-4.1-1.9 4.1-1.9L18 9l1.9 4 4.1 1.9-4.1 1.9z"/>,
    check: <path d="M20 6L9 17l-5-5" />,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    crop: <><path d="M6.13 1L6 16a2 2 0 002 2h15" /><path d="M1 6.13L16 6a2 2 0 012 2v15" /></>,
    'file-pdf': <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M10.29 15.71a2.05 2.05 0 01-2.58-1.42 2.05 2.05 0 01.34-1.87 2.05 2.05 0 011.62-.8h.83a1.24 1.24 0 011.25 1.25v.25a1.24 1.24 0 001.25 1.25h0a1.24 1.24 0 010 2.5h-2.5a1.24 1.24 0 01-1.25-1.25v-.25" /></>,
    
    amazon: (
      <image
        href="/assets/amazon-logo.png" // Update path as needed
        x="0"
        y="0"
        height="24"
        width="24"
      />
    ),
    flipkart: (
      <image
        href="/assets/flipkart-logo.png"
        x="0"
        y="0"
        height="24"
        width="24"
      />
    ),
    meesho: (
      <image
        href="/assets/meesho-logo.png"
        x="0"
        y="0"
        height="24"
        width="24"
      />
    ),
    
    trash: <><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></>,
    'chevron-down': <polyline points="6 9 12 15 18 9"></polyline>,
    'check-circle': <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></>,
    'alert-triangle': <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></>,
    info: <><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></>,
    tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
    login: <><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></>,
    'user-plus': <><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></>,

    google: (
      <image
        href="/assets/google-logo.png"
        x="0"
        y="0"
        height="24"
        width="24"
      />
    ),

    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>,
    'arrow-left': <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {icons[name]}
    </svg>
  );
};