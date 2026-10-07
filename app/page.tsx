import PortfolioHome from "./components/portfolio-home";
import { listProjects } from "@/lib/projects";
export const dynamic = "force-dynamic";
export default async function Home() {
  try {
    return <PortfolioHome projects={await listProjects()} />;
  } catch (error) {
    console.error("Homepage projects unavailable", error);
    return <PortfolioHome loadError />;
  }
}
