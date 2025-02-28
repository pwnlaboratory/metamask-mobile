import React, { useContext, useMemo, useState } from 'react';
import { Alert, Severity } from '../../types/alerts';

export interface AlertsContextParams {
  alertModalVisible: boolean;
  alerts: Alert[];
  dangerAlerts: Alert[];
  fieldAlerts: Alert[];
  generalAlerts: Alert[];
  hasAlerts: boolean;
  hasDangerAlerts: boolean;
  hideAlertModal: () => void;
  showAlertModal: () => void;
}

const AlertsContext = React.createContext<AlertsContextParams>({
  alertModalVisible: true,
  alerts: [],
  dangerAlerts: [],
  fieldAlerts: [],
  generalAlerts: [],
  hasAlerts: false,
  hasDangerAlerts: false,
  hideAlertModal: () => undefined,
  showAlertModal: () => undefined,
});

interface AlertsContextProviderProps {
  alerts: Alert[];
}

export const AlertsContextProvider: React.FC<AlertsContextProviderProps> = ({ children, alerts }) => {
  const [alertModalVisible, setAlertModalVisible] = useState(false);

  /**
   * Sorted alerts by severity.
   */
  const alertsMemo = useMemo(() => sortAlertsBySeverity(alerts), [alerts]);

  /**
   * General alerts (alerts without a specific field).
   */
  const generalAlerts = useMemo(() => alertsMemo.filter(alertSelected => alertSelected.field === undefined), [alertsMemo]);

  /**
   * Field alerts (alerts with a specific field).
   */
  const fieldAlerts = useMemo(() => alertsMemo.filter(alertSelected => alertSelected.field !== undefined), [alertsMemo]);

  /**
   * Danger alerts.
   */
  const dangerAlerts = useMemo(() => alertsMemo.filter(
    alertSelected => alertSelected.severity === Severity.Danger
  ), [alertsMemo]);

  const contextValue = useMemo(() => ({
    alertModalVisible,
    alerts: alertsMemo,
    dangerAlerts,
    fieldAlerts,
    generalAlerts,
    hasAlerts: alertsMemo.length > 0,
    hasDangerAlerts: dangerAlerts.length > 0,
    hideAlertModal: () => setAlertModalVisible(false),
    showAlertModal: () => setAlertModalVisible(true),
  }), [alertModalVisible, alertsMemo, dangerAlerts, fieldAlerts, generalAlerts]);

  return (
    <AlertsContext.Provider value={contextValue}>
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsContextProvider');
  }
  return context;
};

/**
 * Sorts alerts by severity.
 * @param alerts - Array of alerts to sort.
 * @returns Sorted array of alerts.
 */
function sortAlertsBySeverity(alerts: Alert[]): Alert[] {
  const severityOrder = {
    [Severity.Danger]: 3,
    [Severity.Warning]: 2,
    [Severity.Info]: 1,
  };
  return [...alerts].sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
}
