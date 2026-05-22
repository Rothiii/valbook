'use client';

import { toast as sonnerToast } from 'sonner';

type ToastArgs = Parameters<typeof sonnerToast.success>;

const TOP_RIGHT = 'top-right' as const;
const BOTTOM_RIGHT = 'bottom-right' as const;

function withPosition(position: 'top-right' | 'bottom-right', data: ToastArgs[1]): ToastArgs[1] {
  return { ...(data ?? {}), position };
}

export const notify = {
  success: (message: ToastArgs[0], data?: ToastArgs[1]) =>
    sonnerToast.success(message, withPosition(TOP_RIGHT, data)),
  info: (message: ToastArgs[0], data?: ToastArgs[1]) =>
    sonnerToast.info(message, withPosition(TOP_RIGHT, data)),
  message: (message: ToastArgs[0], data?: ToastArgs[1]) =>
    sonnerToast.message(message, withPosition(TOP_RIGHT, data)),
  error: (message: ToastArgs[0], data?: ToastArgs[1]) =>
    sonnerToast.error(message, withPosition(BOTTOM_RIGHT, data)),
  warning: (message: ToastArgs[0], data?: ToastArgs[1]) =>
    sonnerToast.warning(message, withPosition(BOTTOM_RIGHT, data)),
  dismiss: sonnerToast.dismiss,
  promise: sonnerToast.promise,
  loading: sonnerToast.loading,
  custom: sonnerToast.custom,
};

export type Notify = typeof notify;
