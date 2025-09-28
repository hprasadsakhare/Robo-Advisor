import React, { useState } from 'react';
import { useStrategy } from '../../hooks/useStrategy';
import { X, Play, Shield, Database, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExecuteStrategyModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentId: string;
    agentName: string;
}

export function ExecuteStrategyModal({ isOpen, onClose, agentId, agentName }: ExecuteStrategyModalProps) {
    const { executeFullStrategy, loading } = useStrategy();
    const [amount, setAmount] = useState('1.0');
    const [step, setStep] = useState<'input' | 'executing' | 'success'>('input');
    const [executionResult, setExecutionResult] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setStep('executing');

        try {
            const amountInWei = (parseFloat(amount) * 1e18).toString();
            const strategyResult = `Strategy executed: ${amount} ETH moved based on current APY conditions`;

            const result = await executeFullStrategy(agentId, amountInWei, strategyResult);
            setExecutionResult(result);
            setStep('success');
            toast.success('Strategy executed successfully!');
        } catch (error) {
            setStep('input');
            toast.error(error instanceof Error ? error.message : 'Failed to execute strategy');
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            setStep('input');
            setAmount('1.0');
            setExecutionResult(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg">
                            <Play className="w-5 h-5 text-primary-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Execute Strategy</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {step === 'input' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-900 mb-2">Agent: {agentName}</h4>
                                <p className="text-sm text-blue-700">
                                    This will execute the robo-advisor strategy with TEE verification and Walrus storage.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="amount" className="label">
                                    Amount (ETH)
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="input"
                                    placeholder="1.0"
                                    step="0.1"
                                    min="0.1"
                                    disabled={loading}
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Minimum: 0.1 ETH
                                </p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-yellow-900 mb-2">Execution Process</h4>
                                <div className="space-y-2 text-sm text-yellow-700">
                                    <div className="flex items-center space-x-2">
                                        <Shield className="w-4 h-4" />
                                        <span>1. Generate TEE proof</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Database className="w-4 h-4" />
                                        <span>2. Store proof in Walrus</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>3. Execute strategy</span>
                                    </div>
                                </div>
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
                                    {loading ? 'Executing...' : 'Execute Strategy'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'executing' && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Executing Strategy</h3>
                            <p className="text-gray-500">Please wait while we execute your strategy...</p>
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                    <Shield className="w-4 h-4" />
                                    <span>Generating TEE proof...</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                    <Database className="w-4 h-4" />
                                    <span>Storing in Walrus...</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Executing strategy...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'success' && executionResult && (
                        <div className="text-center py-8">
                            <div className="flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-success-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Strategy Executed Successfully!</h3>
                            <p className="text-gray-500 mb-6">Your robo-advisor strategy has been executed with full TEE verification.</p>

                            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Agent ID:</span>
                                    <span className="font-mono text-gray-900">{agentId.slice(0, 8)}...</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-mono text-gray-900">{amount} ETH</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Proof ID:</span>
                                    <span className="font-mono text-gray-900">{executionResult.teeProof.proofId.slice(0, 8)}...</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Walrus ID:</span>
                                    <span className="font-mono text-gray-900">{executionResult.walrusStorage.walrusId.slice(0, 8)}...</span>
                                </div>
                            </div>

                            <button
                                onClick={handleClose}
                                className="btn btn-primary mt-6"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
