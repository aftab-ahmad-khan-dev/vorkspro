import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { apiPost } from "@/interceptor/interceptor";

export default function ImportDialog({ onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState([]);

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    return data;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError("Please upload a CSV file only.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = parseCSV(event.target.result);
        setParsedData(csvData);
      } catch (err) {
        setError("Failed to parse CSV file.");
        setParsedData([]);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!parsedData.length) {
      toast.error("No data to import");
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost('attendance/import', { attendanceData: parsedData });
      
      if (response.isSuccess) {
        toast.success(`${parsedData.length} attendance records imported successfully`);
        onImport?.();
        onClose?.();
      } else {
        toast.error(response.message || "Import failed");
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast.error("Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Upload a CSV file with columns: Employee Name, Email, Department, Date, Check In, Check Out, Status
      </p>

      <label className="w-full border border-gray-300 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition">
        <span className="text-sm text-gray-700">
          {file ? file.name : "Select CSV File"}
        </span>

        <span className="text-xs bg-gray-200 px-3 py-1 rounded-md text-gray-600">
          Browse
        </span>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {parsedData.length > 0 && (
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">
            ✓ {parsedData.length} records ready to import
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleImport} 
          disabled={!parsedData.length || loading}
        >
          {loading ? "Importing..." : "Import"}
        </Button>
      </div>
    </div>
  );
}
