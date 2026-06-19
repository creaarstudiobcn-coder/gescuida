import { CaregiverDetail } from "../../_components/CaregiverDetail";

// Ficha completa de una cuidadora (admin): datos + verificación + chat directo.
export default async function CuidadoraDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaregiverDetail id={id} />;
}
