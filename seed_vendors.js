const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const vendors = [
  { name: 'Global Tech Supplies Inc.', email: 'sales@globaltech.com', phone: '+1-555-0100', type: 'Hardware', vendorCode: 'VEN-1001', companyCode: 'COMP-A', dealsIn: 'Laptops, Servers, Networking', city: 'San Francisco', status: 'Active', tags: JSON.stringify(['Tech', 'Tier-1', 'Reliable']) },
  { name: 'Apex Logistics & Freight', email: 'contact@apexlogistics.com', phone: '+1-555-0101', type: 'Services', vendorCode: 'VEN-1002', companyCode: 'COMP-B', dealsIn: 'Shipping, Freight, Storage', city: 'Chicago', status: 'Active', tags: JSON.stringify(['Logistics', 'Global']) },
  { name: 'Nexus IT Solutions', email: 'hello@nexusit.com', phone: '+1-555-0102', type: 'Software', vendorCode: 'VEN-1003', companyCode: 'COMP-C', dealsIn: 'SaaS, Cloud Infrastructure, Security', city: 'Austin', status: 'Invited', tags: JSON.stringify(['SaaS', 'Cloud', 'Cybersecurity']) },
  { name: 'Pioneer Office Furniture', email: 'orders@pioneerfurniture.com', phone: '+1-555-0103', type: 'Hardware', vendorCode: 'VEN-1004', companyCode: 'COMP-D', dealsIn: 'Desks, Chairs, Cabinets', city: 'New York', status: 'Active', tags: JSON.stringify(['Office', 'Ergonomic']) },
  { name: 'Synergy Consulting Group', email: 'info@synergyconsult.com', phone: '+1-555-0104', type: 'Services', vendorCode: 'VEN-1005', companyCode: 'COMP-E', dealsIn: 'Management, HR, Strategy', city: 'Boston', status: 'Pending Approval', tags: JSON.stringify(['Consulting', 'Premium']) },
  { name: 'Quantum Cloud Hosting', email: 'support@quantumcloud.com', phone: '+1-555-0105', type: 'Software', vendorCode: 'VEN-1006', companyCode: 'COMP-F', dealsIn: 'Cloud Storage, VPS, Domains', city: 'Seattle', status: 'Active', tags: JSON.stringify(['Cloud', 'Infrastructure']) },
  { name: 'Evergreen Cleaning Services', email: 'hello@evergreenclean.com', phone: '+1-555-0106', type: 'Services', vendorCode: 'VEN-1007', companyCode: 'COMP-G', dealsIn: 'Janitorial, Deep Cleaning', city: 'Denver', status: 'Active', tags: JSON.stringify(['Facilities', 'Local']) },
  { name: 'Horizon Marketing & Media', email: 'campaigns@horizonmedia.com', phone: '+1-555-0107', type: 'Services', vendorCode: 'VEN-1008', companyCode: 'COMP-H', dealsIn: 'Digital Marketing, SEO, Ads', city: 'Los Angeles', status: 'Invited', tags: JSON.stringify(['Marketing', 'Agency']) },
  { name: 'Vanguard Industrial Parts', email: 'sales@vanguardparts.com', phone: '+1-555-0108', type: 'Hardware', vendorCode: 'VEN-1009', companyCode: 'COMP-I', dealsIn: 'Machinery, Tools, Equipment', city: 'Detroit', status: 'Active', tags: JSON.stringify(['Industrial', 'Heavy Machinery']) },
  { name: 'Meridian Legal Advisors', email: 'legal@meridianlaw.com', phone: '+1-555-0109', type: 'Services', vendorCode: 'VEN-1010', companyCode: 'COMP-J', dealsIn: 'Corporate Law, Contracts, IP', city: 'Washington D.C.', status: 'Active', tags: JSON.stringify(['Legal', 'Corporate']) },
  { name: 'Luminous Design Agency', email: 'design@luminous.agency', phone: '+1-555-0110', type: 'Services', vendorCode: 'VEN-1011', companyCode: 'COMP-K', dealsIn: 'UI/UX, Branding, Graphics', city: 'Portland', status: 'Pending Approval', tags: JSON.stringify(['Design', 'Creative']) },
  { name: 'Titan Security Systems', email: 'security@titansec.com', phone: '+1-555-0111', type: 'Hardware', vendorCode: 'VEN-1012', companyCode: 'COMP-L', dealsIn: 'CCTV, Access Control, Alarms', city: 'Houston', status: 'Active', tags: JSON.stringify(['Security', 'Hardware']) },
  { name: 'OmniData Analytics', email: 'data@omnidata.ai', phone: '+1-555-0112', type: 'Software', vendorCode: 'VEN-1013', companyCode: 'COMP-M', dealsIn: 'BI Tools, Data Warehousing', city: 'San Jose', status: 'Active', tags: JSON.stringify(['AI', 'Data', 'SaaS']) },
  { name: 'BlueWave Event Management', email: 'events@bluewave.com', phone: '+1-555-0113', type: 'Services', vendorCode: 'VEN-1014', companyCode: 'COMP-N', dealsIn: 'Corporate Events, Catering, Venues', city: 'Miami', status: 'Invited', tags: JSON.stringify(['Events', 'Hospitality']) },
  { name: 'Prime Print & Packaging', email: 'print@primepackaging.com', phone: '+1-555-0114', type: 'Hardware', vendorCode: 'VEN-1015', companyCode: 'COMP-O', dealsIn: 'Custom Boxes, Labels, Brochures', city: 'Atlanta', status: 'Active', tags: JSON.stringify(['Print', 'Packaging']) },
  { name: 'Zenith HR Solutions', email: 'hr@zenithsolutions.com', phone: '+1-555-0115', type: 'Software', vendorCode: 'VEN-1016', companyCode: 'COMP-P', dealsIn: 'HRIS, Payroll, Benefits Admin', city: 'Dallas', status: 'Active', tags: JSON.stringify(['HR', 'SaaS', 'Payroll']) },
  { name: 'EcoPower Energy', email: 'green@ecopower.net', phone: '+1-555-0116', type: 'Hardware', vendorCode: 'VEN-1017', companyCode: 'COMP-Q', dealsIn: 'Solar Panels, Batteries', city: 'Phoenix', status: 'Pending Approval', tags: JSON.stringify(['Energy', 'Green', 'Hardware']) },
  { name: 'Astra Telecom Providers', email: 'support@astratelecom.com', phone: '+1-555-0117', type: 'Services', vendorCode: 'VEN-1018', companyCode: 'COMP-R', dealsIn: 'VoIP, Internet, Fiber', city: 'Philadelphia', status: 'Active', tags: JSON.stringify(['Telecom', 'Infrastructure']) },
  { name: 'Nova Financial Services', email: 'audit@novafinancial.com', phone: '+1-555-0118', type: 'Services', vendorCode: 'VEN-1019', companyCode: 'COMP-S', dealsIn: 'Accounting, Auditing, Tax', city: 'Charlotte', status: 'Active', tags: JSON.stringify(['Finance', 'Audit']) },
  { name: 'Vertex Build & Construction', email: 'projects@vertexbuild.com', phone: '+1-555-0119', type: 'Services', vendorCode: 'VEN-1020', companyCode: 'COMP-T', dealsIn: 'Office Buildouts, Renovation', city: 'Las Vegas', status: 'Invited', tags: JSON.stringify(['Construction', 'Facilities']) },
  { name: 'Pulse Healthcare Supplies', email: 'sales@pulsehealth.com', phone: '+1-555-0120', type: 'Hardware', vendorCode: 'VEN-1021', companyCode: 'COMP-U', dealsIn: 'PPE, First Aid, Ergonomics', city: 'San Diego', status: 'Active', tags: JSON.stringify(['Healthcare', 'Safety']) },
  { name: 'Crest Web Development', email: 'dev@crestweb.io', phone: '+1-555-0121', type: 'Services', vendorCode: 'VEN-1022', companyCode: 'COMP-V', dealsIn: 'Custom Apps, Websites, E-com', city: 'Raleigh', status: 'Active', tags: JSON.stringify(['Development', 'Web']) },
  { name: 'Silverline Travel Agency', email: 'bookings@silverlinetravel.com', phone: '+1-555-0122', type: 'Services', vendorCode: 'VEN-1023', companyCode: 'COMP-W', dealsIn: 'Flights, Hotels, Corporate Retreats', city: 'Orlando', status: 'Pending Approval', tags: JSON.stringify(['Travel', 'Corporate']) },
  { name: 'Stratosphere Logistics', email: 'freight@stratosphere.com', phone: '+1-555-0123', type: 'Services', vendorCode: 'VEN-1024', companyCode: 'COMP-X', dealsIn: 'Air Freight, International Shipping', city: 'Newark', status: 'Active', tags: JSON.stringify(['Logistics', 'Air']) },
  { name: 'Ironclad Data Centers', email: 'colocation@ironclad.com', phone: '+1-555-0125', type: 'Software', vendorCode: 'VEN-1025', companyCode: 'COMP-Y', dealsIn: 'Server Hosting, Colocation, Backups', city: 'Ashburn', status: 'Active', tags: JSON.stringify(['Data Center', 'Cloud']) },
  { name: 'Nimbus Recruiting', email: 'talent@nimbusrecruiting.com', phone: '+1-555-0126', type: 'Services', vendorCode: 'VEN-1026', companyCode: 'COMP-Z', dealsIn: 'Headhunting, Temp Staffing', city: 'Minneapolis', status: 'Invited', tags: JSON.stringify(['HR', 'Recruitment']) },
  { name: 'Optima Office Supplies', email: 'orders@optimaoffice.com', phone: '+1-555-0127', type: 'Hardware', vendorCode: 'VEN-1027', companyCode: 'COMP-AA', dealsIn: 'Stationery, Printers, Ink', city: 'Cleveland', status: 'Active', tags: JSON.stringify(['Office', 'Supplies']) },
  { name: 'Vortex Fleet Management', email: 'leasing@vortexfleet.com', phone: '+1-555-0128', type: 'Services', vendorCode: 'VEN-1028', companyCode: 'COMP-BB', dealsIn: 'Company Cars, Truck Leasing', city: 'Indianapolis', status: 'Active', tags: JSON.stringify(['Fleet', 'Leasing']) },
  { name: 'Pinnacle Catering Co.', email: 'food@pinnaclecatering.com', phone: '+1-555-0129', type: 'Services', vendorCode: 'VEN-1029', companyCode: 'COMP-CC', dealsIn: 'Office Lunches, Event Catering', city: 'Nashville', status: 'Pending Approval', tags: JSON.stringify(['Food', 'Catering']) },
  { name: 'Oasis Water & Coffee', email: 'delivery@oasiswater.com', phone: '+1-555-0130', type: 'Hardware', vendorCode: 'VEN-1030', companyCode: 'COMP-DD', dealsIn: 'Water Coolers, Coffee Machines', city: 'Salt Lake City', status: 'Active', tags: JSON.stringify(['Breakroom', 'Facilities']) },
];

async function main() {
  console.log('Seeding 30 demo vendors...');
  let createdCount = 0;
  for (const v of vendors) {
    try {
      await prisma.vendor.create({
        data: {
          ...v,
          taxId: 'TAX-' + Math.floor(100000 + Math.random() * 900000).toString(),
          tradeLicense: 'LIC-' + Math.floor(100000 + Math.random() * 900000).toString(),
        }
      });
      createdCount++;
    } catch(err) {
      console.error('Error creating vendor', v.name, err.message);
    }
  }
  console.log('Successfully seeded ' + createdCount + ' vendors!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
