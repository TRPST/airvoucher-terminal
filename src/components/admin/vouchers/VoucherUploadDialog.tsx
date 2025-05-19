import * as React from "react";
import { Upload, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { AdminActions } from "@/actions";
import { getVoucherTypeNameFromFile } from "@/utils/voucherFileParser";

type UploadDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function VoucherUploadDialog({ isOpen, onClose, onSuccess }: UploadDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState<{
    success: boolean;
    message: string;
    details?: string[];
  } | null>(null);
  const [uploadMode, setUploadMode] = React.useState<"merge" | "replace">("merge");
  
  // Reset state when dialog is opened/closed
  React.useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setUploadResult(null);
      setIsUploading(false);
    }
  }, [isOpen]);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
    }
  };
  
  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setUploadResult(null);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  // Process file upload
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadResult(null);
    
    try {
      // Read file content
      const fileContent = await readFileAsText(file);
      
      // Send to server for processing
      const { data, error } = await AdminActions.processVoucherFile(fileContent);
      
      if (error) {
        setUploadResult({
          success: false,
          message: `Error: ${error.message}`,
        });
        return;
      }
      
      if (!data) {
        setUploadResult({
          success: false,
          message: "Unknown error occurred during upload",
        });
        return;
      }
      
      // Check for validation errors
      if (data.errors.length > 0) {
        setUploadResult({
          success: data.validVouchers > 0,
          message: data.validVouchers > 0
            ? `Successfully uploaded ${data.validVouchers} vouchers with ${data.errors.length} errors`
            : "Upload failed: No valid vouchers found",
          details: data.errors,
        });
      } else {
        setUploadResult({
          success: true,
          message: `Successfully uploaded ${data.validVouchers} ${data.voucherType} vouchers`,
        });
        
        // Call the success callback after a brief delay to show the success message
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setUploadResult({
        success: false,
        message: err instanceof Error ? err.message : "Unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Helper to read file content as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };
  
  // If dialog is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upload Vouchers</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="mt-4 space-y-4">
          {/* File Drop Area */}
          {!uploadResult && (
            <div
              className={`rounded-lg border-2 border-dashed border-border p-8 text-center ${
                !!file ? "bg-muted/50" : ""
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              
              {file ? (
                <div className="mt-4">
                  <p className="font-medium">{file.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <>
                  <p className="mt-2 text-sm font-medium">
                    Drag and drop voucher file here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Supported formats: Ringa, Hollywoodbets, and Easyload
                  </p>
                </>
              )}
              
              <label className="mt-4 inline-block cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Browse Files
                <input
                  type="file"
                  accept=".txt,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            </div>
          )}
          
          {/* Upload Results */}
          {uploadResult && (
            <div className={`rounded-lg border p-4 ${
              uploadResult.success ? "border-green-500/30 bg-green-500/10" : "border-destructive/30 bg-destructive/10"
            }`}>
              <div className="flex items-start gap-3">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{uploadResult.message}</p>
                  
                  {uploadResult.details && uploadResult.details.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto rounded bg-card p-2 text-xs">
                      <ul className="list-inside list-disc space-y-1">
                        {uploadResult.details.slice(0, 10).map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                        {uploadResult.details.length > 10 && (
                          <li>...and {uploadResult.details.length - 10} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="pt-4 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium border border-input hover:bg-muted"
              disabled={isUploading}
            >
              {uploadResult?.success ? "Close" : "Cancel"}
            </button>
            
            {!uploadResult && file && (
              <>
                <button
                  onClick={() => {
                    setUploadMode("replace");
                    handleUpload();
                  }}
                  className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      Uploading...
                    </div>
                  ) : (
                    "Upload & Replace All"
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setUploadMode("merge");
                    handleUpload();
                  }}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      Uploading...
                    </div>
                  ) : (
                    "Upload & Merge"
                  )}
                </button>
              </>
            )}
            
            {uploadResult && !uploadResult.success && (
              <button
                onClick={() => {
                  setUploadResult(null);
                  setFile(null);
                }}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
