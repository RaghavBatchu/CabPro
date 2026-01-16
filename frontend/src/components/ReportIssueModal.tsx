import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string) => Promise<void>;
  rideInfo: {
    origin: string;
    destination: string;
    driverName: string;
  };
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  rideInfo,
}) => {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(description);
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to report issue:", error);
      toast.error("Failed to report issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Report Issue</h2>
          <p className="text-sm text-gray-600 mb-4">
            Please describe what issue you encountered during this ride.
          </p>
          <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
            <p className="text-gray-700">
              <span className="font-medium">{rideInfo.origin}</span> →{" "}
              <span className="font-medium">{rideInfo.destination}</span>
            </p>
            <p className="text-gray-600 text-xs mt-1">Driver: {rideInfo.driverName}</p>
          </div>
        </div>

        <Textarea
          placeholder="Describe the issue you experienced..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-4 min-h-32"
          disabled={isSubmitting}
        />

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? "Reporting..." : "Report Issue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportIssueModal;
