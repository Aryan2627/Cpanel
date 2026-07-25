export interface ERPPurchaseRequisition {
  erpId: string;
  title: string;
  requesterName: string;
  type: string;
  buyer?: string;
  date: string;
}

export interface ERPConnector {
  /**
   * Identifies the connector (e.g. "SAP", "Oracle")
   */
  getName(): string;

  /**
   * Fetches new Purchase Requisitions from the ERP system
   */
  fetchPurchaseRequisitions(): Promise<ERPPurchaseRequisition[]>;

  /**
   * Sends a newly awarded Purchase Order back to the ERP
   */
  sendPurchaseOrder(poData: any): Promise<{ success: boolean; erpPoId?: string; error?: string }>;

  /**
   * Checks the connection credentials
   */
  testConnection(): Promise<boolean>;
}
