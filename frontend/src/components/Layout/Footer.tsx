import React from 'react';

export function Footer() {
    return (
        <footer className="border-t border-surface-800 bg-surface-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>
                    © {new Date().getFullYear()} Robo-Advisor on Rootstock
                </span>
                <div className="flex items-center gap-4">
                    <a
                        className="hover:text-primary-400 transition"
                        href="https://explorer.testnet.rsk.co"
                        target="_blank"
                        rel="noreferrer"
                    >
                        RSK Testnet Explorer
                    </a>
                    <a
                        className="hover:text-primary-400 transition"
                        href="https://rootstock.io/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Rootstock
                    </a>
                </div>
            </div>
        </footer>
    );
}
