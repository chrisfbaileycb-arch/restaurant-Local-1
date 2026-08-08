import React from 'react';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';

const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-stone-50">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default PageShell;
