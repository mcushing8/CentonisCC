/* eslint-disable @typescript-eslint/no-explicit-any */
import Mention from "@tiptap/extension-mention";
import type { SuggestionProps } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import type { EntityMentionItem } from "@/components/mentions/EntityMentionList";
import { EntityMentionList } from "@/components/mentions/EntityMentionList";

type GetItemsFn = (query: string) => EntityMentionItem[];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    entityMention: {
      setEntityMention: (attrs: {
        id: string;
        label: string;
        href: string;
        type: "note" | "entry" | "project";
      }) => ReturnType;
    };
  }
}

const EntityMentionExtension = Mention.extend<{
  getItems: GetItemsFn;
}>({
  name: "entityMention",

  addOptions() {
    const parentOptions = this.parent?.();

    return {
      ...parentOptions,
      HTMLAttributes: {
        class:
          "rounded-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[0.75rem] font-medium text-zinc-800 dark:text-zinc-100 cursor-pointer",
      },
      getItems: () => [],
      renderLabel({ node }: any) {
        return `@${node.attrs.label ?? node.attrs.id}`;
      },
      suggestion: {
        char: "@",
        allowSpaces: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: ({ query, editor }: { query: string; editor: any }) => {
          // Look up this extension on the editor to access the live options,
          // rather than relying on `this` binding inside callbacks.
          const extension = (editor.extensionManager.extensions as any[]).find(
            (ext: any) => ext.name === "entityMention",
          ) as { options?: { getItems?: GetItemsFn } } | undefined;

          const getItems: GetItemsFn = extension?.options?.getItems ?? (() => []);
          return getItems(query);
        },
        render: () => {
          let component: ReactRenderer<typeof EntityMentionList> | null = null;
          let popup: any[] = [];

          return {
            onStart: (props: SuggestionProps) => {
              component = new ReactRenderer(EntityMentionList, {
                props: {
                  items: props.items as EntityMentionItem[],
                  command: (item: EntityMentionItem) => {
                    props.command({
                      id: item.id,
                      label: item.label,
                      href: item.href,
                      type: item.type,
                    });
                  },
                  selectedIndex: 0,
                },
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              const result = tippy(document.body, {
                getReferenceClientRect: props.clientRect as any,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              } as any);
              popup = Array.isArray(result) ? result : [result];
            },

            onUpdate(props: SuggestionProps) {
              if (!component) return;

              component.updateProps({
                items: props.items as EntityMentionItem[],
                command: (item: EntityMentionItem) => {
                  props.command({
                    id: item.id,
                    label: item.label,
                    href: item.href,
                    type: item.type,
                  });
                },
              });

              if (!props.clientRect) {
                return;
              }

              popup[0]?.setProps({
                getReferenceClientRect: props.clientRect as any,
              });
            },

            onKeyDown(props: { event: KeyboardEvent }) {
              if (props.event.key === "Escape") {
                popup[0]?.hide();
                return true;
              }

              if (!component) {
                return false;
              }

              const ref = component.ref as unknown as {
                onKeyDown?: (p: { event: KeyboardEvent }) => boolean;
              } | null;

              return ref?.onKeyDown?.(props) ?? false;
            },

            onExit() {
              popup.forEach((instance) => instance.destroy());
              popup = [];
              if (component) {
                component.destroy();
                component = null;
              }
            },
          };
        },
      },
    };
  },

  addAttributes() {
    return {
      id: {},
      label: {},
      href: {},
      type: {},
    };
  },

  addCommands() {
    return {
      setEntityMention:
        (attrs) =>
        ({ chain }) => {
          return chain()
            .insertContent([
              {
                type: this.name,
                attrs,
              },
              { type: "text", text: " " },
            ])
            .run();
        },
    };
  },
});

export default EntityMentionExtension;

