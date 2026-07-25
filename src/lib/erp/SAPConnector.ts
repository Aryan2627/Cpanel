import { ERPConnector, ERPPurchaseRequisition } from './ERPConnector';

export class SAPConnector implements ERPConnector {
  
  getName(): string {
    return "SAP S/4HANA";
  }

  async fetchPurchaseRequisitions(): Promise<ERPPurchaseRequisition[]> {
    console.log(`[SAPConnector] Fetching PRs from SAP API...`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock data that would normally come from SAP OData / REST APIs
    return [
      {
        erpId: `SAP-PR-${Math.floor(1000 + Math.random() * 9000)}`,
        title: "Laptops for Engineering Team",
        requesterName: "Alice Smith",
        type: "IT Hardware",
        date: new Date().toISOString()
      },
      {
        erpId: `SAP-PR-${Math.floor(1000 + Math.random() * 9000)}`,
        title: "Office Furniture Replacements",
        requesterName: "Bob Johnson",
        type: "Facilities",
        date: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }

  async sendPurchaseOrder(poData: any): Promise<{ success: boolean; erpPoId?: string; error?: string }> {
    console.log(`[SAPConnector] Pushing PO ${poData.poNumber} to SAP...`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[SAPConnector] Successfully created PO in SAP`);
    
    return {
      success: true,
      erpPoId: `SAP-PO-${Math.floor(10000 + Math.random() * 90000)}`
    };
  }

  async testConnection(): Promise<boolean> {
    console.log(`[SAPConnector] Testing connection to SAP S/4HANA...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true; // Assume success for mock
  }
}
