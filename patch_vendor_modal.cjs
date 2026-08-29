const fs = require('fs');
let code = fs.readFileSync('src/app/client/vendors/page.tsx', 'utf8');

const regex = /<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' \}\}>[\s\S]*?<\/div>\s*<div style=\{\{ display: 'flex', gap: '12px', justifyContent: 'flex-end' \}\}>/m;

const replacement = `<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
              
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>1. Basic & Contact Info</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                  <div><strong>Company:</strong> {selectedVendorForApproval.name}</div>
                  <div><strong>Entity Type:</strong> {selectedVendorForApproval.onboardingData?.entityType || '-'}</div>
                  <div><strong>Email:</strong> {selectedVendorForApproval.email}</div>
                  <div><strong>Phone:</strong> {selectedVendorForApproval.phone}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {selectedVendorForApproval.onboardingData?.registeredAddress || '-'}</div>
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>2. Tax & Registration</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                  <div><strong>PAN:</strong> {selectedVendorForApproval.onboardingData?.pan || '-'}</div>
                  <div><strong>GSTIN:</strong> {selectedVendorForApproval.onboardingData?.gstin || '-'}</div>
                  <div><strong>CIN:</strong> {selectedVendorForApproval.onboardingData?.cin || '-'}</div>
                  <div><strong>MSME:</strong> {selectedVendorForApproval.onboardingData?.msme || '-'}</div>
                  <div><strong>Trade License:</strong> {selectedVendorForApproval.tradeLicense || '-'}</div>
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>3. Business Profile</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div><strong>Category:</strong> {selectedVendorForApproval.onboardingData?.productCategory || '-'}</div>
                  <div><strong>Products Offered:</strong> {selectedVendorForApproval.onboardingData?.productsOffered || '-'}</div>
                  <div><strong>Certifications:</strong> {selectedVendorForApproval.onboardingData?.certifications || '-'}</div>
                  <div><strong>Experience:</strong> {selectedVendorForApproval.onboardingData?.previousExperience || '-'}</div>
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>4. Bank Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '14px' }}>
                  <div><strong>Account Name:</strong> {selectedVendorForApproval.onboardingData?.bankAccountName || '-'}</div>
                  <div><strong>Account Number:</strong> {selectedVendorForApproval.onboardingData?.bankAccountNumber || '-'}</div>
                  <div><strong>IFSC:</strong> {selectedVendorForApproval.onboardingData?.bankIfsc || '-'}</div>
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>5. Documents</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '14px' }}>
                  <div><strong>PAN Card:</strong> {selectedVendorForApproval.onboardingData?.documents?.pan ? <a href={selectedVendorForApproval.onboardingData.documents.pan} target="_blank" rel="noreferrer" style={{color: '#2563eb'}}>View Document</a> : '-'}</div>
                  <div><strong>GST Cert:</strong> {selectedVendorForApproval.onboardingData?.documents?.gst ? <a href={selectedVendorForApproval.onboardingData.documents.gst} target="_blank" rel="noreferrer" style={{color: '#2563eb'}}>View Document</a> : '-'}</div>
                  <div><strong>Incorporation Cert:</strong> {selectedVendorForApproval.onboardingData?.documents?.incorporation ? <a href={selectedVendorForApproval.onboardingData.documents.incorporation} target="_blank" rel="noreferrer" style={{color: '#2563eb'}}>View Document</a> : '-'}</div>
                  <div><strong>Bank Proof:</strong> {selectedVendorForApproval.onboardingData?.documents?.bank ? <a href={selectedVendorForApproval.onboardingData.documents.bank} target="_blank" rel="noreferrer" style={{color: '#2563eb'}}>View Document</a> : '-'}</div>
                </div>
              </div>

            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    
    // Also increase width of modal so it fits nicely
    code = code.replace("width: '500px'", "width: '700px'");
    
    fs.writeFileSync('src/app/client/vendors/page.tsx', code, 'utf8');
    console.log("Successfully patched Cpanel Vendor Details Modal.");
} else {
    console.log("Regex didn't match.");
}
