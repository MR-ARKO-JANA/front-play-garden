import { createFileRoute } from "@tanstack/react-router";
import { FileText, Lock, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageTitle, Panel, formatDate } from "@/components/medergency/ui";
import { useMedergency } from "@/lib/medergency/store";
import type { MedicalRecord, RecordCategory } from "@/lib/medergency/types";

export const Route = createFileRoute("/patient/records")({
  head: () => ({
    meta: [
      { title: "Medical Records | Medergency" },
      {
        name: "description",
        content:
          "Upload and organise your prescriptions, lab reports and medical history privately.",
      },
      { property: "og:title", content: "Medical Records | Medergency" },
      { property: "og:description", content: "Your private medical documents in one place." },
    ],
  }),
  component: Records,
});

const categories: RecordCategory[] = [
  "Prescriptions",
  "Lab Reports",
  "Medical History",
  "Other Documents",
];

function Records() {
  const { records, currentPatient, addRecord, deleteRecord } = useMedergency();
  const ref = useRef<HTMLInputElement>(null);
  const [cat, setCat] = useState<RecordCategory | "All">("All");
  const [uploadCat, setUploadCat] = useState<RecordCategory>("Lab Reports");
  const [del, setDel] = useState<MedicalRecord | null>(null);
  const [view, setView] = useState<MedicalRecord | null>(null);
  const mine = records.filter(
    (r) => r.patientId === currentPatient?.id && (cat === "All" || r.category === cat),
  );

  return (
    <div>
      <PageTitle
        title="Medical Records"
        subtitle="Visible only to you and doctors you consult with."
      />
      <Panel className="mb-4 flex flex-wrap items-center gap-2">
        <select
          aria-label="Upload category"
          value={uploadCat}
          onChange={(e) => setUploadCat(e.target.value as RecordCategory)}
          className="h-9 rounded-md border bg-card px-2.5 text-sm text-foreground"
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          ref={ref}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            if (f.size > 10 * 1024 * 1024) {
              toast.error("File must be under 10 MB");
              return;
            }
            addRecord({
              patientId: currentPatient!.id,
              name: f.name.slice(0, 120),
              category: uploadCat,
              fileType: (f.name.split(".").pop() ?? "file").toUpperCase(),
            });
            toast.success("Record added");
          }}
        />
        <Button onClick={() => ref.current?.click()}>
          <Upload size={16} />
          Upload report
        </Button>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock size={13} />
          Stored on this device in the prototype
        </span>
      </Panel>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", ...categories] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1 text-sm ${cat === c ? "border-primary bg-secondary text-secondary-foreground" : "bg-card text-muted-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-2">
        {mine.length === 0 && (
          <Panel>
            <p className="text-sm text-muted-foreground">No documents in this category.</p>
          </Panel>
        )}
        {mine.map((r) => (
          <Panel key={r.id} className="flex items-center gap-3 !p-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary">
              <FileText size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground">
                {r.category} · {r.fileType} · {formatDate(r.uploadedAt)}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setView(r)}>
              View
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              aria-label={`Delete ${r.name}`}
              onClick={() => setDel(r)}
            >
              <Trash2 size={16} />
            </Button>
          </Panel>
        ))}
      </div>
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{view?.name}</DialogTitle>
            <DialogDescription>
              {view?.category} · uploaded {view && formatDate(view.uploadedAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid h-48 place-items-center rounded-lg bg-muted text-sm text-muted-foreground">
            Document preview will be available once secure storage is connected.
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              "{del?.name}" will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (del) deleteRecord(del.id);
                setDel(null);
                toast.success("Document deleted");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
