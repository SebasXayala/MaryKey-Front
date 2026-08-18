import { TutorialDetail } from "@/app/(site)/tutoriales/[slug]/tutorial-detail";

export default async function TutorialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <TutorialDetail slug={slug} />
    </div>
  );
}
