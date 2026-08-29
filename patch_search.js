const fs = require('fs');
let code = fs.readFileSync('src/app/signup/page.tsx', 'utf8');

const selectHTML = `              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Company Category / Industry</label>
                <select 
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  required
                  className="input-field"
                  style={{ backgroundColor: '#fff' }}
                >
                  <option value="">Select your industry...</option>
                  ${'${industries.map(i => `<option value="${i}">${i}</option>`).join(\'\\n                  \')}'}
                </select>
              </div>`;

// We will replace the <select> with an <input list="..."> and a <datalist>
const datalistHTML = `              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Company Category / Industry</label>
                <input 
                  list="industries-list"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  required
                  placeholder="Type to search or select industry..."
                  className="input-field"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#fff' }}
                />
                <datalist id="industries-list">
                  {industries.map(i => <option key={i} value={i} />)}
                </datalist>
              </div>`;

// Try string replacement. We need to be careful with the exact string.
// Let's use a regex that matches the div containing the select.
const regex = /<div>\s*<label[^>]*>Company Category \/ Industry<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/;

if (regex.test(code)) {
    code = code.replace(regex, datalistHTML);
    fs.writeFileSync('src/app/signup/page.tsx', code, 'utf8');
    console.log("Successfully patched Cpanel signup with datalist!");
} else {
    console.log("Regex didn't match in Cpanel");
}
