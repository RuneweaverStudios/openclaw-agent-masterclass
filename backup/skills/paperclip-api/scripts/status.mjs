#!/usr/bin/env node
/**
 * PaperClip Status - Full dashboard
 */

const API = 'http://localhost:3100/api';
const COMPANY_ID = '6b2f06a5-ce52-43f3-865d-7f7b53be45fc';

async function main() {
  console.log('📊 PaperClip Status\n');
  
  // Company
  const companyRes = await fetch(`${API}/companies/${COMPANY_ID}`);
  const company = await companyRes.json();
  console.log(`Company: ${company.name} (${company.issuePrefix})`);
  console.log(`Budget: $${company.budgetMonthlyCents / 100}/mo`);
  console.log(`Spent: $${company.spentMonthlyCents / 100}/mo`);
  console.log('');
  
  // Agents
  const agentsRes = await fetch(`${API}/companies/${COMPANY_ID}/agents`);
  const agents = await agentsRes.json();
  console.log(`Agents: ${agents.length}`);
  agents.forEach(a => {
    console.log(`  - ${a.name} (${a.status})`);
  });
  console.log('');
  
  // Issues
  const issuesRes = await fetch(`${API}/companies/${COMPANY_ID}/issues`);
  const issues = await issuesRes.json();
  console.log(`Issues: ${issues.length} total`);
  const byStatus = {};
  issues.forEach(i => {
    byStatus[i.status] = (byStatus[i.status] || 0) + 1;
  });
  Object.entries(byStatus).forEach(([s, c]) => console.log(`  - ${s}: ${c}`));
}

main().catch(console.error);
