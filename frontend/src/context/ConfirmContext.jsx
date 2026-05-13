import { createContext, useContext, useState, useCallback } from "react";
import styles from "../styles/ConfirmModal.module.css";

const ConfirmContext = createContext(null);

const TrashIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const WarnIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const InfoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function ConfirmModal({ options, onConfirm, onCancel }) {
  const variant = options.variant || "danger";
  const IconMap = { danger: <TrashIcon />, warning: <WarnIcon />, info: <InfoIcon /> };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={`${styles.iconCircle} ${styles[variant]}`}>
            {IconMap[variant]}
          </div>
          <h3 className={styles.title}>{options.title || "Are you sure?"}</h3>
          {options.message && (
            <p className={styles.message}>{options.message}</p>
          )}
        </div>
        <div className={styles.body}>
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={onCancel}>
              {options.cancelLabel || "Cancel"}
            </button>
            <button
              className={`${styles.confirmBtn} ${styles[variant]}`}
              onClick={onConfirm}
            >
              {options.confirmLabel || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setState({
        options: typeof options === "string" ? { message: options } : options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state.resolve(false);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <ConfirmModal
          options={state.options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx.confirm;
}
