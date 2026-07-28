'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useIntake } from '../../../context/IntakeContext';
import * as XLSX from 'xlsx';

export default function IntakeTablePage() {
  const { intakes, addIntake } = useIntake();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States for Search & Filter
  const [searchField, setSearchField] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Export to Excel function
  const handleExport = () => {
    // We export the entire 'intakes' data as requested
    const worksheet = XLSX.utils.json_to_sheet(intakes.map(row => ({
      'Ref ID': row.refId,
      'Title': row.title,
      'Requester Name': row.reqName,
      'Status': row.status,
      'Intake Request Type': row.type,
      'Buyer Name': row.buyer,
      'Requested At': row.reqAt,
      'Updated At': row.updAt,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Intake Data");
    XLSX.writeFile(workbook, "Intake_Data_Export.xlsx");
  };

  // Import from Excel function
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        
        // Parse the sheet to JSON
        const data = XLSX.utils.sheet_to_json<any>(ws);
        
        // Loop through each row and save to the DB
        for (const row of data) {
          const intake = {
            refId: row['Ref ID'] || `INT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: row['Title'] || 'Untitled Intake',
            reqName: row['Requester Name'] || 'System',
            status: row['Status'] || 'Draft',
            type: row['Intake Request Type'] || 'Standalone NFA',
            buyer: row['Buyer Name'] || '-',
            reqAt: row['Requested At'] || new Date().toISOString().split('T')[0],
            updAt: row['Updated At'] || new Date().toISOString().split('T')[0],
          };
          await addIntake(intake);
        }
        
        // Reset the file input so it can be reused
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        alert(`Successfully imported ${data.length} intakes!`);
      } catch (err) {
        console.error("Error parsing Excel file", err);
        alert("Failed to import. Ensure the Excel file is correctly formatted.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Derived Data based on Search and Filter for UI display
  const filteredIntakes = intakes.filter((row) => {
    // 1. Status Filter
    if (filterStatus !== 'All' && row.status !== filterStatus) {
      return false;
    }
    
    // 2. Search Query
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    if (searchField === 'Ref ID') {
      return row.refId.toLowerCase().includes(query);
    } else if (searchField === 'Title') {
      return row.title.toLowerCase().includes(query);
    } else if (searchField === 'Requester Name') {
      return row.reqName.toLowerCase().includes(query);
    } else {
      // 'All' - search across all three
      return (
        row.refId.toLowerCase().includes(query) ||
        row.title.toLowerCase().includes(query) ||
        row.reqName.toLowerCase().includes(query)
      );
    }
  });

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#333', borderRadius: '8px', minHeight: '100%' }}>
      {/* Hidden file input for import */}
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        ref={fileInputRef} 
        onChange={handleImport} 
        style={{ display: 'none' }} 
      />
      
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          
          {/* Search Section */}
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' }}>
             <select 
               value={searchField}
               onChange={(e) => setSearchField(e.target.value)}
               style={{ padding: '8px 12px', border: 'none', borderRight: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', color: '#374151', cursor: 'pointer' }}
             >
               <option value="All">All Fields</option>
               <option value="Ref ID">Ref ID</option>
               <option value="Title">Title</option>
               <option value="Requester Name">Requester Name</option>
             </select>
             <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', backgroundColor: '#fff' }}>
                <input 
                  type="text" 
                  placeholder={`Search ${searchField}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '8px', border: 'none', outline: 'none', width: '200px' }} 
                />
                <span style={{ color: '#9ca3af' }}>🔍</span>
             </div>
          </div>
          
          {/* Filter Section */}
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' }}>
             <span style={{ padding: '8px 12px', backgroundColor: '#f9fafb', borderRight: '1px solid #d1d5db', color: '#6b7280' }}>
               Filter Status:
             </span>
             <select 
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
               style={{ padding: '8px 12px', border: 'none', outline: 'none', backgroundColor: '#fff', color: '#374151', cursor: 'pointer' }}
             >
               <option value="All">All</option>
               <option value="Draft">Draft</option>
               <option value="In Progress">In Progress</option>
               <option value="Approved">Approved</option>
             </select>
          </div>
          
          {/* Misc Icons from Mockup */}
          <button style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#6b7280', cursor: 'pointer' }}>≡</button>
          <button style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#6b7280', cursor: 'pointer' }}>👁</button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          
          <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', border: '1px solid #10b981', borderRadius: '4px', backgroundColor: '#fff', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
            📤 Import
          </button>
          <button onClick={handleExport} style={{ padding: '8px 16px', border: '1px solid #3b82f6', borderRadius: '4px', backgroundColor: '#fff', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
            📥 Export
          </button>
          <Link href="/client/intake/create" style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', textDecoration: 'none' }}>
            + Create Request
          </Link>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 24px', fontWeight: '500', color: '#6b7280', borderRight: '1px solid #e5e7eb' }}>Ref ID</th>
              <th style={{ padding: '12px 24px', fontWeight: '500', color: '#6b7280', borderRight: '1px solid #e5e7eb' }}>Title</th>
              <th style={{ padding: '12px 24px', fontWeight: '500', color: '#6b7280', borderRight: '1px solid #e5e7eb' }}>Requester Name</th>
              <th style={{ padding: '12px 24px', fontWeight: '500', color: '#6b7280', borderRight: '1px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '12px 24px', fontWeight: '500', color: '#6b7280', borderRight: '1px solid #e5e7eb' }}>Intake Request Type</th>
              <th style={{ padding: '12px 24px', fontWeight: '500', color: '#6b7280', borderRight: '1px solid #e5e7eb' }}>Buyer Name</th>
              <th style={{ padding: '12px 24px', fontWeight: '500', color: '#6b7280', borderRight: '1px solid #e5e7eb' }}>Requested At</th>
              <th style={{ padding: '12px 24px', fontWeight: '500', color: '#6b7280', borderRight: '1px solid #e5e7eb' }}>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {filteredIntakes.length > 0 ? (
              filteredIntakes.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                  <td style={{ padding: '12px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{row.refId}</td>
                  <td style={{ padding: '12px 24px', color: '#3b82f6', borderRight: '1px solid #e5e7eb' }}><Link href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>{row.title}</Link></td>
                  <td style={{ padding: '12px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{row.reqName}</td>
                  <td style={{ padding: '12px 24px', borderRight: '1px solid #e5e7eb' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      border: '1px solid #d1d5db',
                      borderRadius: '4px', 
                      fontSize: '0.75rem',
                      color: '#374151',
                      backgroundColor: '#fff'
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{row.type}</td>
                  <td style={{ padding: '12px 24px', color: '#4b5563', borderRight: '1px solid #e5e7eb' }}>{row.buyer}</td>
                  <td style={{ padding: '12px 24px', color: '#6b7280', borderRight: '1px solid #e5e7eb' }}>{row.reqAt}</td>
                  <td style={{ padding: '12px 24px', color: '#6b7280' }}>{row.updAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
