'use client';
import React, { useState, useEffect } from 'react';

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/pos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPos(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Purchase Orders</h1>
      </div>

      <div className="surface">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Title</th>
                <th>Vendor ID</th>
                <th>Total Value</th>
                <th>Date Issued</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pos.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No Purchase Orders generated yet.</td>
                </tr>
              ) : (
                pos.map(po => (
                  <tr key={po.id}>
                    <td>{po.poNumber}</td>
                    <td>{po.title}</td>
                    <td>{po.vendorId}</td>
                    <td>${po.total.toLocaleString()}</td>
                    <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                    <td><span className="badge badge-approved">{po.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
