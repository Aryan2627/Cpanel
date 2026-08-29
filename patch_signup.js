const fs = require('fs');
let code = fs.readFileSync('src/app/signup/page.tsx', 'utf8');

const industries = [
  "Manufacturing", "Automotive", "Pharmaceuticals", "Chemicals", "Oil & Gas",
  "Petrochemicals", "Steel & Metals", "Mining", "Construction", "Infrastructure",
  "Real Estate", "Cement", "Power & Energy", "Renewable Energy", "Electrical & Electronics",
  "Telecommunications", "Information Technology (IT)", "Software / SaaS", "IT Hardware",
  "Semiconductors", "Consumer Electronics", "FMCG", "Food & Beverage", "Agriculture",
  "Textiles", "Apparel & Fashion", "Leather & Footwear", "Paper & Packaging", "Printing",
  "Plastics & Rubber", "Glass", "Ceramics", "Furniture", "Home & Building Materials",
  "Retail", "Wholesale & Distribution", "E-commerce", "Logistics", "Transportation",
  "Warehousing", "Shipping & Maritime", "Aviation", "Railways", "Healthcare",
  "Hospitals", "Medical Devices", "Biotechnology", "Education", "Hospitality",
  "Hotels & Resorts", "Restaurants & Catering", "Travel & Tourism", "Banking & Financial Services",
  "Insurance", "Real Estate Services", "Professional Services", "Consulting", "Legal Services",
  "Accounting & Audit", "Marketing & Advertising", "Media & Entertainment", "Government & Public Sector",
  "Defense & Aerospace", "Security Services", "Facility Management", "Cleaning & Housekeeping",
  "Human Resources / Staffing", "Engineering Services", "Industrial Equipment", "Machinery & Equipment",
  "Industrial Automation", "Robotics", "HVAC", "Fire & Safety", "Water & Waste Management",
  "Environmental Services", "Energy & Utilities", "Telecom Infrastructure", "Printing & Office Supplies",
  "Packaging & Materials", "Furniture & Office Infrastructure", "Chemicals & Industrial Consumables",
  "Lubricants & Oils", "Tools & Hardware", "Safety Equipment / PPE", "Laboratory Equipment & Supplies",
  "Medical Supplies", "Agricultural Equipment", "Renewable Energy Equipment", "Solar",
  "Wind Energy", "Battery & Energy Storage", "EV & EV Components", "Aerospace Components",
  "Marine & Shipbuilding", "Railway Equipment", "Defense Manufacturing", "Luxury Goods", "Jewellery"
];

const selectHTML = `
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Company Category / Industry</label>
                <select 
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  required
                  className="input-field"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
                >
                  <option value="">Select your industry...</option>
                  ${industries.map(i => `<option value="${i}">${i}</option>`).join('\n                  ')}
                </select>
              </div>
`;

// Add industry to state
code = code.replace(
  `const [formData, setFormData] = useState({ companyName: '', name: '', email: '', password: '' });`,
  `const [formData, setFormData] = useState({ companyName: '', industry: '', name: '', email: '', password: '' });`
);

// Insert select before Your Name
code = code.replace(
  `                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Your Name</label>`,
  selectHTML + `\n                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Your Name</label>`
);

fs.writeFileSync('src/app/signup/page.tsx', code, 'utf8');
