
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-lg p-6 space-y-4">
                        <div className="flex items-center gap-3 text-destructive">
                            <AlertTriangle className="w-10 h-10" />
                            <h1 className="text-xl font-bold">Algo deu errado</h1>
                        </div>

                        <div className="bg-muted p-4 rounded text-xs font-mono overflow-auto max-h-48">
                            <p className="font-bold mb-2">{this.state.error?.toString()}</p>
                            <pre className="text-muted-foreground whitespace-pre-wrap">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={() => window.location.reload()}
                                className="w-full"
                            >
                                Recarregar Página
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/login'}
                                className="w-full"
                            >
                                Ir para Login
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
