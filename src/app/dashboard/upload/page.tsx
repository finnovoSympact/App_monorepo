"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  File,
  X,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

interface UploadedFile {
  id: string;
  file: File;
  type: string;
}

const SUPPORTED_FORMATS = [
  { ext: ".pdf", label: "PDF", icon: FileText },
  { ext: ".png,.jpg,.jpeg", label: "Images", icon: ImageIcon },
  { ext: ".csv,.txt", label: "CSV/TXT", icon: File },
];

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [goal, setGoal] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honorDeclared, setHonorDeclared] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles = droppedFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      type: file.type,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      type: file.type,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return FileText;
    if (type.includes("image")) return ImageIcon;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const handleSubmit = async () => {
    if (files.length === 0 || !goal.trim()) {
      toast.error("Please upload at least one file and describe your goal");
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a run ID
      const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const smeId = companyName.toLowerCase().replace(/\s+/g, "-") || "sme-demo";

      // In a real implementation, we'd upload files to storage here
      // For demo, we'll just navigate to the pipeline view with offline mode

      const isOffline = !process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

      router.push(
        `/dashboard/pipeline/${runId}?smeId=${encodeURIComponent(smeId)}&goal=${encodeURIComponent(goal)}&offline=${isOffline ? "1" : "0"}`,
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to start pipeline. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 pt-12 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="space-y-8"
      >
        <div>
          <h1 className="mb-2 font-instrument text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight">Upload Documents</h1>
          <p className="text-muted-foreground text-sm">
            Upload your financial documents to start the credit passport pipeline
          </p>
        </div>

        {/* Drop zone */}
        <div
          role="region"
          aria-label="File upload drop zone"
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
            isDragging
              ? "border-[var(--linear-brand)] bg-[var(--linear-brand)]/5"
              : "border-border/60 hover:border-[var(--linear-brand)]/40 hover:bg-muted/20"
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.csv,.txt"
            onChange={handleFileInput}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <Upload aria-hidden="true" className="text-muted-foreground/60 mx-auto mb-4 size-12" />
          <p className="mb-2 text-base font-medium">Drop your financial documents here</p>
          <p className="text-muted-foreground mb-4 text-sm">or click to browse your files</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SUPPORTED_FORMATS.map((format) => (
              <Badge key={format.label} variant="outline" className="text-xs">
                <format.icon aria-hidden="true" className="mr-1 size-3" />
                {format.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-medium">Uploaded files ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file) => {
                const Icon = getFileIcon(file.type);
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.15 }}
                    className="border-border/60 bg-card flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="bg-muted flex size-8 items-center justify-center rounded">
                      <Icon aria-hidden="true" className="text-muted-foreground size-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{file.file.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(file.file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      aria-label={`Remove ${file.file.name}`}
                      className="shrink-0"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Company info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company name</Label>
            <Input
              id="company"
              placeholder="e.g., Café El Wafa SARL"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">
              What is your financing goal? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="goal"
              rows={3}
              placeholder="e.g., Working capital loan of 30,000 TND to expand inventory for Ramadan season"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="resize-none"
            />
            <p className="text-muted-foreground text-xs">
              Be specific — this helps the AI agents tailor the analysis
            </p>
          </div>
        </div>

        {/* Déclaration sur l'Honneur — legal liability shield (per spec) */}
        <div
          className={`rounded-xl border p-4 transition-colors ${
            honorDeclared
              ? "border-[#26397A]/30 bg-[#26397A]/5"
              : "border-amber-300/50 bg-amber-50/60"
          }`}
        >
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={honorDeclared}
              onChange={(e) => setHonorDeclared(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[#26397A]"
            />
            <span className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
              <strong>Déclaration sur l&apos;Honneur —</strong> Je certifie sur l&apos;honneur que les
              documents financiers fournis sont exacts, sincères et conformes aux déclarations
              fiscales soumises aux Autorités Fiscales Tunisiennes (Recette des Finances).
              <span className="text-muted-foreground ml-1 text-xs">
                (I certify that the financial documents provided are exact and conform to tax declarations.)
              </span>
            </span>
          </label>
          {!honorDeclared && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
              <AlertCircle className="size-3.5 shrink-0" />
              You must accept this declaration before submitting your documents.
            </p>
          )}
          {honorDeclared && (
            <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "#26397A" }}>
              <ShieldCheck className="size-3.5 shrink-0" />
              Declaration accepted — your submission is legally binding under Tunisian law.
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={files.length === 0 || !goal.trim() || isSubmitting || !honorDeclared}
          >
            {isSubmitting ? (
              "Starting pipeline..."
            ) : (
              <>
                Start pipeline
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          {files.length === 0 && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <AlertCircle className="size-3.5" />
              Upload at least one file to continue
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
