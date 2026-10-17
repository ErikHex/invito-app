import { getDashboardData } from "./dashboard-data";
import SummaryManager from "./SummaryManager";
export default async function DashboardPage({params}) {
  const {slug}=await params;
  const data=await getDashboardData(slug);
  if(!data)return null;
  return <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
    <SummaryManager evento={data.evento} invitados={data.invitados} slug={slug} />
  </main>;
}
