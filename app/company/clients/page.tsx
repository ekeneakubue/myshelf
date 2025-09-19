import { getCompanies } from "../../(app)/companies/actions";
import CompaniesClient from "../../(app)/companies/CompaniesClient";

export default async function CompanyClientsPage() {
  const companies = await getCompanies();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
      </div>
      <CompaniesClient companies={companies} />
    </div>
  );
}


