import React from 'react';
import { Header } from './Header.tsx';
import { Toaster } from 'react-hot-toast';
import { Footer } from './Footer.tsx';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-surface-900 text-neutral-100">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <Footer />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#111111',
                        color: '#ffffff',
                        border: '1px solid rgba(247,147,26,0.2)'
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#F7931A',
                            secondary: '#111111',
                        },
                    },
                    error: {
                        duration: 5000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#111111',
                        },
                    },
                }}
            />
        </div>
    );
}
