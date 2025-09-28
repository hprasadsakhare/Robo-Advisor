import React from 'react';
import { ExternalLink, BookOpen, Code2, Compass } from 'lucide-react';

const LINKS = [
    {
        title: 'Rootstock Docs',
        href: 'https://dev.rootstock.io/',
        description: 'Learn how Rootstock works, its architecture, and how to build on it.',
        icon: BookOpen,
    },
    {
        title: 'RSK Explorer (Testnet)',
        href: 'https://explorer.testnet.rsk.co',
        description: 'Inspect transactions and contracts deployed on Rootstock Testnet.',
        icon: Compass,
    },
    {
        title: 'Project README',
        href: 'https://github.com/',
        description: 'Overview of the app, development workflow, and deployment steps.',
        icon: Code2,
    },
];

export function Resources() {
    return (
        <section className="bg-surface-800/40 border border-surface-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Resources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {LINKS.map((l) => (
                    <a
                        key={l.title}
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group block bg-surface-900/40 border border-surface-700 rounded-lg p-5 hover:border-primary-500 transition"
                    >
                        <div className="flex items-center gap-3">
                            <l.icon className="w-5 h-5 text-primary-400" />
                            <h4 className="font-semibold text-white flex-1">{l.title}</h4>
                            <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-primary-300" />
                        </div>
                        <p className="text-sm text-neutral-400 mt-2">{l.description}</p>
                    </a>
                ))}
            </div>
        </section>
    );
}
