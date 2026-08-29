const fs = require('fs');
let code = fs.readFileSync('src/app/signup/page.tsx', 'utf8');

const regex = /{industries\.map\(i => <option key={i} value={i} \/>\)}/;

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

const optionHTML = industries.map(i => `<option value="${i}" />`).join('\n                  ');

code = code.replace(regex, optionHTML);

fs.writeFileSync('src/app/signup/page.tsx', code, 'utf8');
console.log("Success");
