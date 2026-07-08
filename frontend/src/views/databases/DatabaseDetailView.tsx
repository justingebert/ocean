import { useNavigate, useParams } from "react-router-dom";
import { DatabasesNavigation } from "@/navigation/navigation.ts";
import { routePaths } from "@/navigation/routes.ts";
import { DatabaseDetailPage } from "../../components/databases/detail/DatabaseDetailPage";
import AppLayout from "../../layouts/AppLayout";
import Headline from "../../components/Headline";

const DatabaseDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const databaseId = parseDatabaseId(id);
  const navigate = useNavigate();

  return (
    <AppLayout selectedNavigation={DatabasesNavigation.name}>
      {databaseId === undefined ? (
        <div>
          <Headline title="Database not found" size="large" />
          <p className="text-sm">The requested database id is invalid.</p>
        </div>
      ) : (
        <DatabaseDetailPage
          databaseId={databaseId}
          onDeleted={() => navigate(routePaths.databases)}
        />
      )}
    </AppLayout>
  );
};

function parseDatabaseId(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default DatabaseDetailView;
