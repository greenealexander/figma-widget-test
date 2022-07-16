const {
  AutoLayout,
  Text,
  Input,
  useSyncedState,
  useEffect,
  usePropertyMenu,
  useWidgetId,
  Fragment,
} = figma.widget;

function Badge({ num, frameId }: { num: number; frameId: string }) {
  return (
    <AutoLayout
      horizontalAlignItems="center"
      verticalAlignItems="center"
      width={24}
      height={24}
      fill="#0000FF"
      cornerRadius={24}
      onClick={() => {
        const badgeNode = figma.getNodeById(frameId);
        if (badgeNode) figma.viewport.scrollAndZoomIntoView([badgeNode]);
      }}
    >
      <Text fill="#FFF">{num}</Text>
    </AutoLayout>
  );
}

function Widget() {
  useSyncedState("version", "BTO-ANNOT-1");
  const [title, setTitle] = useSyncedState("title", "ANNOTATION");
  const [parts, setParts] = useSyncedState<any[]>("parts", []);
  const widgetId = useWidgetId();

  usePropertyMenu(
    [
      parts.length
        ? { itemType: "action", tooltip: "Edit", propertyName: "edit" }
        : {
            itemType: "action",
            tooltip: "Add Parts",
            propertyName: "addParts",
          },
    ],
    () => {
      return new Promise<void>((resolve) => {
        figma.showUI(__html__);
        figma.ui.on("message", async (msg) => {
          if (msg.type === "add-part") {
            await Promise.all([
              figma.loadFontAsync({ family: "Inter", style: "Regular" }),
              figma.loadFontAsync({ family: "Inter", style: "Bold" }),
            ]);

            setParts((parts) => {
              const currentSelectedNode = figma.currentPage.selection[0];
              const [xTransform, yTransform] =
                currentSelectedNode.absoluteTransform;
              const [, , x] = xTransform;
              const [, , y] = yTransform;

              const badgeFrame = figma.createFrame();
              figma.currentPage.appendChild(badgeFrame);
              badgeFrame.layoutMode = "HORIZONTAL";
              badgeFrame.primaryAxisAlignItems = "CENTER";
              badgeFrame.counterAxisAlignItems = "CENTER";
              badgeFrame.x = x - 12;
              badgeFrame.y = y - 12;
              badgeFrame.resize(24, 24);
              badgeFrame.fills = [
                { type: "SOLID", color: { r: 0, g: 0, b: 1 } },
              ];
              badgeFrame.cornerRadius = 24;
              const badgeNumTextNode = figma.createText();
              badgeFrame.appendChild(badgeNumTextNode);
              badgeNumTextNode.characters = `${parts.length + 1}`;
              badgeNumTextNode.fontSize = 16;
              badgeNumTextNode.fills = [
                { type: "SOLID", color: { r: 1, g: 1, b: 1 } },
              ];

              return [
                ...parts,
                { ...msg.part, relatedBadgeNodeId: badgeFrame.id },
              ];
            });
          } else if (msg.type === "close") {
            const widgetNode = figma.getNodeById(widgetId) as WidgetNode;
            if (widgetNode) {
              figma.viewport.scrollAndZoomIntoView([widgetNode]);
            }
            figma.closePlugin();
            resolve();
          }
        });
      });
    }
  );

  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      height="hug-contents"
      width={329}
      padding={16}
      fill="#FFFFFF"
      cornerRadius={8}
      spacing={8}
      effect={{
        type: "drop-shadow",
        color: { r: 0, g: 0, b: 0, a: 0.1 },
        offset: { x: 0, y: 4 },
        blur: 8,
        spread: 4,
      }}
    >
      <Input
        fill="#aaa"
        fontSize={24}
        height="hug-contents"
        horizontalAlignText="left"
        inputBehavior="multiline"
        inputFrameProps={{
          fill: "#FFFFFF",
          horizontalAlignItems: "center",
          padding: 8,
          verticalAlignItems: "center",
        }}
        onTextEditEnd={(e) => setTitle(e.characters)}
        value={title}
        width="fill-parent"
      />

      {parts.map((p, i) => (
        <AutoLayout
          key={i}
          direction="horizontal"
          verticalAlignItems="start"
          height="hug-contents"
          width="fill-parent"
          fill="#FFFFFF"
          spacing={16}
        >
          <Badge num={i + 1} frameId={p.relatedBadgeNodeId} />

          <AutoLayout
            direction="vertical"
            horizontalAlignItems="start"
            height="hug-contents"
            width="fill-parent"
            fill="#FFFFFF"
            spacing={8}
          >
            <Text
              width="fill-parent"
              fill="#000"
              fontWeight={700}
              lineHeight={24}
            >
              {p.name}
            </Text>

            {p.conditions.map((cond: any, j: number) => (
              <AutoLayout
                direction="vertical"
                horizontalAlignItems="start"
                height="hug-contents"
                width="fill-parent"
                fill="#FFFFFF"
                spacing={8}
                key={j}
              >
                <Text width="fill-parent" fill="#000">
                  {cond.when.operator === "Always"
                    ? `${cond.type} ${cond.when.operator}`
                    : `${cond.type} when:`}
                </Text>
                <RecursiveWhenBlock when={cond.when} />
              </AutoLayout>
            ))}
          </AutoLayout>
        </AutoLayout>
      ))}
    </AutoLayout>
  );
}

function WhenBlock({ when }: any) {
  return (
    <Fragment>
      {when.assertions?.map((a: string, i: number) => (
        <Text key={i} width="fill-parent" fill="#000">
          {i === 0 ? `• ${a}` : `• ${when.operator} ${a}`}
        </Text>
      ))}
      {when.when && (
        <Fragment>
          <AutoLayout
            direction="horizontal"
            verticalAlignItems="start"
            horizontalAlignItems="start"
            width="fill-parent"
          >
            <AutoLayout padding={{ right: 4 }}>
              <Text fill="#000">•</Text>
            </AutoLayout>
            <Text width="fill-parent">{when.operator} when:</Text>
          </AutoLayout>
          <AutoLayout
            direction="vertical"
            horizontalAlignItems="start"
            height="hug-contents"
            width="fill-parent"
            fill="#FFFFFF"
            spacing={8}
            padding={{ left: 24 }}
          >
            <RecursiveWhenBlock when={when.when} />
          </AutoLayout>
        </Fragment>
      )}
    </Fragment>
  );
}

function RecursiveWhenBlock({ when }: any) {
  return <WhenBlock when={when} />;
}

figma.widget.register(Widget);
