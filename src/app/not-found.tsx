import Button from "@/components/ui/Button";
import NoticeScreen from "@/components/ui/NoticeScreen";

export default function NotFound() {
  return (
    <NoticeScreen
      eyebrow="404"
      title="Page not found"
      description="This page may have moved or the link may be incorrect."
      actions={<Button href="/">Back to Arvent</Button>}
    />
  );
}

