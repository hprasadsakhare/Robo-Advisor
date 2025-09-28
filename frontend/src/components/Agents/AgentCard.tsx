import React from 'react';
import { AgentCard as AgentCardType } from '../../types';
import { Bot, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AgentCardProps {
    agent: AgentCardType;
    agentId: string;
    onExecute?: (agentId: string) => void;
    onView?: (agentId: string) => void;
}

export function AgentCard({ agent, agentId, onExecute, onView }: AgentCardProps) {
    return (
        <div className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
                        <Bot className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                            {agent.isActive ? (
                                <span className="badge badge-success">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Active
                                </span>
                            ) : (
                                <span className="badge badge-error">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Inactive
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                    {agent.strategyDescription}
                </p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span className="font-mono">
                        {agent.creator.slice(0, 6)}...{agent.creator.slice(-4)}
                    </span>
                </div>
                <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(agent.createdAt * 1000), 'MMM dd, yyyy')}</span>
                </div>
            </div>

            <div className="flex space-x-3">
                {agent.isActive && onExecute && (
                    <button
                        onClick={() => onExecute(agentId)}
                        className="flex-1 btn btn-primary"
                    >
                        Execute Strategy
                    </button>
                )}
                {onView && (
                    <button
                        onClick={() => onView(agentId)}
                        className="flex-1 btn btn-secondary"
                    >
                        View Details
                    </button>
                )}
            </div>
        </div>
    );
}
