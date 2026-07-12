import { useNavigate, useParams } from "react-router-dom";
import { routePaths } from "@/app/navigation/routes.ts";
import { DatabaseDetailPage } from "@/features/databases/components/detail/DatabaseDetailPage";
import { PageHeader } from "@/components/common/PageHeader";

const DatabaseDetailRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const databaseId = parseDatabaseId(id);
  const navigate = useNavigate();

  return (
    <>
      {databaseId === undefined ? (
        <PageHeader
          title="Database not found"
          description="The requested database id is invalid."
        />
      ) : (
        <DatabaseDetailPage
          databaseId={databaseId}
          onDeleted={() => navigate(routePaths.databases)}
        />
      )}
    </>
  );
};

function parseDatabaseId(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default DatabaseDetailRoute;
