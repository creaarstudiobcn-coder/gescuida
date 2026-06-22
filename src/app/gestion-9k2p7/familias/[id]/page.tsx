import { FamilyDetail } from "../../_components/FamilyDetail";

// Ficha completa de una familia (admin): datos, suscripción, personas a cuidar y borrado.
export default async function FamiliaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FamilyDetail id={id} />;
}
