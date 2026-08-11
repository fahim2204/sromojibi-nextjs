import { redirect } from "next/navigation";

type Props = {
  params: { slug: string };
};

export default function LegacyWorkerRedirect({ params }: Props) {
  redirect(`/workers/${params.slug}`);
}
