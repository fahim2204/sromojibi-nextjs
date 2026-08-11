import { redirect } from "next/navigation";

type Props = {
  params: { slug: string; upazila: string };
};

export default function LegacyUpazilaRedirect({ params }: Props) {
  redirect(`/locations/${params.slug}/${params.upazila}`);
}
