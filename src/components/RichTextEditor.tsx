import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  LinkIcon, ImageIcon, Code, Undo, Redo, FileCode,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from "lucide-react";
import { toast } from "sonner";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const [showHtml, setShowHtml] = useState(false);
  const [htmlSource, setHtmlSource] = useState("");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const insertImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
      const reader = new FileReader();
      reader.onload = () => {
        editor?.chain().focus().setImage({ src: reader.result as string }).run();
        toast.success("Image inserted");
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [editor]);

  const openLinkDialog = useCallback(() => {
    const { from, to } = editor?.state.selection || { from: 0, to: 0 };
    const selectedText = editor?.state.doc.textBetween(from, to, "") || "";
    setLinkText(selectedText);
    setLinkUrl(editor?.getAttributes("link").href || "");
    setLinkDialogOpen(true);
  }, [editor]);

  const applyLink = () => {
    if (!linkUrl.trim()) {
      editor?.chain().focus().unsetLink().run();
    } else {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      if (linkText && !editor?.state.selection.content().size) {
        editor?.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run();
      } else {
        editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }
    }
    setLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
  };

  const toggleHtmlView = () => {
    if (!showHtml) { setHtmlSource(editor?.getHTML() || ""); }
    else { editor?.commands.setContent(htmlSource); onChange(htmlSource); }
    setShowHtml(!showHtml);
  };

  if (!editor) return null;

  const ToolBtn = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <Button type="button" variant="ghost" size="icon" onClick={onClick} title={title}
      className={`h-8 w-8 ${active ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground"}`}>
      {children}
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b bg-secondary/50">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic className="w-4 h-4" /></ToolBtn>
        <div className="w-px h-6 bg-border mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1"><Heading1 className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 className="w-4 h-4" /></ToolBtn>
        <div className="w-px h-6 bg-border mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List"><List className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List"><ListOrdered className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block"><Code className="w-4 h-4" /></ToolBtn>
        <div className="w-px h-6 bg-border mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left"><AlignLeft className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center"><AlignCenter className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right"><AlignRight className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify"><AlignJustify className="w-4 h-4" /></ToolBtn>
        <div className="w-px h-6 bg-border mx-1" />
        <ToolBtn onClick={openLinkDialog} active={editor.isActive("link")} title="Add Link"><LinkIcon className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={insertImage} title="Insert Image"><ImageIcon className="w-4 h-4" /></ToolBtn>
        <div className="w-px h-6 bg-border mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="w-4 h-4" /></ToolBtn>
        <div className="flex-1" />
        <ToolBtn onClick={toggleHtmlView} active={showHtml} title="HTML View"><FileCode className="w-4 h-4" /></ToolBtn>
      </div>
      {showHtml ? (
        <textarea value={htmlSource} onChange={e => setHtmlSource(e.target.value)} className="w-full min-h-[300px] p-4 font-mono text-xs bg-card text-foreground focus:outline-none resize-y" />
      ) : (
        <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 min-h-[300px] focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-3 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:mb-3 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:mb-3 [&_.ProseMirror_li]:mb-1 [&_.ProseMirror_a]:text-accent [&_.ProseMirror_a]:underline [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:my-4 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0" />
      )}

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Insert Link</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>URL</Label>
              <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://example.com" autoFocus onKeyDown={e => e.key === "Enter" && applyLink()} />
            </div>
            <div>
              <Label>Text (optional)</Label>
              <Input value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="Link text" onKeyDown={e => e.key === "Enter" && applyLink()} />
            </div>
            <div className="flex gap-2">
              <Button onClick={applyLink} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">Apply</Button>
              {editor.isActive("link") && (
                <Button variant="outline" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkDialogOpen(false); }}>Remove</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
