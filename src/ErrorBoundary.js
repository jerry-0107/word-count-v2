import * as React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // 更新 state 以至於下一個 render 會顯示 fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {

    }

    render() {
        if (this.state.hasError) {
            // 你可以 render 任何客製化的 fallback UI
            return <><h1>Something went wrong.</h1>
                <h3>Below is your data before the app crashed.</h3>
                <p>{JSON.stringify(localStorage)}</p>

            </>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary
