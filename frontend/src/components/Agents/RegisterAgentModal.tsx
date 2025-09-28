import React, { useState } from 'react';
import { useAgent } from '../../hooks/useAgent.ts';
import { X, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

interface RegisterAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (agentId: string) => void;
}

export function RegisterAgentModal({ isOpen, onClose, onSuccess }: RegisterAgentModalProps) {
    const { registerAgent, loading } = useAgent();
    const [formData, setFormData] = useState({
        name: '',
        strategyDescription: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.strategyDescription.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const agentId = await registerAgent(formData.name, formData.strategyDescription);
            toast.success('Agent registered successfully!');
            onSuccess?.(agentId);
            onClose();
            setFormData({ name: '', strategyDescription: '' });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to register agent');
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            setFormData({ name: '', strategyDescription: '' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg">
                            <Bot className="w-5 h-5 text-primary-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Register New Agent</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label htmlFor="name" className="label">
                            Agent Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="input"
                            placeholder="e.g., Conservative Growth Bot"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="label">
                            Strategy Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.strategyDescription}
                            onChange={(e) => setFormData(prev => ({ ...prev, strategyDescription: e.target.value }))}
                            className="input min-h-[100px] resize-none"
                            placeholder="Describe your investment strategy..."
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Strategy Template</h4>
                        <p className="text-sm text-blue-700">
                            Move funds to Aave if APY is greater than 5%, otherwise move to Uniswap for liquidity provision.
                        </p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn btn-primary"
                        >
                            {loading ? 'Registering...' : 'Register Agent'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
