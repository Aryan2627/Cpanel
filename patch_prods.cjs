const fs = require('fs');
const filePath = 'src/app/client/manage/products/page.tsx';
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('Action</th>')) {
  // Add Actions column header
  code = code.replace(
    '<th style={{ padding: \'16px 24px\', fontWeight: \'600\', color: \'#111827\', borderBottom: \'1px solid #e5e7eb\' }}>Created On</th>',
    '<th style={{ padding: \'16px 24px\', fontWeight: \'600\', color: \'#111827\', borderBottom: \'1px solid #e5e7eb\' }}>Created On</th>\n                <th style={{ padding: \'16px 24px\', fontWeight: \'600\', color: \'#111827\', borderBottom: \'1px solid #e5e7eb\' }}>Action</th>'
  );

  // Add Actions column cell with Edit link
  code = code.replace(
    '<td style={{ padding: \'16px 24px\', color: \'#4b5563\' }}>{new Date(prod.createdAt).toLocaleDateString()}</td>',
    '<td style={{ padding: \'16px 24px\', color: \'#4b5563\' }}>{new Date(prod.createdAt).toLocaleDateString()}</td>\n                    <td style={{ padding: \'16px 24px\' }}>\n                      <Link href={`/client/manage/products/edit/${prod.id}`} style={{ color: \'#2563eb\', textDecoration: \'none\', fontWeight: \'500\' }}>Edit</Link>\n                    </td>'
  );
  
  fs.writeFileSync(filePath, code, 'utf8');
  console.log("Products page updated with Actions column");
} else {
  console.log("Already updated");
}
