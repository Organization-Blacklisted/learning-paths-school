// Test helper (BlockRenderer.test.tsx): a stand-in for a section component that shows which section it is and what it received.
export function sectionStub(name: string) {
  return function SectionStub(props: { content?: unknown; attachToFooter?: boolean }) {
    return (
      <div
        data-section={name}
        data-has-content={props.content === undefined ? "no" : "yes"}
        data-attach={props.attachToFooter === undefined ? "unset" : String(props.attachToFooter)}
      />
    );
  };
}
