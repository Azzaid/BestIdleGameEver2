import {Component, type ErrorInfo, type ReactNode} from "react";
import {cleanSlateAndReload} from "../store/cleanSlate.ts";
import * as s from "./AppErrorBoundary.css.ts";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
  componentStack?: string;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {error};
  }

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentDidCatch(_error: Error, errorInfo: ErrorInfo) {
    this.setState({componentStack: errorInfo.componentStack ?? undefined});
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  private handleWindowError = (event: ErrorEvent) => {
    this.setState({error: normalizeError(event.error ?? event.message)});
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.setState({error: normalizeError(event.reason)});
  };

  render() {
    if (!this.state.error) return this.props.children;

    const stackTrace = formatStackTrace(this.state.error, this.state.componentStack);

    return (
      <section className={s.page}>
        <article className={s.panel} role="alert" aria-labelledby="app-error-title">
          <header className={s.header}>
            <p className={s.kicker}>Application error</p>
            <h1 id="app-error-title" className={s.title}>Something broke in the city.</h1>
          </header>
          <p className={s.message}>
            The saved game may be in a bad state. Start over will clear the saved Redux state and reload the app from a clean settlement.
          </p>
          <pre className={s.stack}>{stackTrace}</pre>
          <div className={s.actions}>
            <button className={s.primaryButton} type="button" onClick={cleanSlateAndReload}>
              Start over
            </button>
          </div>
        </article>
      </section>
    );
  }
}

function normalizeError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === "string") return new Error(value);

  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error("Unknown application error");
  }
}

function formatStackTrace(error: Error, componentStack: string | undefined): string {
  const message = `${error.name}: ${error.message}`;
  const stackLines = (error.stack ?? "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => line !== message)
    .slice(0, 5);
  const componentLines = (componentStack ?? "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 3);

  return [message, ...stackLines, ...componentLines].join("\n");
}
