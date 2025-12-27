import { toast as sonnerToast, type ExternalToast } from "sonner";

/**
 * Custom Toast Wrapper
 * Intercepts success toasts to trigger the "Success Wave" global animation.
 */

// Helper to dispatch global event
const triggerWave = () => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("saas:success-wave"));
    }
};

type ToastType = typeof sonnerToast;

// Create a proxy wrapper that preserves the function call signature
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toastWrapper = ((message: any, data?: ExternalToast) => {
    return sonnerToast(message, data);
}) as ToastType;

// Copy all properties from original toast
Object.assign(toastWrapper, sonnerToast);

// Override success method
// eslint-disable-next-line @typescript-eslint/no-explicit-any
toastWrapper.success = (message: any, data?: ExternalToast) => {
    triggerWave();
    return sonnerToast.success(message, data);
};

export { toastWrapper as toast };
