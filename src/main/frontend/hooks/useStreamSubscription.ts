import {useCallback, useRef} from "react";

export const useStreamSubscription = () => {
    const streamSubscriptionRef = useRef<any>(null);

    const stopStream = useCallback(() => {
        if (streamSubscriptionRef.current) {
            const methods = ['cancel', 'unsubscribe', 'abort'];
            for (const method of methods) {
                if (typeof streamSubscriptionRef.current[method] === 'function') {
                    streamSubscriptionRef.current[method]();
                    break;
                }
            }
            streamSubscriptionRef.current = null;
        }
    }, []);

    return { streamSubscriptionRef, stopStream };
};