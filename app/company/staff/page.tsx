import { getCompanyStaff } from './actions';
import CompanyStaffClient from './CompanyStaffClient';

export default async function CompanyStaffPage() {
  const staffMembers = await getCompanyStaff();

  return <CompanyStaffClient staffMembers={staffMembers} />;
}
