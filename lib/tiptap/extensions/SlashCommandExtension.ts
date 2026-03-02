/* eslint-disable @typescript-eslint/no-explicit-any */
import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import { Suggestion } from "@tiptap/suggestion";
import type { SuggestionProps } from "@tiptap/suggestion";
import tippy from "tippy.js";
import {
  SlashCommandList,
  SLASH_COMMANDS,
  type SlashCommandItem,
} from "@/components/slash-menu/SlashCommandList";

const SlashCommandExtension = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        allowedPrefixes: [" ", null],
        items: ({ query }: { query: string }) => {
          if (!query) return SLASH_COMMANDS;
          const lower = query.toLowerCase().trim();
          return SLASH_COMMANDS.filter(
            (cmd) =>
              cmd.title.toLowerCase().includes(lower) ||
              cmd.description.toLowerCase().includes(lower) ||
              (cmd.aliases?.some((a) => a.toLowerCase().includes(lower)) ?? false),
          );
        },
        render: () => {
          let component: ReactRenderer<any> | null = null;
          let popup: any[] = [];

          return {
            onStart: (props: SuggestionProps) => {
              component = new ReactRenderer(SlashCommandList as any, {
                props: {
                  items: props.items as SlashCommandItem[],
                  command: (item: SlashCommandItem) => {
                    props.command(item);
                  },
                },
                editor: props.editor,
              });

              if (!props.clientRect) return;

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
                items: props.items as SlashCommandItem[],
                command: (item: SlashCommandItem) => {
                  props.command(item);
                },
              });

              if (!props.clientRect) return;

              popup[0]?.setProps({
                getReferenceClientRect: props.clientRect as any,
              });
            },

            onKeyDown(props: { event: KeyboardEvent }) {
              if (props.event.key === "Escape") {
                popup[0]?.hide();
                return true;
              }

              if (!component) return false;

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
        command: ({
          editor,
          range,
          props,
        }: {
          editor: any;
          range: any;
          props: any;
        }) => {
          const item = props as SlashCommandItem;
          item.action(editor, range);
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export default SlashCommandExtension;
