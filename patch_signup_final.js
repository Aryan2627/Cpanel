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
                  ${industries.map(i => `<option value="${i}">${i}</option>`).join('\n                  ')}
                </select>
              </div>`;

code = code.replace(
  /const \[formData, setFormData\] = useState\(\{ companyName: '', name: '', email: '', password: '' \}\);/,
  "const [formData, setFormData] = useState({ companyName: '', industry: '', name: '', email: '', password: '' });"
);

const parts = code.split('<div>\n                <label style={{ display: \'block\', fontSize: \'0.9rem\', fontWeight: \'600\', color: \'#334155\', marginBottom: \'8px\' }}>Your Name</label>');
if (parts.length === 2) {
  code = parts[0] + selectHTML + '\n\n              <div>\n                <label style={{ display: \'block\', fontSize: \'0.9rem\', fontWeight: \'600\', color: \'#334155\', marginBottom: \'8px\' }}>Your Name</label>' + parts[1];
  fs.writeFileSync('src/app/signup/page.tsx', code, 'utf8');
  console.log("Success");
} else {
  console.log("Failed to split", parts.length);
}
